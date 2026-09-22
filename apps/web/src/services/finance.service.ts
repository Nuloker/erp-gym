/**
 * finance.service.ts
 * Responsável pelas chamadas HTTP do módulo financeiro.
 * Gerencia cobranças (invoices) e pagamentos (payments).
 */
import { api } from '@/lib/api';
import { Invoice, Payment } from '@/types';

export const financeService = {
  /** Lista cobranças com filtros opcionais por status e aluno */
  async findAllInvoices(status?: string, studentId?: string): Promise<Invoice[]> {
    const { data } = await api.get('/finance/invoices', {
      params: { status, studentId },
    });
    return data;
  },

  /** Busca uma cobrança específica com seus pagamentos */
  async findOneInvoice(id: string): Promise<Invoice> {
    const { data } = await api.get(`/finance/invoices/${id}`);
    return data;
  },

  /** Cria uma nova cobrança manualmente */
  async createInvoice(payload: {
    studentId: string;
    enrollmentId?: string;
    description: string;
    amount: number;
    discount?: number;
    dueDate: string;
    observations?: string;
  }): Promise<Invoice> {
    const { data } = await api.post('/finance/invoices', payload);
    return data;
  },

  /** Atualiza dados de uma cobrança */
  async updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.patch(`/finance/invoices/${id}`, payload);
    return data;
  },

  /** Registra um pagamento em uma cobrança */
  async createPayment(payload: {
    invoiceId: string;
    amount: number;
    method: string;
    paymentDate: string;
    observations?: string;
  }): Promise<Payment> {
    const { data } = await api.post('/finance/payments', payload);
    return data;
  },

  /** Lista pagamentos de uma cobrança específica */
  async findPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    const { data } = await api.get(`/finance/payments/invoice/${invoiceId}`);
    return data;
  },

  /** Retorna resumo financeiro para o dashboard */
  async getSummary() {
    const { data } = await api.get('/finance/invoices/summary');
    return data;
  },
};
