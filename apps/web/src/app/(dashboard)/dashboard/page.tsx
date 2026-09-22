'use client';

/**
 * dashboard/page.tsx
 * Dashboard adaptativo por role.
 *
 * Visões:
 * - Admin/Super Admin: visão completa — todos os KPIs e gráficos
 * - Financeiro: foco em receita, inadimplência e cobranças
 * - Recepção: foco em alunos, check-ins e matrículas
 * - Professor: foco em alunos ativos, check-ins e turmas
 */
import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/contexts/auth.context';
import {
  Users, CreditCard, DollarSign, CheckSquare,
  TrendingUp, AlertCircle, Loader2, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar,
} from 'recharts';

// ── Cores padrão ─────────────────────────────────────────
const COLORS = {
  blue:    '#3b82f6',
  green:   '#22c55e',
  purple:  '#a855f7',
  yellow:  '#eab308',
  red:     '#ef4444',
  cyan:    '#06b6d4',
  indigo:  '#6366f1',
  emerald: '#10b981',
};

// ── Tooltip customizado ──────────────────────────────────
function CustomTooltip({ active, payload, label, suffix = '' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color ?? entry.fill ?? '#fff' }} className="font-medium">
          {entry.name}: {entry.value?.toLocaleString('pt-BR')}{suffix}
        </p>
      ))}
    </div>
  );
}

// ── Card de KPI reutilizável ─────────────────────────────
function KpiCard({
  title, value, icon: Icon, color, bg, border,
}: {
  title:   string;
  value:   string | number;
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  border:  string;
}) {
  return (
    <div className={'bg-gray-900 border ' + border + ' rounded-2xl p-5'}>
      <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-3 ' + bg}>
        <Icon className={'w-5 h-5 ' + color} />
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-gray-400 text-sm mt-1.5">{title}</p>
    </div>
  );
}

// ── Saudação por role ────────────────────────────────────
const roleGreetings: Record<string, string> = {
  super_admin:  'Visão completa do sistema',
  admin:        'Visão completa da academia',
  receptionist: 'Painel da Recepção',
  financial:    'Painel Financeiro',
  teacher:      'Painel do Professor',
};

