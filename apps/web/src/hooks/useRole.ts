/**
 * useRole.ts
 * Hook para verificar permissões do usuário logado.
 * Usado para esconder/mostrar elementos na UI.
 */
import { useAuth } from '@/contexts/auth.context';

type Role = 'super_admin' | 'admin' | 'receptionist' | 'financial' | 'teacher';

export function useRole() {
  const { user } = useAuth();
  const role = (user?.role ?? '') as Role;

  const isAdmin      = role === 'super_admin' || role === 'admin';
  const isReception  = role === 'receptionist';
  const isFinancial  = role === 'financial';
  const isTeacher    = role === 'teacher';

  /**
   * Verifica se o usuário tem pelo menos um dos roles informados.
   * Admin e super_admin sempre retornam true.
   */
  function can(...roles: Role[]): boolean {
    if (isAdmin) return true;
    return roles.includes(role);
  }

  return {
    role,
    isAdmin,
    isReception,
    isFinancial,
    isTeacher,
    can,
  };
}
