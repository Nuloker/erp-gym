/**
 * Button.tsx
 * Botão padronizado com variantes visuais, estado de loading e suporte a ícones.
 *
 * Uso:
 *   <Button variant="primary" isLoading={isSaving}>Salvar</Button>
 *   <Button variant="secondary" onClick={onClose}>Cancelar</Button>
 *   <Button variant="danger" leftIcon={<Trash size={16} />}>Excluir</Button>
 *
 * Variantes:
 *   - primary: fundo indigo — ação principal
 *   - secondary: fundo transparente com borda — ação secundária
 *   - danger: fundo vermelho — ação destrutiva
 *   - ghost: sem borda — ação discreta
 */

'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 border-transparent',
  secondary:
    'bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white',
  danger:
    'bg-red-600 text-white hover:bg-red-500 border-transparent',
  ghost:
    'bg-transparent text-gray-400 border-transparent hover:bg-gray-800 hover:text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base
        'inline-flex items-center justify-center rounded-lg border font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Ícone de loading substitui o leftIcon quando está carregando */}
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}

      {children}

      {!isLoading && rightIcon ? rightIcon : null}
    </button>
  )
}
