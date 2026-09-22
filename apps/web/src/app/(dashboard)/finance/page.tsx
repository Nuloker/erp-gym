'use client';

/**
 * finance/page.tsx
 * Página de listagem de cobranças com paginação e filtro por status.
 *
 * Funcionalidades:
 * - Tabs de filtro por status (Todas, Pendentes, Pagas, Vencidas)
 * - Paginação client-side com seletor de itens por página
 * - Filtro de tab reseta para página 1 automaticamente
 * - InvoiceModal para criação de cobranças
 * - PaymentModal para baixa de pagamento
 * - ConfirmModal para cancelamento
 */
import { useEffect, useState } from 'react';
import { financeService } from '@/services/finance.service';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Plus, Loader2 } from 'lucide-react';
import { InvoiceModal } from '@/components/modals/invoiceModal';
import { PaymentModal } from '@/components/modals/paymentModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { Pagination } from '@/components/pagination';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  paid:      { label: 'Pago',      color: 'bg-green-500/10 text-green-400'   },
  overdue:   { label: 'Vencido',   color: 'bg-red-500/10 text-red-400'       },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-400'     },
};

const filterTabs = [
  { value: '',         label: 'Todas'     },
  { value: 'pending',  label: 'Pendentes' },
  { value: 'paid',     label: 'Pagas'     },
  { value: 'overdue',  label: 'Vencidas'  },
];

const DEFAULT_PER_PAGE = 10;

export default function FinancePage() {
  const [invoices, setInvoices]         = useState<Invoice[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PER_PAGE);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice]   = useState<Invoice | null>(null);
  const [confirmOpen, setConfirmOpen]           = useState(false);
  const [invoiceToCancel, setInvoiceToCancel]   = useState<Invoice | null>(null);

  async function loadInvoices() {
    try {
      const data = await financeService.findAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadInvoices(); }, []);

  // Filtra por status e reseta página ao trocar tab
  const filtered = activeFilter
    ? invoices.filter((i) => i.status === activeFilter)
    : invoices;

  // Fatia para a página atual
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Troca de tab reseta para página 1
  function handleFilterChange(value: string) {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  async function handleOpenPayment(invoice: Invoice) {
    try {
      const full = await financeService.findOneInvoice(invoice.id);
      setSelectedInvoice(full);
    } catch (error) {
      console.error('Erro ao carregar cobrança:', error);
    }
  }

  function handleCancelClick(invoice: Invoice) {
    setInvoiceToCancel(invoice);
    setConfirmOpen(true);
  }

  async function handleCancelConfirm() {
    if (!invoiceToCancel) return;
    setIsCancelling(true);
    try {
      await financeService.updateInvoice(invoiceToCancel.id, { status: 'cancelled' });
      await loadInvoices();
      setConfirmOpen(false);
      setInvoiceToCancel(null);
    } catch (error) {
      console.error('Erro ao cancelar cobrança:', error);
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

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSuccess={loadInvoices}
      />

      <PaymentModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onSuccess={loadInvoices}
        invoice={selectedInvoice}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setInvoiceToCancel(null); }}
        onConfirm={handleCancelConfirm}
        title="Cancelar Cobrança"
        message={`Tem certeza que deseja cancelar a cobrança "${invoiceToCancel?.description}" de ${invoiceToCancel?.student?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, cancelar"
        isLoading={isCancelling}
        variant="warning"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-gray-400 mt-1">{invoices.length} cobrança(s)</p>
        </div>
        <button
          onClick={() => setInvoiceModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Cobrança
        </button>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              activeFilter === tab.value ? 'bg-blue-500/30' : 'bg-gray-800'
            }`}>
              {tab.value
                ? invoices.filter(i => i.status === tab.value).length
                : invoices.length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ALUNO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DESCRIÇÃO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VALOR</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VENCIMENTO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-12">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhuma cobrança encontrada
                </td>
              </tr>
            ) : (
              paginated.map((invoice) => {
                const status    = statusConfig[invoice.status];
                const canPay    = invoice.status === 'pending' || invoice.status === 'overdue';
                const canCancel = invoice.status === 'pending' || invoice.status === 'overdue';

                return (
                  <tr key={invoice.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white text-sm font-medium">
                      {invoice.student?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{invoice.description}</td>
                    <td className="px-6 py-4 text-white text-sm font-medium">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {canPay && (
                          <button
                            onClick={() => handleOpenPayment(invoice)}
                            className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                          >
                            Pagar
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelClick(invoice)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
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
          totalItems={filtered.length}
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
