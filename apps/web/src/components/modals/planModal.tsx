'use client';

/**
 * PlanModal.tsx
 * Modal de criação e edição de plano.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar com sucesso — recarrega a lista
 * - plan: se informado, abre em modo edição com dados preenchidos
 *
 * Funcionalidades:
 * - Validação com react-hook-form + zod
 * - Campos numéricos tratados como string no schema e convertidos no onSubmit
 * - Dias preenchidos automaticamente ao selecionar o tipo de duração
 * - Feedback visual de loading durante o envio
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plansService } from '@/services/plans.service';
import { Plan } from '@/types';
import { X, Loader2 } from 'lucide-react';

/**
 * Schema de validação do formulário de plano.
 * Campos numéricos são tratados como string aqui
 * e convertidos para number no onSubmit.
 * Isso evita incompatibilidade de tipos com zod v4 + react-hook-form.
 */
const planSchema = z.object({
  name:          z.string().min(2, 'Nome obrigatório'),
  description:   z.string().optional(),
  price:         z.string().min(1, 'Preço obrigatório'),
  duration:      z.enum(['monthly', 'quarterly', 'semiannual', 'annual', 'custom']),
  durationDays:  z.string(),
  enrollmentFee: z.string().optional(),
  accessLimit:   z.string().optional(),
  isActive:      z.boolean().optional(),
});

// Tipo inferido do schema
type PlanForm = z.infer<typeof planSchema>;

// Dias padrão por tipo de duração — preenchido automaticamente ao selecionar
const durationDaysMap: Record<string, string> = {
  monthly:    '30',
  quarterly:  '90',
  semiannual: '180',
  annual:     '365',
  custom:     '30',
};

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: Plan | null; // se informado, modo edição
}

export function PlanModal({ isOpen, onClose, onSuccess, plan }: PlanModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      duration:      'monthly',
      durationDays:  '30',
      enrollmentFee: '0',
      accessLimit:   '0',
      isActive:      true,
    },
  });

  // Observa o campo duration para atualizar durationDays automaticamente
  const selectedDuration = watch('duration');

  /**
   * Quando o tipo de duração muda, atualiza os dias automaticamente
   * apenas se não for plano customizado.
   */
  useEffect(() => {
    if (selectedDuration !== 'custom') {
      setValue('durationDays', durationDaysMap[selectedDuration]);
    }
  }, [selectedDuration, setValue]);

  /**
   * Preenche o formulário ao abrir em modo edição.
   * Limpa ao abrir em modo criação.
   */
  useEffect(() => {
    if (plan) {
      reset({
        name:          plan.name,
        description:   plan.description ?? '',
        price:         String(plan.price),
        duration:      plan.duration,
        durationDays:  String(plan.durationDays),
        enrollmentFee: String(plan.enrollmentFee),
        accessLimit:   String(plan.accessLimit),
        isActive:      plan.isActive,
      });
    } else {
      reset({
        duration:      'monthly',
        durationDays:  '30',
        enrollmentFee: '0',
        accessLimit:   '0',
        isActive:      true,
      });
    }
  }, [plan, reset]);

  /**
   * onSubmit
   * Converte campos numéricos de string para number
   * antes de enviar para a API.
   */
  async function onSubmit(data: PlanForm) {
    setIsLoading(true);
    setError('');

    try {
      // Converte campos numéricos de string para number
      const payload = {
        ...data,
        price:         parseFloat(data.price),
        durationDays:  parseInt(data.durationDays),
        enrollmentFee: data.enrollmentFee ? parseFloat(data.enrollmentFee) : 0,
        accessLimit:   data.accessLimit ? parseInt(data.accessLimit) : 0,
      };

      if (plan) {
        await plansService.update(plan.id, payload);
      } else {
        await plansService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar plano');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h2>
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

          {/* Nome do plano */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ex: Plano Mensal, Plano Anual VIP"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              placeholder="Descreva o que está incluso no plano"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Preço e Duração */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Preço (R$) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                placeholder="99.90"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Duração</label>
              <select
                {...register('duration')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>

          {/* Dias e Taxa de Matrícula */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Dias do Plano
              </label>
              <input
                {...register('durationDays')}
                type="number"
                readOnly={selectedDuration !== 'custom'}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Taxa de Matrícula (R$)</label>
              <input
                {...register('enrollmentFee')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Limite de acessos e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Limite de Acessos <span className="text-gray-500 text-xs">(0 = ilimitado)</span>
              </label>
              <input
                {...register('accessLimit')}
                type="number"
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Plano ativo</span>
              </label>
            </div>
          </div>

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
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                plan ? 'Salvar Alterações' : 'Criar Plano'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
