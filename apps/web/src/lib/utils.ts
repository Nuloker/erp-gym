/**
 * utils.ts
 * Funções utilitárias reutilizáveis em todo o frontend.
 * - cn: combina classes CSS com suporte a condicionais (clsx + tailwind-merge)
 * - formatCurrency: formata valores monetários
 * - formatDate: formata datas para exibição
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — Class Names
 * Combina classes CSS condicionalmente e resolve conflitos do Tailwind.
 * Exemplo: cn('p-4', isActive && 'bg-blue-500', 'p-2') → 'bg-blue-500 p-2'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * formatCurrency
 * Formata um número para moeda brasileira (BRL).
 * Exemplo: formatCurrency(99.9) → 'R$ 99,90'
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * formatDate
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY).
 * Exemplo: formatDate('2026-04-29') → '29/04/2026'
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * formatDateTime
 * Formata data e hora para o padrão brasileiro.
 * Exemplo: formatDateTime('2026-04-29T10:00:00') → '29/04/2026 10:00'
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
