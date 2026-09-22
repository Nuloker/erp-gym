'use client';

/**
 * reports/page.tsx
 * Página de relatórios com exportação CSV.
 *
 * Relatórios disponíveis:
 * 1. Alunos — lista completa com status e objetivo
 * 2. Inadimplência — cobranças vencidas por aluno
 * 3. Pagamentos — cobranças pagas no período
 * 4. Matrículas — matrículas por status e plano
 * 5. Frequência — check-ins por período
 *
 * Cada relatório:
 * - Busca dados dos services existentes
 * - Exibe preview em tabela
 * - Exporta para CSV com um clique
 */
import { useState } from 'react';
import { studentsService } from '@/services/students.service';
import { financeService } from '@/services/finance.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { attendanceService } from '@/services/attendance.service';
import { Student, Invoice, Enrollment, Attendance } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  FileText, Download, Loader2, Users,
  DollarSign, CreditCard, CheckSquare, AlertCircle,
} from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────

type ReportType = 'students' | 'overdue' | 'payments' | 'enrollments' | 'attendance';

interface ReportConfig {
  id:          ReportType;
  label:       string;
  description: string;
  icon:        React.ElementType;
  color:       string;
  bg:          string;
}

// ── Configuração dos relatórios disponíveis ──────────────
const REPORTS: ReportConfig[] = [
  {
    id:          'students',
    label:       'Alunos',
    description: 'Lista completa de alunos com status e objetivo',
    icon:        Users,
    color:       'text-blue-400',
    bg:          'bg-blue-500/10',
  },
  {
    id:          'overdue',
    label:       'Inadimplência',
    description: 'Cobranças vencidas e em aberto por aluno',
    icon:        AlertCircle,
    color:       'text-red-400',
    bg:          'bg-red-500/10',
  },
  {
    id:          'payments',
    label:       'Pagamentos',
    description: 'Cobranças pagas com valor e método de pagamento',
    icon:        DollarSign,
    color:       'text-green-400',
    bg:          'bg-green-500/10',
  },
  {
    id:          'enrollments',
    label:       'Matrículas',
    description: 'Matrículas por status, plano e período',
    icon:        CreditCard,
    color:       'text-purple-400',
    bg:          'bg-purple-500/10',
  },
  {
    id:          'attendance',
    label:       'Frequência',
    description: 'Histórico de check-ins por período',
    icon:        CheckSquare,
    color:       'text-cyan-400',
    bg:          'bg-cyan-500/10',
  },
];

// ── Labels de status ─────────────────────────────────────
const studentStatusLabels: Record<string, string> = {
  active:    'Ativo',
  pending:   'Pendente',
  lead:      'Lead',
  blocked:   'Bloqueado',
  cancelled: 'Cancelado',
};

const enrollmentStatusLabels: Record<string, string> = {
  active:    'Ativa',
  pending:   'Pendente',
  frozen:    'Pausada',
  cancelled: 'Cancelada',
  expired:   'Vencida',
};

const goalLabels: Record<string, string> = {
  weight_loss:    'Emagrecimento',
  hypertrophy:    'Hipertrofia',
  conditioning:   'Condicionamento',
  rehabilitation: 'Reabilitação',
  other:          'Outro',
};

// ── Utilitário de exportação CSV ─────────────────────────

/**
 * Converte array de objetos em string CSV e faz download.
 * Trata vírgulas e aspas nos valores automaticamente.
 */
