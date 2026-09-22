/**
 * dashboard.service.ts
 * Responsável pelas chamadas HTTP do módulo de dashboard.
 */
import { api } from '@/lib/api';
import { DashboardSummary } from '@/types';

export const dashboardService = {
  /** Retorna todos os indicadores gerenciais do tenant */
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get('/dashboard/summary');
    return data;
  },
};
