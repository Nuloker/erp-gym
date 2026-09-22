/**
 * students.service.ts
 * Responsável pelas chamadas HTTP do módulo de alunos.
 * CRUD completo com filtros por status.
 */
import { api } from '@/lib/api';
import { Student } from '@/types';

export const studentsService = {
  /** Lista todos os alunos — filtra por status ou busca por nome */
  async findAll(statusOrSearch?: string): Promise<Student[]> {
    const { data } = await api.get('/students', {
      params: {
        status: statusOrSearch,
        search: statusOrSearch
      }
    });
    return data;
  },

  /** Busca um aluno específico pelo ID */
  async findOne(id: string): Promise<Student> {
    const { data } = await api.get(`/students/${id}`);
    return data;
  },

  /** Cria um novo aluno */
  async create(payload: Partial<Student>): Promise<Student> {
    const { data } = await api.post('/students', payload);
    return data;
  },

  /** Atualiza dados de um aluno existente */
  async update(id: string, payload: Partial<Student>): Promise<Student> {
    const { data } = await api.patch(`/students/${id}`, payload);
    return data;
  },

  /** Remove um aluno com soft delete */
  async remove(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};