// ════════════════════════════════════════════════════════
// VISÃO ADMIN — todos os KPIs e gráficos
// ════════════════════════════════════════════════════════
function AdminDashboard({ summary }: { summary: DashboardSummary }) {
  const studentsDistribution = [
    { name: 'Ativos',     value: summary.students.active,    color: COLORS.green  },
    { name: 'Pendentes',  value: summary.students.pending,   color: COLORS.yellow },
    { name: 'Cancelados', value: summary.students.cancelled, color: COLORS.red    },
  ].filter(d => d.value > 0);

  const checkInData = [
    { name: 'Hoje',     value: summary.attendance.checkInsToday     },
    { name: 'Este Mês', value: summary.attendance.checkInsThisMonth },
  ];

  const totalInvoices      = summary.finance.pendingInvoices + summary.finance.overdueInvoices;
  const inadimplenciaRate  = totalInvoices > 0
    ? Math.round((summary.finance.overdueInvoices / totalInvoices) * 100)
    : 0;

  const financeRadialData = [
    { name: 'Inadimplentes', value: summary.finance.overdueInvoices, fill: COLORS.red    },
    { name: 'Pendentes',     value: summary.finance.pendingInvoices,  fill: COLORS.yellow },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Alunos Ativos"        value={summary.students.active}                         icon={Users}       color="text-blue-400"    bg="bg-blue-500/10"    border="border-blue-500/20"    />
        <KpiCard title="Matrículas Ativas"    value={summary.enrollments.active}                      icon={CreditCard}  color="text-green-400"   bg="bg-green-500/10"   border="border-green-500/20"   />
        <KpiCard title="Novas este Mês"       value={summary.enrollments.newThisMonth}                icon={TrendingUp}  color="text-purple-400"  bg="bg-purple-500/10"  border="border-purple-500/20"  />
        <KpiCard title="Receita do Mês"       value={formatCurrency(summary.finance.revenueThisMonth)} icon={DollarSign}  color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <KpiCard title="Cobranças Pendentes"  value={summary.finance.pendingInvoices}                 icon={AlertCircle} color="text-yellow-400"  bg="bg-yellow-500/10"  border="border-yellow-500/20"  />
        <KpiCard title="Inadimplentes"        value={summary.finance.overdueInvoices}                 icon={AlertCircle} color="text-red-400"     bg="bg-red-500/10"     border="border-red-500/20"     />
        <KpiCard title="Check-ins Hoje"       value={summary.attendance.checkInsToday}                icon={CheckSquare} color="text-cyan-400"    bg="bg-cyan-500/10"    border="border-cyan-500/20"    />
        <KpiCard title="Check-ins no Mês"     value={summary.attendance.checkInsThisMonth}            icon={Activity}    color="text-indigo-400"  bg="bg-indigo-500/10"  border="border-indigo-500/20"  />
      </div>

      {/* Linha 1: Pizza alunos + Barras check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Distribuição de Alunos</h2>
          <p className="text-gray-500 text-xs mb-6">Por status atual</p>
          {studentsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={studentsDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {studentsDistribution.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-55">
              <p className="text-gray-600 text-sm">Nenhum aluno cadastrado</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'Ativos',     value: summary.students.active,    color: 'text-green-400'  },
              { label: 'Pendentes',  value: summary.students.pending,   color: 'text-yellow-400' },
              { label: 'Cancelados', value: summary.students.cancelled, color: 'text-red-400'    },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={'text-lg font-bold ' + item.color}>{item.value}</p>
                <p className="text-gray-500 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Frequência</h2>
          <p className="text-gray-500 text-xs mb-6">Check-ins registrados</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={checkInData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" check-ins" />} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="value" name="Check-ins" radius={[6, 6, 0, 0]}>
                <Cell fill={COLORS.cyan} />
                <Cell fill={COLORS.indigo} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{summary.attendance.checkInsToday}</p>
              <p className="text-gray-500 text-xs mt-0.5">Hoje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">{summary.attendance.checkInsThisMonth}</p>
              <p className="text-gray-500 text-xs mt-0.5">Este mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Financeiro + Matrículas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Situação Financeira</h2>
          <p className="text-gray-500 text-xs mb-4">Cobranças em aberto</p>
          <div className="flex items-center gap-6">
            {totalInvoices > 0 ? (
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius={35} outerRadius={65} data={financeRadialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#1f2937' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-35 h-35 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center">
                  <p className="text-green-400 text-xs font-medium text-center">Tudo em dia</p>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-gray-500 text-xs">Receita do mês</p>
                <p className="text-emerald-400 text-xl font-bold">{formatCurrency(summary.finance.revenueThisMonth)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs">Pendentes</p>
                  <p className="text-yellow-400 text-lg font-bold">{summary.finance.pendingInvoices}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Inadimplentes</p>
                  <p className="text-red-400 text-lg font-bold">{summary.finance.overdueInvoices}</p>
                </div>
              </div>
            </div>
          </div>
          {totalInvoices > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-500 text-xs">Taxa de inadimplência</span>
                <span className={'text-xs font-medium ' + (inadimplenciaRate >= 30 ? 'text-red-400' : inadimplenciaRate >= 15 ? 'text-yellow-400' : 'text-green-400')}>
                  {inadimplenciaRate}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className={'h-1.5 rounded-full transition-all ' + (inadimplenciaRate >= 30 ? 'bg-red-500' : inadimplenciaRate >= 15 ? 'bg-yellow-500' : 'bg-green-500')}
                  style={{ width: Math.min(inadimplenciaRate, 100) + '%' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Matrículas</h2>
          <p className="text-gray-500 text-xs mb-6">Resumo do período</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { name: 'Ativas',       value: summary.enrollments.active       },
              { name: 'Novas no mês', value: summary.enrollments.newThisMonth },
            ]} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" matrículas" />} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="value" name="Matrículas" radius={[6, 6, 0, 0]}>
                <Cell fill={COLORS.green} />
                <Cell fill={COLORS.purple} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{summary.enrollments.active}</p>
              <p className="text-gray-500 text-xs mt-0.5">Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{summary.enrollments.newThisMonth}</p>
              <p className="text-gray-500 text-xs mt-0.5">Novas este mês</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// VISÃO FINANCEIRO — receita, inadimplência, cobranças
// ════════════════════════════════════════════════════════
function FinancialDashboard({ summary }: { summary: DashboardSummary }) {
  const totalInvoices     = summary.finance.pendingInvoices + summary.finance.overdueInvoices;
  const inadimplenciaRate = totalInvoices > 0
    ? Math.round((summary.finance.overdueInvoices / totalInvoices) * 100)
    : 0;

  const financeBarData = [
    { name: 'Pendentes',     value: summary.finance.pendingInvoices,  fill: COLORS.yellow },
    { name: 'Inadimplentes', value: summary.finance.overdueInvoices,  fill: COLORS.red    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs financeiros */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Receita do Mês"      value={formatCurrency(summary.finance.revenueThisMonth)} icon={DollarSign}  color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <KpiCard title="Cobranças Pendentes" value={summary.finance.pendingInvoices}                  icon={AlertCircle} color="text-yellow-400"  bg="bg-yellow-500/10"  border="border-yellow-500/20"  />
        <KpiCard title="Inadimplentes"       value={summary.finance.overdueInvoices}                  icon={AlertCircle} color="text-red-400"     bg="bg-red-500/10"     border="border-red-500/20"     />
      </div>

      {/* Gráfico de barras + indicador de inadimplência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Cobranças em Aberto</h2>
          <p className="text-gray-500 text-xs mb-6">Pendentes vs inadimplentes</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={financeBarData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" cobranças" />} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="value" name="Cobranças" radius={[6, 6, 0, 0]}>
                <Cell fill={COLORS.yellow} />
                <Cell fill={COLORS.red} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-white font-semibold mb-1">Receita do Mês</h2>
            <p className="text-emerald-400 text-4xl font-bold mt-3">
              {formatCurrency(summary.finance.revenueThisMonth)}
            </p>
          </div>

          {/* Taxa de inadimplência */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Taxa de inadimplência</span>
              <span className={'text-sm font-bold ' + (inadimplenciaRate >= 30 ? 'text-red-400' : inadimplenciaRate >= 15 ? 'text-yellow-400' : 'text-green-400')}>
                {inadimplenciaRate}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={'h-2 rounded-full transition-all ' + (inadimplenciaRate >= 30 ? 'bg-red-500' : inadimplenciaRate >= 15 ? 'bg-yellow-500' : 'bg-green-500')}
                style={{ width: Math.min(inadimplenciaRate, 100) + '%' }}
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">
              {totalInvoices === 0 ? 'Nenhuma cobrança em aberto' : totalInvoices + ' cobranças em aberto'}
            </p>
          </div>

          {/* Matrículas como contexto */}
          <div className="pt-2 border-t border-gray-800">
            <p className="text-gray-400 text-xs mb-2">Contexto de matrículas</p>
            <div className="flex gap-6">
              <div>
                <p className="text-white text-xl font-bold">{summary.enrollments.active}</p>
                <p className="text-gray-500 text-xs">Ativas</p>
              </div>
              <div>
                <p className="text-purple-400 text-xl font-bold">{summary.enrollments.newThisMonth}</p>
                <p className="text-gray-500 text-xs">Novas este mês</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// VISÃO RECEPÇÃO — alunos, check-ins, matrículas
// ════════════════════════════════════════════════════════
function ReceptionDashboard({ summary }: { summary: DashboardSummary }) {
  const studentsDistribution = [
    { name: 'Ativos',     value: summary.students.active,    color: COLORS.green  },
    { name: 'Pendentes',  value: summary.students.pending,   color: COLORS.yellow },
    { name: 'Cancelados', value: summary.students.cancelled, color: COLORS.red    },
  ].filter(d => d.value > 0);

  const checkInData = [
    { name: 'Hoje',     value: summary.attendance.checkInsToday     },
    { name: 'Este Mês', value: summary.attendance.checkInsThisMonth },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Alunos Ativos"       value={summary.students.active}              icon={Users}       color="text-blue-400"   bg="bg-blue-500/10"   border="border-blue-500/20"   />
        <KpiCard title="Matrículas Ativas"   value={summary.enrollments.active}           icon={CreditCard}  color="text-green-400"  bg="bg-green-500/10"  border="border-green-500/20"  />
        <KpiCard title="Check-ins Hoje"      value={summary.attendance.checkInsToday}     icon={CheckSquare} color="text-cyan-400"   bg="bg-cyan-500/10"   border="border-cyan-500/20"   />
        <KpiCard title="Novas Matrículas"    value={summary.enrollments.newThisMonth}     icon={TrendingUp}  color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pizza alunos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Situação dos Alunos</h2>
          <p className="text-gray-500 text-xs mb-6">Por status atual</p>
          {studentsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={studentsDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {studentsDistribution.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-50">
              <p className="text-gray-600 text-sm">Nenhum aluno cadastrado</p>
            </div>
          )}
        </div>

        {/* Check-ins */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Frequência</h2>
          <p className="text-gray-500 text-xs mb-6">Check-ins registrados</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={checkInData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" check-ins" />} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="value" name="Check-ins" radius={[6, 6, 0, 0]}>
                <Cell fill={COLORS.cyan} />
                <Cell fill={COLORS.indigo} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{summary.attendance.checkInsToday}</p>
              <p className="text-gray-500 text-xs mt-0.5">Hoje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">{summary.attendance.checkInsThisMonth}</p>
              <p className="text-gray-500 text-xs mt-0.5">Este mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de inadimplência — visível para recepção como informação */}
      {summary.finance.overdueInvoices > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">
              {summary.finance.overdueInvoices} aluno(s) com cobrança vencida
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Verifique o módulo financeiro para detalhes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// VISÃO PROFESSOR — alunos ativos e check-ins
// ════════════════════════════════════════════════════════
function TeacherDashboard({ summary }: { summary: DashboardSummary }) {
  const checkInData = [
    { name: 'Hoje',     value: summary.attendance.checkInsToday     },
    { name: 'Este Mês', value: summary.attendance.checkInsThisMonth },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs do professor */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Alunos Ativos"   value={summary.students.active}              icon={Users}       color="text-blue-400"   bg="bg-blue-500/10"   border="border-blue-500/20"   />
        <KpiCard title="Check-ins Hoje"  value={summary.attendance.checkInsToday}     icon={CheckSquare} color="text-cyan-400"   bg="bg-cyan-500/10"   border="border-cyan-500/20"   />
        <KpiCard title="Check-ins Mês"   value={summary.attendance.checkInsThisMonth} icon={Activity}    color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
      </div>

      {/* Gráfico de check-ins + cards de contexto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Frequência dos Alunos</h2>
          <p className="text-gray-500 text-xs mb-6">Check-ins registrados</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={checkInData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip suffix=" check-ins" />} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="value" name="Check-ins" radius={[6, 6, 0, 0]}>
                <Cell fill={COLORS.cyan} />
                <Cell fill={COLORS.indigo} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de contexto */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Visão Geral da Academia</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Alunos ativos</span>
                <span className="text-blue-400 text-xl font-bold">{summary.students.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Alunos pendentes</span>
                <span className="text-yellow-400 text-xl font-bold">{summary.students.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Matrículas ativas</span>
                <span className="text-green-400 text-xl font-bold">{summary.enrollments.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Novas matrículas</span>
                <span className="text-purple-400 text-xl font-bold">{summary.enrollments.newThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — seleciona visão por role
// ════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { role, isAdmin, isFinancial, isReception, isTeacher } = useRole();
  const { user } = useAuth();

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <p className="text-gray-400">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  // Saudação personalizada
  const hora       = new Date().getHours();
  const saudacao   = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const subtitulo  = roleGreetings[role] ?? 'Visão geral';

  return (
    <div className="p-6 space-y-6">

      {/* Header personalizado */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {saudacao}, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">{subtitulo}</p>
      </div>

      {/* Visão por role */}
      {isAdmin     && <AdminDashboard     summary={summary} />}
      {isFinancial && <FinancialDashboard summary={summary} />}
      {isReception && <ReceptionDashboard summary={summary} />}
      {isTeacher   && <TeacherDashboard   summary={summary} />}
    </div>
  );
}
