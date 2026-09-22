/**
 * FormField.tsx
 * Campo de formulário padronizado com label, input/select/textarea e mensagem de erro.
 *
 * Uso com react-hook-form:
 *   const { register, formState: { errors } } = useForm<FormData>()
 *
 *   <FormField
 *     label="Nome completo"
 *     error={errors.name?.message}
 *     required
 *   >
 *     <input {...register('name')} className={inputClass} />
 *   </FormField>
 *
 * Também exporta `inputClass` e `selectClass` para padronizar o visual
 * dos campos sem repetir classes em cada formulário.
 */

import { cn } from '@/lib/utils'

interface FormFieldProps {
  /** Label exibida acima do campo */
  label: string
  /** Mensagem de erro do react-hook-form ou validação manual */
  error?: string
  /** Adiciona asterisco vermelho na label */
  required?: boolean
  /** Dica opcional exibida abaixo do campo (quando não há erro) */
  hint?: string
  /** O campo em si: input, select, textarea, etc. */
  children: React.ReactNode
  /** Classes extras no wrapper */
  className?: string
}

/**
 * Classes base para inputs — importe e aplique nos <input> e <textarea>.
 * Mantém visual consistente em todos os formulários.
 */
export const inputClass = cn(
  'w-full rounded-lg border border-gray-700 bg-gray-800',
  'px-3 py-2 text-sm text-white placeholder:text-gray-500',
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
  'transition-colors disabled:opacity-50'
)

/**
 * Classes base para <select>.
 */
export const selectClass = cn(
  inputClass,
  'appearance-none cursor-pointer'
)

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      <label className="text-sm font-medium text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      {/* Campo (input, select, textarea...) */}
      {children}

      {/* Erro ou hint */}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}
