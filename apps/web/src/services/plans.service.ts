/**
 * plans.service.ts
 * Responsável pelas chamadas HTTP do módulo de planos.
 */
import { api } from '@/lib/api';
import { Plan } from '@/types';

export const plansService = {
  /** Lista todos os planos — filtra por isActive se informado */
  async findAll(isActive?: boolean): Promise<Plan[]> {
    const { data } = await api.get('/plans', { params: { isActive } });
    return data;
  },

  /** Busca um plano específico pelo ID */
  async findOne(id: string): Promise<Plan> {
    const { data } = await api.get(`/plans/${id}`);
    return data;
  },

  /** Cria um novo plano */
  async create(payload: Partial<Plan>): Promise<Plan> {
    const { data } = await api.post('/plans', payload);
    return data;
  },

  /** Atualiza dados de um plano existente */
  async update(id: string, payload: Partial<Plan>): Promise<Plan> {
    const { data } = await api.patch(`/plans/${id}`, payload);
    return data;
  },

  /** Remove um plano com soft delete */
  async remove(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};
/*[browser] Erro ao carregar dados: AxiosError: Request failed with status code 403
    at async Object.findAll (src/services/plans.service.ts:11:22)
    at async loadData (src/components/modals/enrollmentModal.tsx:77:43)
   9 |   //Lista todos os planos — filtra por isActive se informado
  10 |   async findAll(isActive?: boolean): Promise<Plan[]> {
> 11 |     const { data } = await api.get('/plans', { params: { isActive } });
     |                      ^
  12 |     return data;
  13 |   },
  14 | (src/components/modals/enrollmentModal.tsx:86:17) */
