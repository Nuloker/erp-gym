/**
 * auth.service.ts
 * Responsável pelas chamadas HTTP relacionadas à autenticação.
 * Login, logout e verificação de sessão.
 */
import { api } from '@/lib/api';
import { AuthResponse } from '@/types';

export const authService = {
  /**
   * Realiza o login enviando email e senha para a API.
   * Retorna o token JWT e os dados do usuário autenticado.
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  /**
   * Remove token e dados do usuário do localStorage.
   * Usado ao clicar em "Sair" no menu.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
