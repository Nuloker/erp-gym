'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { useRole } from '@/hooks/useRole';
import {
  LayoutDashboard, Users, ClipboardList, CreditCard,
  DollarSign, CheckSquare, CalendarDays, Dumbbell,
  LogOut, Loader2, Activity, FileText, Shield, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  super_admin:  'Super Admin',
  admin:        'Administrador',
  receptionist: 'Recepção',
  financial:    'Financeiro',
  teacher:      'Professor',
};

const roleBadgeColors: Record<string, string> = {
  super_admin:  'bg-purple-500/20 text-purple-300 border-purple-500/20',
  admin:        'bg-blue-500/20 text-blue-300 border-blue-500/20',
  receptionist: 'bg-green-500/20 text-green-300 border-green-500/20',
  financial:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
  teacher:      'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const { can } = useRole();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 animate-pulse" />
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin absolute inset-0 m-auto" />
          </div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const allNavItems = [
    { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, visible: true                                                             },
    { href: '/students',    label: 'Alunos',       icon: Users,           visible: can('admin', 'receptionist', 'financial', 'teacher')             },
    { href: '/plans',       label: 'Planos',       icon: ClipboardList,   visible: can('admin', 'receptionist', 'financial')                        },
    { href: '/enrollments', label: 'Matrículas',   icon: CreditCard,      visible: can('admin', 'receptionist', 'financial', 'teacher')             },
    { href: '/finance',     label: 'Financeiro',   icon: DollarSign,      visible: can('admin', 'financial', 'receptionist')                        },
    { href: '/attendance',  label: 'Check-in',     icon: CheckSquare,     visible: can('admin', 'receptionist', 'financial', 'teacher')             },
    { href: '/classes',     label: 'Turmas',       icon: CalendarDays,    visible: can('admin', 'receptionist', 'financial', 'teacher')             },
    { href: '/workouts',    label: 'Treinos',      icon: Dumbbell,        visible: can('admin', 'teacher', 'receptionist')                          },
    { href: '/assessments', label: 'Avaliações',   icon: Activity,        visible: can('admin', 'teacher', 'receptionist')                          },
    { href: '/reports',     label: 'Relatórios',   icon: FileText,        visible: can('admin', 'receptionist', 'financial')                        },
    { href: '/audit',       label: 'Auditoria',    icon: Shield,          visible: can('admin')                                                     },
    { href: '/users',       label: 'Usuários',     icon: UserCog,         visible: can('admin')                                                     },
  ];

  const navItems = allNavItems.filter(item => item.visible);

  return (
    <div className="min-h-screen flex">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="glass-sidebar w-64 flex flex-col fixed top-0 left-0 h-full z-30">

        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl glow-blue-sm">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              {/* Brilho animado no logo */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-xl animate-glow-pulse" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">ERP GYM</span>
              <p className="text-gray-500 text-xs">BEN TECH</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-item flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'active text-white'
                    : 'text-gray-500 hover:text-gray-200',
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-600 group-hover:text-gray-400 group-hover:bg-white/5',
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {/* Indicador ativo */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-glow-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divisor com gradiente */}
        <hr className="divider-gradient mx-3" />

        {/* Footer — usuário */}
        <div className="p-3">
          <div className="glass-card rounded-xl p-3 mb-2">
            <div className="flex items-center gap-3">
              {/* Avatar com gradiente */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {/* Indicador online */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <span className={'text-xs px-1.5 py-0.5 rounded-md border ' + (roleBadgeColors[user.role] ?? 'bg-gray-800 text-gray-400 border-gray-700')}>
                  {roleLabels[user.role] ?? user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Botão logout */}
          <button
            onClick={logout}
            className="btn-ghost ripple-btn w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 rounded-lg text-xs font-medium transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────────── */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {/* Linha de brilho no topo */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
