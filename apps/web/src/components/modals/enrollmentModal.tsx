'use client';

/**
 * EnrollmentModal.tsx
 * Modal de criação de matrícula.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar com sucesso — recarrega a lista
 *
 * Funcionalidades:
 * - Carrega lista de alunos ativos e planos ativos ao abrir
 * - Valida com react-hook-form + zod
 * - Data de vencimento calculada automaticamente no backend
 * - Feedback visual de loading durante o envio
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { enrollmentsService } from '@/services/enrollments.service';
import { studentsService } from '@/services/students.service';
import { plansService } from '@/services/plans.service';
import { Student, Plan } from '@/types';
import { X, Loader2 } from 'lucide-react';

// Schema de validação do formulário de matrícula
const enrollmentSchema = z.object({
  studentId:    z.string().uuid('Selecione um aluno'),
  planId:       z.string().uuid('Selecione um plano'),
  startDate:    z.string().min(1, 'Data de início obrigatória'),
  observations: z.string().optional(),
});

// Tipo inferido do schema
type EnrollmentForm = z.infer<typeof enrollmentSchema>;

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollmentModal({ isOpen, onClose, onSuccess }: EnrollmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Listas de alunos e planos carregadas da API
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      // Data de início padrão é hoje
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  /**
   * Carrega alunos ativos e planos ativos ao abrir o modal.
   * Limpa o formulário ao abrir.
   */
  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setIsLoadingData(true);
      try {
        const [studentsData, plansData] = await Promise.all([
          // Carrega apenas alunos ativos para matrícula
          studentsService.findAll('active'),
          // Carrega apenas planos ativos disponíveis
          plansService.findAll(true),
        ]);
        setStudents(studentsData);
        setPlans(plansData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
    reset({ startDate: new Date().toISOString().split('T')[0] });
  }, [isOpen, reset]);

  /**
   * onSubmit
   * Cria a matrícula vinculando aluno ao plano.
   * A data de vencimento é calculada automaticamente pelo backend.
   */
  async function onSubmit(data: EnrollmentForm) {
    setIsLoading(true);
    setError('');

    try {
      await enrollmentsService.create(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao criar matrícula');
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
          <h2 className="text-white font-semibold text-lg">Nova Matrícula</h2>
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

              {/* Seletor de Plano */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Plano <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('planId')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o plano...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                {errors.planId && (
                  <p className="text-red-400 text-xs mt-1">{errors.planId.message}</p>
                )}
              </div>

              {/* Data de Início */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Data de Início <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.startDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
                <textarea
                  {...register('observations')}
                  placeholder="Informações adicionais sobre a matrícula"
                  rows={3}
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
                'Criar Matrícula'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
