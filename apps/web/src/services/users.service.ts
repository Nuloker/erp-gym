/**
 * users.service.ts
 * Responsável pelas chamadas HTTP do módulo de usuários internos.
 */
import { api } from '@/lib/api';
import { InternalUser, UserRole } from '@/types';

export const usersService = {
  /** Lista todos os usuários do tenant */
  async findAll(): Promise<InternalUser[]> {
    const { data } = await api.get('/users');
    return data;
  },

  /** Busca um usuário por ID */
  async findOne(id: string): Promise<InternalUser> {
    const { data } = await api.get('/users/' + id);
    return data;
  },

  /** Cria um novo usuário interno */
  async create(payload: {
    name:               string;
    email:              string;
    password:           string;
    role:               UserRole;
    mustChangePassword?: boolean;
    isActive?:          boolean;
  }): Promise<InternalUser> {
    const { data } = await api.post('/users', payload);
    return data;
  },

  /** Atualiza dados de um usuário */
  async update(id: string, payload: Partial<InternalUser>): Promise<InternalUser> {
    const { data } = await api.patch('/users/' + id, payload);
    return data;
  },

  /** Reseta a senha de um usuário */
  async resetPassword(id: string, password: string): Promise<void> {
    await api.patch('/users/' + id + '/reset-password', { password });
  },

  /** Remove um usuário com soft delete */
  async remove(id: string): Promise<void> {
    await api.delete('/users/' + id);
  },
};
