'use client';

/**
 * WorkoutPlanModal.tsx
 * Modal de criação e edição de ficha de treino.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { workoutsService } from '@/services/workouts.service';
import { studentsService } from '@/services/students.service';
import { WorkoutPlan, Student } from '@/types';
import { X, Loader2 } from 'lucide-react';

const schema = z.object({
  studentId:    z.string().uuid('Aluno obrigatório'),
  teacherId:    z.string().optional(),
  name:         z.string().min(2, 'Nome obrigatório'),
  description:  z.string().optional(),
  division:     z.string().optional(),
  isActive:     z.boolean().optional(),
  observations: z.string().optional(),
});

type WorkoutPlanForm = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: WorkoutPlan | null;
  // Se aberto a partir da página de aluno, fixa o studentId
  preselectedStudentId?: string;
}

export function WorkoutPlanModal({ isOpen, onClose, onSuccess, plan, preselectedStudentId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkoutPlanForm>({
    resolver: zodResolver(schema),
  });

  // Carrega lista de alunos para o select
  useEffect(() => {
    if (isOpen) {
      studentsService.findAll('active').then(setStudents).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (plan) {
      reset({
        studentId:    plan.studentId,
        teacherId:    plan.teacherId ?? '',
        name:         plan.name,
        description:  plan.description ?? '',
        division:     plan.division ?? '',
        isActive:     plan.isActive,
        observations: plan.observations ?? '',
      });
    } else {
      reset({
        studentId: preselectedStudentId ?? '',
        isActive: true,
      });
    }
  }, [plan, preselectedStudentId, reset]);

  async function onSubmit(data: WorkoutPlanForm) {
    setIsLoading(true);
    setError('');
    try {
      if (plan) {
        await workoutsService.updatePlan(plan.id, data);
      } else {
        await workoutsService.createPlan(data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar ficha');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {plan ? 'Editar Ficha' : 'Nova Ficha de Treino'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Aluno */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Aluno <span className="text-red-400">*</span>
            </label>
            <select
              {...register('studentId')}
              disabled={!!preselectedStudentId}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Selecione o aluno...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId.message}</p>}
          </div>

          {/* Nome da ficha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nome da Ficha <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Divisão e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Divisão</label>
              <input
                {...register('division')}
                placeholder="Ex: A, B, C ou Seg/Qua/Sex"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                {...register('isActive', { setValueAs: v => v === 'true' || v === true })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              placeholder="Objetivo ou foco do treino"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
            <textarea
              {...register('observations')}
              placeholder="Instruções gerais, frequência, etc."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

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
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : plan ? 'Salvar Alterações' : 'Criar Ficha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
