'use client';

/**
 * auth.context.tsx
 * Contexto global de autenticação do frontend.
 *
 * Responsável por:
 * - Armazenar o usuário autenticado e o token JWT
 * - Prover funções de login e logout para toda a aplicação
 * - Verificar se o usuário está autenticado ao carregar a página
 * - Redirecionar para login se não autenticado
 */
import {
  createContext, useContext, useState,
  useEffect, ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User } from '@/types';

// Define a estrutura do contexto de autenticação
interface AuthContextType {
  user: User | null;          // usuário autenticado ou null
  token: string | null;       // token JWT ou null
  isLoading: boolean;         // true enquanto verifica autenticação
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Cria o contexto com valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 * Componente que envolve a aplicação e provê o contexto de auth.
 * Deve ser usado no layout raiz da aplicação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Estado do usuário autenticado
  const [user, setUser] = useState<User | null>(null);

  // Estado do token JWT
  const [token, setToken] = useState<string | null>(null);

  // Estado de carregamento inicial
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Ao montar o componente, verifica se há sessão salva no localStorage.
   * Se houver, restaura o usuário e token automaticamente.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Finaliza o carregamento após verificar a sessão
    setIsLoading(false);
  }, []);

  /**
   * login
   * Chama a API de autenticação, salva o token e usuário
   * no localStorage e redireciona para o dashboard.
   */
  async function login(email: string, password: string) {
    const response = await authService.login(email, password);

    // Salva token e usuário no localStorage para persistir a sessão
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Atualiza o estado global
    setToken(response.access_token);
    setUser(response.user);

    // Redireciona para o dashboard após login
    router.push('/dashboard');
  }

  /**
   * logout
   * Remove a sessão do localStorage, limpa o estado
   * e redireciona para a página de login.
   */
  function logout() {
    authService.logout();
    setToken(null);
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth
 * Hook customizado para acessar o contexto de autenticação.
 * Lança erro se usado fora do AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }

  return context;
}
