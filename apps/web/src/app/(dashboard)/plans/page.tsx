'use client';

/**
 * plans/page.tsx
 * Página de listagem de planos.
 * Conectada ao PlanModal para criação/edição
 * e ao ConfirmModal para exclusão com soft delete.
 */
import { useEffect, useState } from 'react';
import { plansService } from '@/services/plans.service';
import { Plan } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ClipboardList, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { PlanModal } from '@/components/modals/planModal';
import { ConfirmModal } from '@/components/modals/confirmModal';

const durationLabel: Record<string, string> = {
  monthly:    'Mensal',
  quarterly:  'Trimestral',
  semiannual: 'Semestral',
  annual:     'Anual',
  custom:     'Personalizado',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Controle do modal de criação/edição
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Controle do modal de confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Carrega lista de planos
  async function loadPlans() {
    try {
      const data = await plansService.findAll();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadPlans(); }, []);

  // Abre modal para criar novo plano
  function handleNew() {
    setSelectedPlan(null);
    setModalOpen(true);
  }

  // Abre modal para editar plano existente
  function handleEdit(plan: Plan) {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  // Abre modal de confirmação de exclusão
  function handleDeleteClick(plan: Plan) {
    setPlanToDelete(plan);
    setConfirmOpen(true);
  }

  // Executa a exclusão após confirmação
  async function handleDeleteConfirm() {
    if (!planToDelete) return;
    setIsDeleting(true);

    try {
      await plansService.remove(planToDelete.id);
      await loadPlans();
      setConfirmOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Erro ao remover plano:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Modal de criação/edição */}
      <PlanModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedPlan(null); }}
        onSuccess={loadPlans}
        plan={selectedPlan}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPlanToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Remover Plano"
        message={`Tem certeza que deseja remover o plano "${planToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, remover"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Planos</h1>
          <p className="text-gray-400 mt-1">{plans.length} plano(s) cadastrado(s)</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      {/* Grid de cards */}
      {plans.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
          Nenhum plano cadastrado
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

              {/* Nome, status e ações */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold">{plan.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  {/* Botão editar */}
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* Botão remover */}
                  <button
                    onClick={() => handleDeleteClick(plan)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Descrição */}
              {plan.description && (
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              )}

              {/* Preço */}
              <p className="text-3xl font-bold text-white mb-1">
                {formatCurrency(plan.price)}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {durationLabel[plan.duration]} • {plan.durationDays} dias
              </p>

              {/* Taxa de matrícula */}
              {plan.enrollmentFee > 0 && (
                <p className="text-gray-500 text-xs">
                  Taxa de matrícula: {formatCurrency(plan.enrollmentFee)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
