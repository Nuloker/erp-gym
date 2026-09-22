'use client';

/**
 * PaymentModal.tsx
 * Modal para registrar o pagamento (baixa) de uma cobrança existente.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar com sucesso — recarrega a lista
 * - invoice: cobrança que será paga — obrigatória para abrir o modal
 *
 * Funcionalidades:
 * - Exibe resumo da cobrança (aluno, descrição, valor, vencimento)
 * - Calcula automaticamente o saldo devedor restante
 *   subtraindo pagamentos anteriores do valor total
 * - Preenche o campo valor com o saldo devedor automaticamente
 * - Permite pagamento parcial (valor menor que o saldo devedor)
 * - Seletor de meio de pagamento (dinheiro, cartão, PIX, etc.)
 * - Data de pagamento padrão é hoje
 * - Valida com react-hook-form + zod
 * - Campos numéricos como string para evitar incompatibilidade zod v4
 * - Feedback visual de loading durante o envio
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { financeService } from '@/services/finance.service';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X, Loader2, Receipt } from 'lucide-react';

/**
 * Schema de validação do formulário de pagamento.
 * amount é string para evitar incompatibilidade de tipos zod v4 + react-hook-form.
 * A conversão para number é feita no onSubmit.
 */
const paymentSchema = z.object({
  // Valor pago — obrigatório, maior que zero
  amount: z.string().min(1, 'Valor obrigatório'),

  // Meio de pagamento — obrigatório
  method: z.enum(['cash', 'credit_card', 'debit_card', 'transfer', 'pix', 'other']),

  // Data do pagamento — obrigatória, formato YYYY-MM-DD
  paymentDate: z.string().min(1, 'Data obrigatória'),

  // Observações — opcional
  observations: z.string().optional(),
});

// Tipo inferido do schema
type PaymentForm = z.infer<typeof paymentSchema>;

// Labels dos meios de pagamento para exibição no select
const methodLabels: Record<string, string> = {
  cash:        'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card:  'Cartão de Débito',
  transfer:    'Transferência',
  pix:         'PIX',
  other:       'Outro',
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: Invoice | null; // cobrança que será paga
}

export function PaymentModal({ isOpen, onClose, onSuccess, invoice }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Calcula o saldo devedor da cobrança.
   * Fórmula: (valor + multa + juros - desconto) - total já pago
   * Retorna 0 se não houver cobrança selecionada.
   */
  function calculateRemainingBalance(): number {
    if (!invoice) return 0;

    // Valor total da cobrança com ajustes financeiros
    const total = Number(invoice.amount)
      - Number(invoice.discount)
      + Number(invoice.fine)
      + Number(invoice.interest);

    // Soma todos os pagamentos já realizados
    const totalPaid = (invoice.payments ?? []).reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Retorna o saldo restante arredondado para 2 casas decimais
    return Math.max(0, parseFloat((total - totalPaid).toFixed(2)));
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  });

  /**
   * Ao abrir o modal, preenche o formulário com:
   * - amount: saldo devedor calculado automaticamente
   * - method: PIX como padrão
   * - paymentDate: data de hoje
   */
  useEffect(() => {
    if (isOpen && invoice) {
      const remaining = calculateRemainingBalance();
      reset({
        amount:      String(remaining),
        method:      'pix',
        paymentDate: new Date().toISOString().split('T')[0],
        observations: '',
      });
      setError('');
    }
  }, [isOpen, invoice, reset]);

  /**
   * onSubmit
   * Converte o valor de string para number e registra o pagamento.
   * Se a cobrança for totalmente quitada, o backend atualiza
   * o status para PAID automaticamente.
   */
  async function onSubmit(data: PaymentForm) {
    if (!invoice) return;

    setIsLoading(true);
    setError('');

    try {
      await financeService.createPayment({
        invoiceId:    invoice.id,
        amount:       parseFloat(data.amount),
        method:       data.method,
        paymentDate:  data.paymentDate,
        observations: data.observations,
      });

      // Notifica o pai para recarregar a lista de cobranças
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao registrar pagamento');
    } finally {
      setIsLoading(false);
    }
  }

  // Não renderiza se o modal estiver fechado ou sem cobrança
  if (!isOpen || !invoice) return null;

  // Calcula o saldo devedor para exibição no resumo
  const remaining = calculateRemainingBalance();

  return (
    // Overlay escuro ao fundo
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">

      {/* Container do modal */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">

        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2 rounded-xl">
              <Receipt className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-white font-semibold text-lg">Registrar Pagamento</h2>
          </div>
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo da cobrança — exibe dados da invoice antes do formulário */}
        <div className="mx-6 mt-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">
            Resumo da Cobrança
          </p>
          <div className="space-y-2">

            {/* Nome do aluno */}
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Aluno</span>
              <span className="text-white text-sm font-medium">
                {invoice.student?.name ?? '—'}
              </span>
            </div>

            {/* Descrição da cobrança */}
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Descrição</span>
              <span className="text-white text-sm">{invoice.description}</span>
            </div>

            {/* Valor original */}
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Valor Original</span>
              <span className="text-white text-sm">{formatCurrency(invoice.amount)}</span>
            </div>

            {/* Desconto — exibe apenas se houver */}
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Desconto</span>
                <span className="text-green-400 text-sm">
                  - {formatCurrency(invoice.discount)}
                </span>
              </div>
            )}

            {/* Multa — exibe apenas se houver */}
            {Number(invoice.fine) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Multa</span>
                <span className="text-red-400 text-sm">
                  + {formatCurrency(invoice.fine)}
                </span>
              </div>
            )}

            {/* Juros — exibe apenas se houver */}
            {Number(invoice.interest) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Juros</span>
                <span className="text-red-400 text-sm">
                  + {formatCurrency(invoice.interest)}
                </span>
              </div>
            )}

            {/* Vencimento */}
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Vencimento</span>
              <span className="text-white text-sm">{formatDate(invoice.dueDate)}</span>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-700 pt-2 mt-2">
              {/* Saldo devedor em destaque */}
              <div className="flex justify-between">
                <span className="text-white text-sm font-semibold">Saldo Devedor</span>
                <span className="text-green-400 text-sm font-bold">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de pagamento */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Mensagem de erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Valor pago e Meio de pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Valor Pago (R$) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.amount && (
                <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Meio de Pagamento <span className="text-red-400">*</span>
              </label>
              <select
                {...register('method')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Gera as opções a partir do mapeamento de labels */}
                {Object.entries(methodLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.method && (
                <p className="text-red-400 text-xs mt-1">{errors.method.message}</p>
              )}
            </div>
          </div>

          {/* Data do pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Data do Pagamento <span className="text-red-400">*</span>
            </label>
            <input
              {...register('paymentDate')}
              type="date"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.paymentDate && (
              <p className="text-red-400 text-xs mt-1">{errors.paymentDate.message}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Observações
            </label>
            <textarea
              {...register('observations')}
              placeholder="Ex: Pago via PIX, comprovante enviado por WhatsApp"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-2">
            {/* Botão cancelar */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>

            {/* Botão confirmar pagamento */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
