'use client';

/**
 * ConfirmModal.tsx
 * Modal genérico de confirmação para ações destrutivas.
 * Usado para confirmar exclusões de alunos, planos,
 * matrículas e cobranças antes de executar a ação.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao cancelar ou fechar
 * - onConfirm: função chamada ao confirmar a ação
 * - title: título do modal ex: "Remover Aluno"
 * - message: mensagem de confirmação detalhada
 * - confirmLabel: texto do botão de confirmação — padrão "Confirmar"
 * - isLoading: exibe spinner no botão enquanto executa a ação
 * - variant: "danger" (vermelho) ou "warning" (amarelo) — padrão danger
 *
 * Uso:
 * <ConfirmModal
 *   isOpen={confirmOpen}
 *   onClose={() => setConfirmOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Remover Aluno"
 *   message="Tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita."
 *   confirmLabel="Sim, remover"
 *   isLoading={isDeleting}
 * />
 */
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) {

  // Não renderiza se o modal estiver fechado
  if (!isOpen) return null;

  // Define as cores do modal baseado na variante
  const colors = {
    danger: {
      icon:   'bg-red-500/10',
      iconColor: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50',
    },
    warning: {
      icon:   'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50',
    },
  }[variant];

  return (
    // Overlay escuro ao fundo
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">

      {/* Container do modal — tamanho menor que os outros modais */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {/* Ícone colorido por variante */}
            <div className={`${colors.icon} p-2 rounded-xl`}>
              {variant === 'danger' ? (
                <Trash2 className={`w-5 h-5 ${colors.iconColor}`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${colors.iconColor}`} />
              )}
            </div>
            <h2 className="text-white font-semibold text-lg">{title}</h2>
          </div>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem de confirmação */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 px-6 pb-6">

          {/* Botão cancelar — sempre à esquerda */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>

          {/* Botão confirmar — cor definida pela variante */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${colors.button} text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguarde...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
