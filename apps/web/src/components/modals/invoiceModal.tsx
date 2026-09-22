'use client';

/**
 * InvoiceModal.tsx
 * Modal de criação de cobrança financeira.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar com sucesso — recarrega a lista
 *
 * Funcionalidades:
 * - Carrega lista de alunos ativos ao abrir
 * - Valida com react-hook-form + zod
 * - Campos numéricos tratados como string e convertidos no onSubmit
 * - Data de vencimento padrão é hoje + 10 dias
 * - Feedback visual de loading durante o envio
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { financeService } from '@/services/finance.service';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types';
import { X, Loader2 } from 'lucide-react';

// Schema de validação — valores numéricos como string para evitar
// incompatibilidade de tipos entre zod v4 e react-hook-form
const invoiceSchema = z.object({
  studentId:    z.string().uuid('Selecione um aluno'),
  description:  z.string().min(3, 'Descrição obrigatória'),
  amount:       z.string().min(1, 'Valor obrigatório'),
  discount:     z.string().optional(),
  dueDate:      z.string().min(1, 'Data de vencimento obrigatória'),
  observations: z.string().optional(),
});

// Tipo inferido do schema
type InvoiceForm = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceModal({ isOpen, onClose, onSuccess }: InvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Lista de alunos carregada da API
  const [students, setStudents] = useState<Student[]>([]);

  /**
   * Calcula a data padrão de vencimento — hoje + 10 dias.
   * Formato ISO YYYY-MM-DD para o input type="date".
   */
  function getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toISOString().split('T')[0];
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      discount: '0',
      dueDate:  getDefaultDueDate(),
    },
  });

  /**
   * Carrega alunos ativos ao abrir o modal.
   * Limpa o formulário com valores padrão ao abrir.
   */
  useEffect(() => {
    if (!isOpen) return;

    async function loadStudents() {
      setIsLoadingData(true);
      try {
        const data = await studentsService.findAll('active');
        setStudents(data);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadStudents();
    reset({
      discount: '0',
      dueDate:  getDefaultDueDate(),
    });
  }, [isOpen, reset]);

  /**
   * onSubmit
   * Converte campos numéricos de string para number
   * antes de enviar para a API.
   */
  async function onSubmit(data: InvoiceForm) {
    setIsLoading(true);
    setError('');

    try {
      // Converte valores monetários de string para number
      const payload = {
        ...data,
        amount:   parseFloat(data.amount),
        discount: data.discount ? parseFloat(data.discount) : 0,
      };

      await financeService.createInvoice(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao criar cobrança');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Nova Cobrança</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading dos dados */}
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Seletor de Aluno */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Aluno <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('studentId')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o aluno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="text-red-400 text-xs mt-1">{errors.studentId.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('description')}
                  placeholder="Ex: Mensalidade Maio/2026"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Valor e Desconto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Valor (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('amount')}
                    type="number"
                    step="0.01"
                    placeholder="99.90"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                  {errors.amount && (
                    <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Desconto (R$)</label>
                  <input
                    {...register('discount')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Data de Vencimento <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dueDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.dueDate.message}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
                <textarea
                  {...register('observations')}
                  placeholder="Informações adicionais sobre a cobrança"
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingData}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Cobrança'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
