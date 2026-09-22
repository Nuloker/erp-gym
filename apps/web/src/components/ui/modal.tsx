/**
 * Modal.tsx
 * Componente de modal genérico e reutilizável.
 *
 * Uso:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Novo aluno">
 *     <p>conteúdo</p>
 *   </Modal>
 *
 * Props:
 *   - isOpen: controla visibilidade
 *   - onClose: callback ao fechar (ESC, clique no overlay ou botão X)
 *   - title: título exibido no header
 *   - size: 'sm' | 'md' | 'lg' — largura do modal (default: 'md')
 *   - children: conteúdo interno
 */

'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: ModalSize
  children: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  // Fecha ao pressionar ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Impede scroll do body enquanto o modal está aberto
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    // Overlay escuro — clique fora fecha o modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {/* Container do modal — clique interno NÃO fecha */}
      <div
        className={cn(
          'relative w-full rounded-xl bg-gray-900 shadow-2xl',
          'border border-gray-700',
          'flex flex-col max-h-[90vh]',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com scroll interno se necessário */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
