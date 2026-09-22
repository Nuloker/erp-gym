/**
 * classes.service.ts
 * Responsável por todas as chamadas HTTP do módulo de turmas e aulas.
 *
 * Organizado em 4 seções:
 * - Modalidades: tipos de atividade (Funcional, Spinning, etc.)
 * - Turmas: grupos de alunos por modalidade
 * - Horários: agenda recorrente de cada turma
 * - Inscrições: alunos matriculados em cada turma
 */
import { api } from '@/lib/api';

// ── TIPOS ────────────────────────────────────────────────

export interface Modality {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClassSchedule {
  id: string;
  classGroupId: string;
  dayOfWeek: number;   // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  startTime: string;   // formato HH:mm
  endTime: string;     // formato HH:mm
}

export interface ClassEnrollment {
  id: string;
  classGroupId: string;
  studentId: string;
  isActive: boolean;
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ClassGroup {
  id: string;
  tenantId: string;
  modalityId: string;
  teacherId?: string;
  name: string;
  maxCapacity: number;
  isActive: boolean;
  observations?: string;
  modality?: Modality;
  teacher?: { id: string; name: string };
  schedules?: ClassSchedule[];
  enrollments?: ClassEnrollment[];
  createdAt: string;
}

// ── MODALIDADES ──────────────────────────────────────────

export const classesService = {
  /**
   * Lista todas as modalidades do tenant.
   * Filtra por isActive se informado.
   */
  async updateModality(id: string, payload: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Modality> {
    const { data } = await api.patch(`/classes/modalities/${id}`, payload);
    return data;
  },

  /**
   * Cria uma nova modalidade.
   */
  async createModality(payload: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Modality> {
    const { data } = await api.post('/classes/modalities', payload);
    return data;
  },

  async  findAllModalities(): Promise<Modality[]> {
  const { data } = await api.get('/classes/modalities');
  return data;
  },

  /**
   * Remove uma modalidade com soft delete.
   */
  async removeModality(id: string): Promise<void> {
    await api.delete(`/classes/modalities/${id}`);
  },

  // ── TURMAS ─────────────────────────────────────────────

  /**
   * Lista todas as turmas do tenant com modalidade,
   * professor e horários vinculados.
   */
  async findAllClassGroups(): Promise<ClassGroup[]> {
    const { data } = await api.get('/classes/groups');
    return data;
  },

  /**
   * Busca uma turma específica com todos os detalhes.
   */
  async findOneClassGroup(id: string): Promise<ClassGroup> {
    const { data } = await api.get(`/classes/groups/${id}`);
    return data;
  },

  /**
   * Cria uma nova turma vinculada a uma modalidade.
   */
  async createClassGroup(payload: {
    modalityId: string;
    teacherId?: string;
    name: string;
    maxCapacity?: number;
    isActive?: boolean;
    observations?: string;
  }): Promise<ClassGroup> {
    const { data } = await api.post('/classes/groups', payload);
    return data;
  },

  /**
   * Atualiza dados de uma turma existente.
   */
  async updateClassGroup(id: string, payload: Partial<ClassGroup>): Promise<ClassGroup> {
    const { data } = await api.patch(`/classes/groups/${id}`, payload);
    return data;
  },

  /**
   * Remove uma turma com soft delete.
   */
  async removeClassGroup(id: string): Promise<void> {
    await api.delete(`/classes/groups/${id}`);
  },

  // ── HORÁRIOS ───────────────────────────────────────────

  /**
   * Adiciona um horário recorrente a uma turma.
   */
  async createSchedule(payload: {
    classGroupId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<ClassSchedule> {
    const { data } = await api.post('/classes/schedules', payload);
    return data;
  },

  /**
   * Remove um horário de uma turma.
   */
  async removeSchedule(id: string): Promise<void> {
    await api.delete(`/classes/schedules/${id}`);
  },

  // ── INSCRIÇÕES ─────────────────────────────────────────

  /**
   * Inscreve um aluno em uma turma.
   */
  async enrollStudent(classGroupId: string, studentId: string): Promise<ClassEnrollment> {
    const { data } = await api.post(`/classes/groups/${classGroupId}/enroll`, { studentId });
    return data;
  },

  /**
   * Remove a inscrição de um aluno de uma turma.
   */
  async unenrollStudent(classGroupId: string, studentId: string): Promise<void> {
    await api.delete(`/classes/groups/${classGroupId}/unenroll/${studentId}`);
  },
};
