/**
 * attendance.service.ts
 * Responsável pelas chamadas HTTP do módulo de presença.
 */
import { api } from '@/lib/api';
import { Attendance } from '@/types';

export const attendanceService = {
  /** Lista check-ins com filtros opcionais */
  async findAll(studentId?: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const { data } = await api.get('/attendance', {
      params: { studentId, startDate, endDate },
    });
    return data;
  },

  /** Retorna histórico de frequência de um aluno */
  async findByStudent(studentId: string) {
    const { data } = await api.get(`/attendance/student/${studentId}`);
    return data;
  },

  /** Registra um check-in de aluno */
  async create(payload: {
    studentId: string;
    checkedInAt?: string;
    observations?: string;
  }): Promise<Attendance> {
    const { data } = await api.post('/attendance', payload);
    return data;
  },
};
