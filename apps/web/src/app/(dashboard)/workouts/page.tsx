'use client';

/**
 * workouts/page.tsx
 * Página de gerenciamento de fichas de treino.
 *
 * Layout:
 * - Lista de fichas em cards acordeão
 * - Ao expandir, exibe exercícios da ficha
 * - Ações: criar ficha, editar, remover, adicionar exercício, editar/remover exercício
 */
import { useEffect, useState, useCallback } from 'react';
import { workoutsService } from '@/services/workouts.service';
import { WorkoutPlan, WorkoutExercise } from '@/types';
import { WorkoutPlanModal } from '@/components/modals/workoutPlanModal';
import { WorkoutExerciseModal } from '@/components/modals/workoutExerciseModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import {
  Plus, Loader2, Dumbbell, ChevronDown, ChevronUp,
  Pencil, Trash2, User, CheckCircle, XCircle,
} from 'lucide-react';

export default function WorkoutsPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<WorkoutPlan | null>(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);

  // Modais
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [targetPlanId, setTargetPlanId] = useState<string>('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(async () => {});

  // Carrega lista de fichas
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await workoutsService.findAll();
      setPlans(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  // Expande/recolhe uma ficha e carrega seus exercícios
  async function toggleExpand(plan: WorkoutPlan) {
    if (expandedId === plan.id) {
      setExpandedId(null);
      setExpandedPlan(null);
      return;
    }
    setExpandedId(plan.id);
    setLoadingExpanded(true);
    try {
      const full = await workoutsService.findOne(plan.id);
      setExpandedPlan(full);
    } finally {
      setLoadingExpanded(false);
    }
  }

  // Recarrega o acordeão expandido após mudança
  async function reloadExpanded() {
    if (expandedId) {
      const full = await workoutsService.findOne(expandedId);
      setExpandedPlan(full);
    }
    await loadPlans();
  }

  // Abre modal de nova ficha
  function handleNewPlan() {
    setSelectedPlan(null);
    setPlanModalOpen(true);
  }

  // Abre modal de edição de ficha
  function handleEditPlan(plan: WorkoutPlan, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedPlan(plan);
    setPlanModalOpen(true);
  }

  // Confirma remoção de ficha
  function handleDeletePlan(plan: WorkoutPlan, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmMessage(`Remover a ficha "${plan.name}"? Todos os exercícios serão removidos.`);
    setConfirmAction(() => async () => {
      await workoutsService.removePlan(plan.id);
      if (expandedId === plan.id) {
        setExpandedId(null);
        setExpandedPlan(null);
      }
      await loadPlans();
    });
    setConfirmOpen(true);
  }

  // Abre modal de novo exercício
  function handleNewExercise(planId: string) {
    setTargetPlanId(planId);
    setSelectedExercise(null);
    setExerciseModalOpen(true);
  }

  // Abre modal de edição de exercício
  function handleEditExercise(exercise: WorkoutExercise) {
    setTargetPlanId(exercise.workoutPlanId);
    setSelectedExercise(exercise);
    setExerciseModalOpen(true);
  }

  // Confirma remoção de exercício
  function handleDeleteExercise(exercise: WorkoutExercise) {
    setConfirmMessage(`Remover o exercício "${exercise.name}"?`);
    setConfirmAction(() => async () => {
      await workoutsService.removeExercise(exercise.id);
      await reloadExpanded();
    });
    setConfirmOpen(true);
  }

  // ── RENDER ───────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Fichas de Treino</h1>
          <p className="text-gray-400 text-sm mt-1">
            {plans.length} {plans.length === 1 ? 'ficha cadastrada' : 'fichas cadastradas'}
          </p>
        </div>
        <button
          onClick={handleNewPlan}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma ficha de treino cadastrada</p>
          <p className="text-gray-600 text-sm mt-1">Crie a primeira ficha clicando em &quot;Nova Ficha&quot;</p>
        </div>
      )}

      {/* Lista de fichas em acordeão */}
      {!isLoading && plans.length > 0 && (
        <div className="space-y-3">
          {plans.map((plan) => {
            const isExpanded = expandedId === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                {/* Cabeçalho do card — clicável para expandir */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpand(plan)}
                >
                  <div className="flex items-center gap-3">
                    {/* Ícone status */}
                    <div className={`p-2 rounded-lg ${plan.isActive ? 'bg-blue-500/10' : 'bg-gray-800'}`}>
                      <Dumbbell className={`w-4 h-4 ${plan.isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{plan.name}</span>
                        {plan.division && (
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            {plan.division}
                          </span>
                        )}
                        {plan.isActive ? (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Ativa
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inativa
                          </span>
                        )}
                      </div>
                      {/* Aluno e professor */}
                      <div className="flex items-center gap-3 mt-0.5">
                        {plan.student && (
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {plan.student.name}
                          </span>
                        )}
                        {plan.teacher && (
                          <span className="text-gray-500 text-xs">
                            Prof. {plan.teacher.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações + chevron */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditPlan(plan, e)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePlan(plan, e)}
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

                {/* Conteúdo expandido — exercícios */}
                {isExpanded && (
                  <div className="border-t border-gray-800 p-4">
                    {loadingExpanded && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    )}

                    {!loadingExpanded && expandedPlan && (
                      <>
                        {/* Descrição / observações */}
                        {(expandedPlan.description || expandedPlan.observations) && (
                          <div className="mb-4 space-y-1">
                            {expandedPlan.description && (
                              <p className="text-gray-400 text-sm">{expandedPlan.description}</p>
                            )}
                            {expandedPlan.observations && (
                              <p className="text-gray-500 text-xs">{expandedPlan.observations}</p>
                            )}
                          </div>
                        )}

                        {/* Tabela de exercícios */}
                        {expandedPlan.exercises && expandedPlan.exercises.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {/* Cabeçalho da tabela */}
                            <div className="grid grid-cols-12 gap-2 px-3 py-1">
                              <span className="col-span-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Exercício</span>
                              <span className="col-span-2 text-gray-500 text-xs font-medium uppercase tracking-wide">Grupo</span>
                              <span className="col-span-1 text-gray-500 text-xs font-medium uppercase tracking-wide text-center">Séries</span>
                              <span className="col-span-2 text-gray-500 text-xs font-medium uppercase tracking-wide text-center">Reps</span>
                              <span className="col-span-1 text-gray-500 text-xs font-medium uppercase tracking-wide text-center">Kg</span>
                              <span className="col-span-1 text-gray-500 text-xs font-medium uppercase tracking-wide text-center">Desc</span>
                              <span className="col-span-1 text-gray-500 text-xs font-medium uppercase tracking-wide text-right">Ações</span>
                            </div>

                            {expandedPlan.exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="grid grid-cols-12 gap-2 bg-gray-800/50 rounded-lg px-3 py-2.5 items-center"
                              >
                                <div className="col-span-4">
                                  <p className="text-white text-sm font-medium">{exercise.name}</p>
                                  {exercise.observations && (
                                    <p className="text-gray-500 text-xs mt-0.5">{exercise.observations}</p>
                                  )}
                                </div>
                                <span className="col-span-2 text-gray-400 text-xs">{exercise.muscleGroup ?? '—'}</span>
                                <span className="col-span-1 text-gray-300 text-sm text-center">{exercise.sets ?? '—'}</span>
                                <span className="col-span-2 text-gray-300 text-sm text-center">{exercise.reps ?? '—'}</span>
                                <span className="col-span-1 text-gray-300 text-sm text-center">
                                  {exercise.load != null ? `${exercise.load}` : '—'}
                                </span>
                                <span className="col-span-1 text-gray-400 text-xs text-center">
                                  {exercise.restSeconds != null ? `${exercise.restSeconds}s` : '—'}
                                </span>
                                <div className="col-span-1 flex justify-end gap-1">
                                  <button
                                    onClick={() => handleEditExercise(exercise)}
                                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExercise(exercise)}
                                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 mb-4">
                            <p className="text-gray-500 text-sm">Nenhum exercício adicionado ainda</p>
                          </div>
                        )}

                        {/* Botão adicionar exercício */}
                        <button
                          onClick={() => handleNewExercise(expandedPlan.id)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Exercício
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <WorkoutPlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSuccess={reloadExpanded}
        plan={selectedPlan}
      />

      <WorkoutExerciseModal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        onSuccess={reloadExpanded}
        workoutPlanId={targetPlanId}
        exercise={selectedExercise}
      />

      <ConfirmModal
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={confirmAction}
              message={confirmMessage} title={''}
        />
    </div>
  );
}
