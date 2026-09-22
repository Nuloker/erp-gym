'use client';

/**
 * AssessmentModal.tsx
 * Modal de criação e edição de avaliação física.
 *
 * Props:
 * - isOpen: controla visibilidade
 * - onClose: fecha o modal
 * - onSuccess: recarrega a lista após salvar
 * - assessment: se informado, abre em modo edição
 * - preselectedStudentId: fixa o aluno quando aberto da página de detalhe
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assessmentsService } from '@/services/assessments.service';
import { studentsService } from '@/services/students.service';
import { PhysicalAssessment, Student } from '@/types';
import { X, Loader2 } from 'lucide-react';

// ── Schema de validação ──────────────────────────────────
const schema = z.object({
  studentId:               z.string().uuid('Aluno obrigatório'),
  assessmentDate:          z.string().min(1, 'Data obrigatória'),
  // Medidas principais — string no form, convertidas no submit
  weight:                  z.string().optional(),
  height:                  z.string().optional(),
  bodyFatPercentage:       z.string().optional(),
  weightGoal:              z.string().optional(),
  // Circunferências
  neckCircumference:       z.string().optional(),
  chestCircumference:      z.string().optional(),
  waistCircumference:      z.string().optional(),
  hipCircumference:        z.string().optional(),
  rightArmCircumference:   z.string().optional(),
  leftArmCircumference:    z.string().optional(),
  rightThighCircumference: z.string().optional(),
  leftThighCircumference:  z.string().optional(),
  rightCalfCircumference:  z.string().optional(),
  leftCalfCircumference:   z.string().optional(),
  // Observações
  observations:            z.string().optional(),
});

type AssessmentForm = z.infer<typeof schema>;

interface Props {
  isOpen:                boolean;
  onClose:               () => void;
  onSuccess:             () => void;
  assessment?:           PhysicalAssessment | null;
  preselectedStudentId?: string;
}

// Helper — converte string para número ou undefined
function toNum(val?: string): number | undefined {
  if (!val || val.trim() === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

// Helper — formata data para o input date (YYYY-MM-DD)
function toDateInput(val?: string): string {
  if (!val) return '';
  return val.substring(0, 10);
}

export function AssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  assessment,
  preselectedStudentId,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [students, setStudents]   = useState<Student[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentForm>({ resolver: zodResolver(schema) });

  // Carrega alunos para o select
  useEffect(() => {
    if (isOpen) {
      studentsService.findAll('active').then(setStudents).catch(() => {});
    }
  }, [isOpen]);

  // Preenche formulário ao editar
  useEffect(() => {
    if (assessment) {
      reset({
        studentId:               assessment.studentId,
        assessmentDate:          toDateInput(assessment.assessmentDate),
        weight:                  assessment.weight?.toString() ?? '',
        height:                  assessment.height?.toString() ?? '',
        bodyFatPercentage:       assessment.bodyFatPercentage?.toString() ?? '',
        weightGoal:              assessment.weightGoal?.toString() ?? '',
        neckCircumference:       assessment.neckCircumference?.toString() ?? '',
        chestCircumference:      assessment.chestCircumference?.toString() ?? '',
        waistCircumference:      assessment.waistCircumference?.toString() ?? '',
        hipCircumference:        assessment.hipCircumference?.toString() ?? '',
        rightArmCircumference:   assessment.rightArmCircumference?.toString() ?? '',
        leftArmCircumference:    assessment.leftArmCircumference?.toString() ?? '',
        rightThighCircumference: assessment.rightThighCircumference?.toString() ?? '',
        leftThighCircumference:  assessment.leftThighCircumference?.toString() ?? '',
        rightCalfCircumference:  assessment.rightCalfCircumference?.toString() ?? '',
        leftCalfCircumference:   assessment.leftCalfCircumference?.toString() ?? '',
        observations:            assessment.observations ?? '',
      });
    } else {
      reset({
        studentId:      preselectedStudentId ?? '',
        assessmentDate: new Date().toISOString().substring(0, 10),
      });
    }
  }, [assessment, preselectedStudentId, reset, isOpen]);

  async function onSubmit(data: AssessmentForm) {
    setIsLoading(true);
    setError('');
    try {
      // Converte strings para números antes de enviar
      const payload = {
        studentId:               data.studentId,
        assessmentDate:          data.assessmentDate,
        weight:                  toNum(data.weight),
        height:                  toNum(data.height),
        bodyFatPercentage:       toNum(data.bodyFatPercentage),
        weightGoal:              toNum(data.weightGoal),
        neckCircumference:       toNum(data.neckCircumference),
        chestCircumference:      toNum(data.chestCircumference),
        waistCircumference:      toNum(data.waistCircumference),
        hipCircumference:        toNum(data.hipCircumference),
        rightArmCircumference:   toNum(data.rightArmCircumference),
        leftArmCircumference:    toNum(data.leftArmCircumference),
        rightThighCircumference: toNum(data.rightThighCircumference),
        leftThighCircumference:  toNum(data.leftThighCircumference),
        rightCalfCircumference:  toNum(data.rightCalfCircumference),
        leftCalfCircumference:   toNum(data.leftCalfCircumference),
        observations:            data.observations || undefined,
      };

      if (assessment) {
        await assessmentsService.update(assessment.id, payload);
      } else {
        await assessmentsService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar avaliação');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  // ── Helpers de campo ─────────────────────────────────────
  const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-semibold text-lg">
            {assessment ? 'Editar Avaliação' : 'Nova Avaliação Física'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

          {/* Erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ── Aluno e Data ─────────────────────────────── */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 pb-2 border-b border-gray-800">
              Identificação
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Aluno <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('studentId')}
                  disabled={!!preselectedStudentId}
                  className={inputClass + ' disabled:opacity-50'}
                >
                  <option value="">Selecione o aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="text-red-400 text-xs mt-1">{errors.studentId.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Data da Avaliação <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('assessmentDate')}
                  type="date"
                  className={inputClass}
                />
                {errors.assessmentDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.assessmentDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Medidas Principais ───────────────────────── */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 pb-2 border-b border-gray-800">
              Medidas Principais
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Peso (kg)</label>
                <input
                  {...register('weight')}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="75.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Altura (cm)</label>
                <input
                  {...register('height')}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="175.0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>% Gordura</label>
                <input
                  {...register('bodyFatPercentage')}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="18.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Meta de Peso (kg)</label>
                <input
                  {...register('weightGoal')}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="70.0"
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              IMC, massa gorda e massa magra são calculados automaticamente pelo sistema.
            </p>
          </div>

          {/* ── Circunferências ──────────────────────────── */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 pb-2 border-b border-gray-800">
              Circunferências (cm)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Pescoço</label>
                <input {...register('neckCircumference')} type="number" step="0.1" min="0" placeholder="38.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tórax</label>
                <input {...register('chestCircumference')} type="number" step="0.1" min="0" placeholder="95.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cintura</label>
                <input {...register('waistCircumference')} type="number" step="0.1" min="0" placeholder="80.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quadril</label>
                <input {...register('hipCircumference')} type="number" step="0.1" min="0" placeholder="95.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Braço D</label>
                <input {...register('rightArmCircumference')} type="number" step="0.1" min="0" placeholder="32.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Braço E</label>
                <input {...register('leftArmCircumference')} type="number" step="0.1" min="0" placeholder="31.5" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Coxa D</label>
                <input {...register('rightThighCircumference')} type="number" step="0.1" min="0" placeholder="55.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Coxa E</label>
                <input {...register('leftThighCircumference')} type="number" step="0.1" min="0" placeholder="54.5" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Panturrilha D</label>
                <input {...register('rightCalfCircumference')} type="number" step="0.1" min="0" placeholder="36.0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Panturrilha E</label>
                <input {...register('leftCalfCircumference')} type="number" step="0.1" min="0" placeholder="35.5" className={inputClass} />
              </div>
            </div>
          </div>

          {/* ── Observações ──────────────────────────────── */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 pb-2 border-b border-gray-800">
              Observações
            </h3>
            <textarea
              {...register('observations')}
              placeholder="Observações do avaliador sobre a evolução do aluno..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
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
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
                : assessment ? 'Salvar Alterações' : 'Criar Avaliação'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
