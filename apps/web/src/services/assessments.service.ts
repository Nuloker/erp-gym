/**
 * assessments.service.ts
 * Responsável pelas chamadas HTTP do módulo de avaliações físicas.
 */
import { api } from '@/lib/api';
import { PhysicalAssessment } from '@/types';

export const assessmentsService = {
  /** Lista todas as avaliações do tenant */
  async findAll(): Promise<PhysicalAssessment[]> {
    const { data } = await api.get('/assessments');
    return data;
  },

  /** Lista avaliações de um aluno específico */
  async findByStudent(studentId: string): Promise<PhysicalAssessment[]> {
    const { data } = await api.get('/assessments/student/' + studentId);
    return data;
  },

  /** Busca uma avaliação por ID */
  async findOne(id: string): Promise<PhysicalAssessment> {
    const { data } = await api.get('/assessments/' + id);
    return data;
  },

  /** Cria uma nova avaliação física */
  async create(payload: Partial<PhysicalAssessment>): Promise<PhysicalAssessment> {
    const { data } = await api.post('/assessments', payload);
    return data;
  },

  /** Atualiza uma avaliação existente */
  async update(id: string, payload: Partial<PhysicalAssessment>): Promise<PhysicalAssessment> {
    const { data } = await api.patch('/assessments/' + id, payload);
    return data;
  },

  /** Remove uma avaliação */
  async remove(id: string): Promise<void> {
    await api.delete('/assessments/' + id);
  },
};
