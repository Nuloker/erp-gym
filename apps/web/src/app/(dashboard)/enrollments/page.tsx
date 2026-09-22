'use client';

/**
 * enrollments/page.tsx
 * Página de listagem de matrículas com paginação.
 *
 * Funcionalidades:
 * - Paginação client-side com seletor de itens por página
 * - EnrollmentModal para criação de matrículas
 * - ConfirmModal para cancelamento
 */
import { useEffect, useState } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import { Enrollment } from '@/types';
import { formatDate } from '@/lib/utils';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import { EnrollmentModal } from '@/components/modals/enrollmentModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { Pagination } from '@/components/pagination';

const statusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Ativa',     color: 'bg-green-500/10 text-green-400'   },
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  frozen:    { label: 'Pausada',   color: 'bg-blue-500/10 text-blue-400'     },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400'       },
  expired:   { label: 'Vencida',   color: 'bg-gray-500/10 text-gray-400'     },
};

const DEFAULT_PER_PAGE = 10;

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments]   = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PER_PAGE);
  const [modalOpen, setModalOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [enrollmentToCancel, setEnrollmentToCancel] = useState<Enrollment | null>(null);

  async function loadEnrollments() {
    try {
      const data = await enrollmentsService.findAll();
      setEnrollments(data);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadEnrollments(); }, []);

  // Fatia para a página atual
  const paginated = enrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleCancelClick(enrollment: Enrollment) {
    setEnrollmentToCancel(enrollment);
    setConfirmOpen(true);
  }

  async function handleCancelConfirm() {
    if (!enrollmentToCancel) return;
    setIsCancelling(true);
    try {
      await enrollmentsService.cancel(
        enrollmentToCancel.id,
        'Cancelado pelo administrador',
      );
      await loadEnrollments();
      setConfirmOpen(false);
      setEnrollmentToCancel(null);
    } catch (error) {
      console.error('Erro ao cancelar matrícula:', error);
    } finally {
      setIsCancelling(false);
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

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadEnrollments}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setEnrollmentToCancel(null); }}
        onConfirm={handleCancelConfirm}
        title="Cancelar Matrícula"
        message={`Tem certeza que deseja cancelar a matrícula de "${enrollmentToCancel?.student?.name}" no plano "${enrollmentToCancel?.plan?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, cancelar"
        isLoading={isCancelling}
        variant="warning"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Matrículas</h1>
          <p className="text-gray-400 mt-1">{enrollments.length} matrícula(s)</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Matrícula
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ALUNO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">PLANO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">INÍCIO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VENCIMENTO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-12">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhuma matrícula encontrada
                </td>
              </tr>
            ) : (
              paginated.map((enrollment) => {
                const status    = statusConfig[enrollment.status];
                const canCancel = enrollment.status === 'active' || enrollment.status === 'pending';

                return (
                  <tr key={enrollment.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white text-sm font-medium">
                      {enrollment.student?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {enrollment.plan?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(enrollment.startDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(enrollment.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(enrollment)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <Pagination
          currentPage={currentPage}
          totalItems={enrollments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(perPage) => {
            setItemsPerPage(perPage);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