function exportToCsv(filename: string, rows: Record<string, string>[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    // Cabeçalho
    headers.join(';'),
    // Linhas de dados
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        // Envolve em aspas se contiver ponto-e-vírgula, aspas ou quebra de linha
        return val.includes(';') || val.includes('"') || val.includes('\n')
          ? '"' + val.replace(/"/g, '""') + '"'
          : val;
      }).join(';')
    ),
  ].join('\n');

  // Cria blob com BOM para Excel reconhecer UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename + '_' + new Date().toISOString().substring(0, 10) + '.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// ── Página principal ─────────────────────────────────────

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

  // Dados carregados por relatório
  const [students,    setStudents]    = useState<Student[]>([]);
  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance,  setAttendance]  = useState<Attendance[]>([]);

  // ── Carregamento por tipo de relatório ───────────────────

  async function loadReport(type: ReportType) {
    setActiveReport(type);
    setIsLoading(true);
    setError('');

    try {
      switch (type) {
        case 'students': {
          const data = await studentsService.findAll();
          setStudents(data);
          break;
        }
        case 'overdue': {
          const data = await financeService.findAllInvoices('overdue');
          setInvoices(data);
          break;
        }
        case 'payments': {
          const data = await financeService.findAllInvoices('paid');
          setInvoices(data);
          break;
        }
        case 'enrollments': {
          const data = await enrollmentsService.findAll();
          setEnrollments(data);
          break;
        }
        case 'attendance': {
          const data = await attendanceService.findAll();
          setAttendance(data);
          break;
        }
      }
    } catch (err) {
      setError('Erro ao carregar relatório. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Exportação CSV por tipo ──────────────────────────────

  function handleExport() {
    switch (activeReport) {
      case 'students':
        exportToCsv('relatorio_alunos', students.map(s => ({
          'Nome':            s.name,
          'Email':           s.email,
          'Telefone':        s.phone        ?? '',
          'CPF':             s.document     ?? '',
          'Status':          studentStatusLabels[s.status] ?? s.status,
          'Objetivo':        s.goal ? (goalLabels[s.goal] ?? s.goal) : '',
          'Cadastrado em':   formatDate(s.createdAt),
        })));
        break;

      case 'overdue':
        exportToCsv('relatorio_inadimplencia', invoices.map(i => ({
          'Aluno':       i.student?.name ?? '',
          'Descrição':   i.description,
          'Valor':       formatCurrency(i.amount),
          'Vencimento':  formatDate(i.dueDate),
          'Status':      'Vencido',
        })));
        break;

      case 'payments':
        exportToCsv('relatorio_pagamentos', invoices.map(i => ({
          'Aluno':       i.student?.name ?? '',
          'Descrição':   i.description,
          'Valor':       formatCurrency(i.amount),
          'Vencimento':  formatDate(i.dueDate),
          'Status':      'Pago',
        })));
        break;

      case 'enrollments':
        exportToCsv('relatorio_matriculas', enrollments.map(e => ({
          'Aluno':       e.student?.name  ?? '',
          'Plano':       e.plan?.name     ?? '',
          'Início':      formatDate(e.startDate),
          'Vencimento':  formatDate(e.endDate),
          'Status':      enrollmentStatusLabels[e.status] ?? e.status,
        })));
        break;

      case 'attendance':
        exportToCsv('relatorio_frequencia', attendance.map(a => ({
          'Aluno':        a.student?.name ?? '',
          'Data/Hora':    formatDate(a.checkedInAt),
          'Observações':  a.observations ?? '',
        })));
        break;
    }
  }

  // ── Contagem de registros por relatório ──────────────────
  function getCount(): number {
    switch (activeReport) {
      case 'students':    return students.length;
      case 'overdue':
      case 'payments':    return invoices.length;
      case 'enrollments': return enrollments.length;
      case 'attendance':  return attendance.length;
      default:            return 0;
    }
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Relatórios</h1>
        <p className="text-gray-400 text-sm mt-1">
          Selecione um relatório para visualizar e exportar os dados
        </p>
      </div>

      {/* Grid de cards de relatórios */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {REPORTS.map((report) => {
          const Icon      = report.icon;
          const isActive  = activeReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => loadReport(report.id)}
              className={
                'flex flex-col items-start p-4 rounded-xl border text-left transition-all ' + (
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                )
              }
            >
              <div className={
                'p-2 rounded-lg mb-3 ' + (isActive ? 'bg-white/10' : report.bg)
              }>
                <Icon className={'w-4 h-4 ' + (isActive ? 'text-white' : report.color)} />
              </div>
              <p className={'text-sm font-semibold ' + (isActive ? 'text-white' : 'text-white')}>
                {report.label}
              </p>
              <p className={'text-xs mt-0.5 ' + (isActive ? 'text-blue-100' : 'text-gray-500')}>
                {report.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Área do relatório */}
      {activeReport && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Barra de ações */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div>
              <h2 className="text-white font-semibold">
                {REPORTS.find(r => r.id === activeReport)?.label}
              </h2>
              {!isLoading && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {getCount()} {getCount() === 1 ? 'registro encontrado' : 'registros encontrados'}
                </p>
              )}
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || getCount() === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Erro */}
          {!isLoading && error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Tabela: Alunos ───────────────────────────── */}
          {!isLoading && !error && activeReport === 'students' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">NOME</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">EMAIL</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">TELEFONE</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">STATUS</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">OBJETIVO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">CADASTRO</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-12">
                      Nenhum aluno encontrado
                    </td>
                  </tr>
                ) : students.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white text-sm font-medium">{s.name}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{s.email}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{s.phone ?? '—'}</td>
                    <td className="px-6 py-3">
                      <span className="text-gray-300 text-sm">
                        {studentStatusLabels[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {s.goal ? (goalLabels[s.goal] ?? s.goal) : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Tabela: Inadimplência ────────────────────── */}
          {!isLoading && !error && activeReport === 'overdue' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">ALUNO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">DESCRIÇÃO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VALOR</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VENCIMENTO</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-12">
                      Nenhuma cobrança vencida encontrada
                    </td>
                  </tr>
                ) : invoices.map(i => (
                  <tr key={i.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white text-sm font-medium">{i.student?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{i.description}</td>
                    <td className="px-6 py-3 text-red-400 text-sm font-medium">{formatCurrency(i.amount)}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(i.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Tabela: Pagamentos ───────────────────────── */}
          {!isLoading && !error && activeReport === 'payments' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">ALUNO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">DESCRIÇÃO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VALOR</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VENCIMENTO</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-12">
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                ) : invoices.map(i => (
                  <tr key={i.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white text-sm font-medium">{i.student?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{i.description}</td>
                    <td className="px-6 py-3 text-green-400 text-sm font-medium">{formatCurrency(i.amount)}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(i.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Tabela: Matrículas ───────────────────────── */}
          {!isLoading && !error && activeReport === 'enrollments' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">ALUNO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">PLANO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">INÍCIO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">VENCIMENTO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">
                      Nenhuma matrícula encontrada
                    </td>
                  </tr>
                ) : enrollments.map(e => (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white text-sm font-medium">{e.student?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{e.plan?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(e.startDate)}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(e.endDate)}</td>
                    <td className="px-6 py-3">
                      <span className="text-gray-300 text-sm">
                        {enrollmentStatusLabels[e.status] ?? e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Tabela: Frequência ───────────────────────── */}
          {!isLoading && !error && activeReport === 'attendance' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">ALUNO</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">DATA/HORA</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-3">OBSERVAÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 py-12">
                      Nenhum check-in encontrado
                    </td>
                  </tr>
                ) : attendance.map(a => (
                  <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white text-sm font-medium">{a.student?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{formatDate(a.checkedInAt)}</td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{a.observations ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Estado inicial — nenhum relatório selecionado */}
      {!activeReport && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-900 border border-gray-800 rounded-2xl">
          <FileText className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Selecione um relatório acima</p>
          <p className="text-gray-600 text-sm mt-1">Os dados serão carregados e exibidos aqui</p>
        </div>
      )}
    </div>
  );
}
