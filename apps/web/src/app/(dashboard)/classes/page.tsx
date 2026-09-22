'use client';

/**
 * classes/page.tsx
 * Página de gestão de turmas, aulas e modalidades.
 *
 * Layout:
 * - Duas abas: "Turmas" e "Modalidades"
 *
 * Aba Turmas:
 * - Lista de turmas em cards expansíveis (accordion)
 * - Cada card exibe modalidade, professor, capacidade e horários
 * - Alunos inscritos visíveis ao expandir
 * - Ações: criar turma, editar, remover, gerenciar horários e alunos
 *
 * Aba Modalidades:
 * - Lista de modalidades em cards simples
 * - Ações: criar, remover modalidade
 */
import { useEffect, useState, useCallback } from 'react';
import { classesService, ClassGroup, ClassSchedule, ClassEnrollment, Modality } from '@/services/classes.service';
import { ClassGroupModal } from '@/components/modals/classGroupModal';
import { ClassScheduleModal } from '@/components/modals/classScheduleModal';
import { ClassEnrollmentModal } from '@/components/modals/classEnrollmentModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import {
  Plus, Loader2, Calendar, ChevronDown, ChevronUp,
  Pencil, Trash2, Users, Clock, CheckCircle, XCircle,
  Dumbbell, X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Mapeamento de dias da semana (0=Dom ... 6=Sáb)
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ── Schema do mini-formulário de modalidade ──────────────
const modalitySchema = z.object({
  name:        z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
});
type ModalityForm = z.infer<typeof modalitySchema>;

// ── Modal inline de criar/editar modalidade ──────────────
interface ModalityModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  onSuccess:  () => void;
  modality?:  Modality | null;
}

