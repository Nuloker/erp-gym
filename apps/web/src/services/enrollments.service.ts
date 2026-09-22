/**
 * enrollments.service.ts
 * Responsável pelas chamadas HTTP do módulo de matrículas.
 */
import { api } from '@/lib/api';
import { Enrollment } from '@/types';

export const enrollmentsService = {
  /** Lista todas as matrículas — filtra por status se informado */
  async findAll(status?: string): Promise<Enrollment[]> {
    const { data } = await api.get('/enrollments', { params: { status } });
    return data;
  },

  /** Busca uma matrícula específica pelo ID */
  async findOne(id: string): Promise<Enrollment> {
    const { data } = await api.get(`/enrollments/${id}`);
    return data;
  },

  /** Lista todas as matrículas de um aluno específico */
  async findByStudent(studentId: string): Promise<Enrollment[]> {
    const { data } = await api.get(`/enrollments/student/${studentId}`);
    return data;
  },

  /** Cria uma nova matrícula vinculando aluno a um plano */
  async create(payload: {
  studentId: string;
  planId: string;
  startDate: string;
  observations?: string;
  }): Promise<Enrollment> {
    const { data } = await api.post('/enrollments', payload);
    return data;
  },

  /** Atualiza dados de uma matrícula existente */
  async update(id: string, payload: Partial<Enrollment>): Promise<Enrollment> {
    const { data } = await api.patch(`/enrollments/${id}`, payload);
    return data;
  },

  /** Cancela uma matrícula com motivo obrigatório */
  async cancel(id: string, reason: string): Promise<Enrollment> {
    const { data } = await api.patch(`/enrollments/${id}/cancel`, { reason });
    return data;
  },
};
