/**
 * audit.service.ts
 * Responsável pelas chamadas HTTP do módulo de auditoria.
 */
import { api } from '@/lib/api';

export interface AuditLog {
  id:           string;
  tenantId:     string;
  userId:       string;
  userEmail:    string;
  method:       string;
  route:        string;
  action:       string;
  statusCode:   number;
  payload?:     string;
  errorMessage?: string;
  ipAddress:    string;
  duration:     number;
  createdAt:    string;
}

export interface AuditLogsResponse {
  logs:  AuditLog[];
  total: number;
}

export const auditService = {
  /** Lista logs de auditoria com paginação */
  async findAll(limit = 100, offset = 0): Promise<AuditLogsResponse> {
    const { data } = await api.get('/audit/logs', {
      params: { limit, offset },
    });
    return data;
  },

  /** Lista meus próprios logs */
  async findMine(): Promise<AuditLog[]> {
    const { data } = await api.get('/audit/logs/me');
    return data;
  },
};
