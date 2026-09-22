
import axios from 'axios';
/*
 * api.ts
 * Instância global do axios configurada com:
 * - baseURL apontando para o backend NestJS
 * - interceptor que injeta o token JWT em todas as requisições
 * - interceptor de resposta que redireciona para login se token expirar
 */

// Cria instância do axios com a URL base da API
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
});

// Interceptor de requisição — injeta o token JWT no header Authorization
api.interceptors.request.use((config) => {
  // Busca o token salvo no localStorage
  const token = localStorage.getItem('token');

  // Se existir token, adiciona no header de todas as requisições
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta — trata erros globais de autenticação
api.interceptors.response.use(
  // Se a resposta for sucesso, retorna normalmente
  (response) => response,

  // Se a resposta for erro, verifica se é 401 (token expirado/inválido)
  (error) => {
    if (error.response?.status === 401) {
      // Remove token inválido do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redireciona para a página de login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
