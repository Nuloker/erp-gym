'use client';

/**
 * WorkoutExerciseModal.tsx
 * Modal para adicionar ou editar exercício em uma ficha.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { workoutsService } from '@/services/workouts.service';
import { WorkoutExercise } from '@/types';
import { X, Loader2 } from 'lucide-react';

const schema = z.object({
  name:         z.string().min(2, 'Nome do exercício obrigatório'),
  muscleGroup:  z.string().optional(),
  sets:         z.string().optional(),
  reps:         z.string().optional(),
  load:         z.string().optional(),
  restSeconds:  z.string().optional(),
  order:        z.string().optional(),
  observations: z.string().optional(),
});

type ExerciseForm = z.infer<typeof schema>;

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Pernas', 'Glúteos', 'Abdômen', 'Panturrilha', 'Full Body', 'Outro',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workoutPlanId: string;
  exercise?: WorkoutExercise | null;
}

export function WorkoutExerciseModal({ isOpen, onClose, onSuccess, workoutPlanId, exercise }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExerciseForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (exercise) {
      reset({
        name:         exercise.name,
        muscleGroup:  exercise.muscleGroup ?? '',
        sets:         exercise.sets?.toString() ?? '',
        reps:         exercise.reps ?? '',
        load:         exercise.load?.toString() ?? '',
        restSeconds:  exercise.restSeconds?.toString() ?? '',
        order:        exercise.order?.toString() ?? '0',
        observations: exercise.observations ?? '',
      });
    } else {
      reset({ order: '0' });
    }
  }, [exercise, reset]);

  async function onSubmit(data: ExerciseForm) {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        workoutPlanId,
        name:         data.name,
        muscleGroup:  data.muscleGroup || undefined,
        sets:         data.sets ? parseInt(data.sets) : undefined,
        reps:         data.reps || undefined,
        load:         data.load ? parseFloat(data.load) : undefined,
        restSeconds:  data.restSeconds ? parseInt(data.restSeconds) : undefined,
        order:        data.order ? parseInt(data.order) : 0,
        observations: data.observations || undefined,
      };

      if (exercise) {
        await workoutsService.updateExercise(exercise.id, payload);
      } else {
        await workoutsService.createExercise(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar exercício');
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
            {exercise ? 'Editar Exercício' : 'Novo Exercício'}
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

          {/* Nome e Grupo Muscular */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Exercício <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Ex: Supino Reto"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Grupo Muscular</label>
              <select
                {...register('muscleGroup')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Séries, Repetições e Carga */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Séries</label>
              <input
                {...register('sets')}
                type="number"
                min="1"
                placeholder="4"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Repetições</label>
              <input
                {...register('reps')}
                placeholder="8-12"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Carga (kg)</label>
              <input
                {...register('load')}
                type="number"
                min="0"
                step="0.5"
                placeholder="80"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Descanso e Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Descanso (seg)</label>
              <input
                {...register('restSeconds')}
                type="number"
                min="0"
                placeholder="60"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Ordem</label>
              <input
                {...register('order')}
                type="number"
                min="0"
                placeholder="1"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
            <textarea
              {...register('observations')}
              placeholder="Ex: Manter escápulas retraídas"
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
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : exercise ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