function ModalityModal({ isOpen, onClose, onSuccess, modality }: ModalityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModalityForm>({
    resolver: zodResolver(modalitySchema),
  });

  useEffect(() => {
    if (modality) {
      reset({
        name:        modality.name,
        description: modality.description ?? '',
        isActive:    modality.isActive,
      });
    } else {
      reset({ isActive: true });
    }
  }, [modality, reset, isOpen]);

  async function onSubmit(data: ModalityForm) {
    setIsLoading(true);
    setError('');
    try {
      if (modality) {
        // Edição — endpoint PATCH /classes/modalities/:id
        await classesService.updateModality(modality.id, data);
      } else {
        await classesService.createModality(data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar modalidade');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">

        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {modality ? 'Editar Modalidade' : 'Nova Modalidade'}
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

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ex: Musculação, Funcional, Spinning..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descrição</label>
            <input
              {...register('description')}
              placeholder="Descrição opcional da modalidade"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Status */}
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
                : modality ? 'Salvar Alterações' : 'Criar Modalidade'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────

export default function ClassesPage() {
  // Aba ativa: 'turmas' | 'modalidades'
  const [activeTab, setActiveTab] = useState<'turmas' | 'modalidades'>('turmas');

  // ── Estado: Turmas ───────────────────────────────────────
  const [classGroups, setClassGroups]   = useState<ClassGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  // ── Estado: Modalidades ──────────────────────────────────
  const [modalities, setModalities]           = useState<Modality[]>([]);
  const [isLoadingModalities, setIsLoadingModalities] = useState(false);
  const [modalityModalOpen, setModalityModalOpen]     = useState(false);
  const [selectedModality, setSelectedModality]       = useState<Modality | null>(null);

  // ── Estado: Modais de turma ──────────────────────────────
  const [groupModalOpen, setGroupModalOpen]   = useState(false);
  const [selectedGroup, setSelectedGroup]     = useState<ClassGroup | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId]         = useState('');

  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [enrollTargetGroupId, setEnrollTargetGroupId] = useState('');

  // ── Estado: Confirm ──────────────────────────────────────
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction]   = useState<() => Promise<void>>(async () => {});

  // ── Carregamento ─────────────────────────────────────────

  const loadClassGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const data = await classesService.findAllClassGroups();
      setClassGroups(data);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  const loadModalities = useCallback(async () => {
    setIsLoadingModalities(true);
    try {
      const data = await classesService.findAllModalities();
      setModalities(data);
    } finally {
      setIsLoadingModalities(false);
    }
  }, []);

  // Carrega turmas ao montar
  useEffect(() => { loadClassGroups(); }, [loadClassGroups]);

  // Carrega modalidades ao montar e ao trocar para a aba
  useEffect(() => {
    loadModalities();
  }, [loadModalities]);

  // ── Handlers: Turmas ─────────────────────────────────────

  function handleNewGroup() {
    setSelectedGroup(null);
    setGroupModalOpen(true);
  }

  function handleEditGroup(group: ClassGroup, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedGroup(group);
    setGroupModalOpen(true);
  }

  function handleDeleteGroup(group: ClassGroup, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmMessage(`Remover a turma "${group.name}"? Todos os horários e inscrições serão removidos.`);
    setConfirmAction(() => async () => {
      await classesService.removeClassGroup(group.id);
      await loadClassGroups();
    });
    setConfirmOpen(true);
  }

  // ── Handlers: Horários ───────────────────────────────────

  function handleAddSchedule(groupId: string) {
    setTargetGroupId(groupId);
    setScheduleModalOpen(true);
  }

  function handleDeleteSchedule(schedule: ClassSchedule) {
    setConfirmMessage(`Remover o horário de ${DAY_NAMES[schedule.dayOfWeek]} às ${schedule.startTime}?`);
    setConfirmAction(() => async () => {
      await classesService.removeSchedule(schedule.id);
      await loadClassGroups();
    });
    setConfirmOpen(true);
  }

  // ── Handlers: Inscrições ─────────────────────────────────

  function handleEnrollStudent(groupId: string) {
    setEnrollTargetGroupId(groupId);
    setEnrollmentModalOpen(true);
  }

  function handleUnenrollStudent(group: ClassGroup, enrollment: ClassEnrollment) {
    setConfirmMessage(`Remover ${enrollment.student?.name} da turma "${group.name}"?`);
    setConfirmAction(() => async () => {
      await classesService.unenrollStudent(group.id, enrollment.studentId);
      await loadClassGroups();
    });
    setConfirmOpen(true);
  }

  // ── Handlers: Modalidades ────────────────────────────────

  function handleNewModality() {
    setSelectedModality(null);
    setModalityModalOpen(true);
  }

  function handleEditModality(modality: Modality) {
    setSelectedModality(modality);
    setModalityModalOpen(true);
  }

  function handleDeleteModality(modality: Modality) {
    setConfirmMessage(`Remover a modalidade "${modality.name}"?`);
    setConfirmAction(() => async () => {
      await classesService.removeModality(modality.id);
      await loadModalities();
    });
    setConfirmOpen(true);
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Turmas e Aulas</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie turmas, horários e modalidades da academia
          </p>
        </div>
        {/* Botão contextual por aba */}
        {activeTab === 'turmas' ? (
          <button
            onClick={handleNewGroup}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Turma
          </button>
        ) : (
          <button
            onClick={handleNewModality}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Modalidade
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('turmas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'turmas'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Turmas
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === 'turmas' ? 'bg-blue-500/30' : 'bg-gray-800'
          }`}>
            {classGroups.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('modalidades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'modalidades'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Modalidades
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === 'modalidades' ? 'bg-blue-500/30' : 'bg-gray-800'
          }`}>
            {modalities.length}
          </span>
        </button>
      </div>

      {/* ── ABA: TURMAS ────────────────────────────────────── */}
      {activeTab === 'turmas' && (
        <>
          {isLoadingGroups && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {!isLoadingGroups && classGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-400 font-medium">Nenhuma turma cadastrada</p>
              <p className="text-gray-600 text-sm mt-1">Crie a primeira turma clicando em &quot;Nova Turma&quot;</p>
            </div>
          )}

          {!isLoadingGroups && classGroups.length > 0 && (
            <div className="space-y-3">
              {classGroups.map((group) => {
                const isExpanded        = expandedId === group.id;
                const activeEnrollments = group.enrollments?.filter(e => e.isActive) ?? [];
                const occupancy         = group.maxCapacity > 0
                  ? Math.round((activeEnrollments.length / group.maxCapacity) * 100)
                  : null;

                return (
                  <div key={group.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

                    {/* Cabeçalho do card */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : group.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${group.isActive ? 'bg-blue-500/10' : 'bg-gray-800'}`}>
                          <Calendar className={`w-4 h-4 ${group.isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">{group.name}</span>
                            {group.modality && (
                              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                                {group.modality.name}
                              </span>
                            )}
                            {group.isActive ? (
                              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Ativa
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Inativa
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {group.teacher && (
                              <span className="text-gray-400 text-xs">Prof. {group.teacher.name}</span>
                            )}
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {activeEnrollments.length}
                              {group.maxCapacity > 0 && `/${group.maxCapacity}`} alunos
                              {occupancy !== null && (
                                <span className={`ml-1 ${occupancy >= 90 ? 'text-red-400' : occupancy >= 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                                  ({occupancy}%)
                                </span>
                              )}
                            </span>
                            {group.schedules && group.schedules.length > 0 && (
                              <span className="text-gray-500 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {group.schedules.length} {group.schedules.length === 1 ? 'horário' : 'horários'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleEditGroup(group, e)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteGroup(group, e)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
                          : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                        }
                      </div>
                    </div>

                    {/* Conteúdo expandido */}
                    {isExpanded && (
                      <div className="border-t border-gray-800 p-4 grid grid-cols-2 gap-6">

                        {/* Horários */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-300 text-sm font-medium">Horários</h3>
                            <button
                              onClick={() => handleAddSchedule(group.id)}
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Adicionar
                            </button>
                          </div>
                          {group.schedules && group.schedules.length > 0 ? (
                            <div className="space-y-2">
                              {group.schedules.map((schedule) => (
                                <div key={schedule.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                                  <span className="text-gray-300 text-sm">
                                    <span className="text-blue-400 font-medium">{DAY_NAMES[schedule.dayOfWeek]}</span>
                                    {' '}{schedule.startTime} – {schedule.endTime}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteSchedule(schedule)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm">Nenhum horário cadastrado</p>
                          )}
                        </div>

                        {/* Alunos */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-300 text-sm font-medium">
                              Alunos ({activeEnrollments.length})
                            </h3>
                            <button
                              onClick={() => handleEnrollStudent(group.id)}
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Inscrever
                            </button>
                          </div>
                          {activeEnrollments.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {activeEnrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {enrollment.student?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-300 text-sm">{enrollment.student?.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleUnenrollStudent(group, enrollment)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm">Nenhum aluno inscrito</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── ABA: MODALIDADES ───────────────────────────────── */}
      {activeTab === 'modalidades' && (
        <>
          {isLoadingModalities && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {!isLoadingModalities && modalities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Dumbbell className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-400 font-medium">Nenhuma modalidade cadastrada</p>
              <p className="text-gray-600 text-sm mt-1">Crie a primeira modalidade clicando em &quot;Nova Modalidade&quot;</p>
            </div>
          )}

          {!isLoadingModalities && modalities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modalities.map((modality) => (
                <div
                  key={modality.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${modality.isActive ? 'bg-purple-500/10' : 'bg-gray-800'}`}>
                      <Dumbbell className={`w-4 h-4 ${modality.isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{modality.name}</span>
                        {modality.isActive ? (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Ativa</span>
                        ) : (
                          <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Inativa</span>
                        )}
                      </div>
                      {modality.description && (
                        <p className="text-gray-500 text-xs mt-0.5">{modality.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEditModality(modality)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModality(modality)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODAIS ─────────────────────────────────────────── */}
      <ModalityModal
        isOpen={modalityModalOpen}
        onClose={() => setModalityModalOpen(false)}
        onSuccess={loadModalities}
        modality={selectedModality}
      />

      <ClassGroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSuccess={loadClassGroups}
        group={selectedGroup}
      />

      <ClassScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={loadClassGroups}
        classGroupId={targetGroupId}
      />

      <ClassEnrollmentModal
        isOpen={enrollmentModalOpen}
        onClose={() => setEnrollmentModalOpen(false)}
        onSuccess={loadClassGroups}
        classGroupId={enrollTargetGroupId} currentStudentIds={[]}      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        message={confirmMessage} title={''}      />
    </div>
  );
}
