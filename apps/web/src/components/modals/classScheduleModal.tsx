'use client';

/**
 * classScheduleModal.tsx
 * Modal para adicionar horário recorrente a uma turma.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar
 * - onSuccess: função chamada após salvar — recarrega a turma
 * - classGroupId: ID da turma que receberá o horário
 *
 * Funcionalidades:
 * - Seletor de dia da semana (Segunda a Sábado)
 * - Campos de hora início e fim no formato HH:mm
 * - Validação com react-hook-form + zod
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { classesService } from '@/services/classes.service';
import { X, Loader2 } from 'lucide-react';

// Schema de validação do formulário de horário
const scheduleSchema = z.object({
  dayOfWeek: z.string().min(1, 'Selecione o dia'),
  startTime: z.string().min(1, 'Hora início obrigatória'),
  endTime:   z.string().min(1, 'Hora fim obrigatória'),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

// Labels dos dias da semana
const dayLabels = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

interface ClassScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classGroupId: string;
}

export function ClassScheduleModal({ isOpen, onClose, onSuccess, classGroupId }: ClassScheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

  // Limpa o formulário ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      reset({});
      setError('');
    }
  }, [isOpen, reset]);

  /**
   * onSubmit
   * Converte dayOfWeek de string para number
   * e cria o horário para a turma.
   */
  async function onSubmit(data: ScheduleForm) {
    setIsLoading(true);
    setError('');

    try {
      await classesService.createSchedule({
        classGroupId,
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime:   data.endTime,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao adicionar horário');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Adicionar Horário</h2>
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

          {/* Dia da semana */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Dia da Semana <span className="text-red-400">*</span>
            </label>
            <select
              {...register('dayOfWeek')}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o dia...</option>
              {dayLabels.map((day) => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
            {errors.dayOfWeek && <p className="text-red-400 text-xs mt-1">{errors.dayOfWeek.message}</p>}
          </div>

          {/* Hora início e fim */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Hora Início <span className="text-red-400">*</span>
              </label>
              <input
                {...register('startTime')}
                type="time"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Hora Fim <span className="text-red-400">*</span>
              </label>
              <input
                {...register('endTime')}
                type="time"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime.message}</p>}
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
                <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
              ) : (
                'Adicionar Horário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
