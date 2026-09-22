'use client';

/**
 * students/[id]/page.tsx
 * Página de detalhe do aluno.
 *
 * Exibe todas as informações do aluno em abas:
 * - Visão Geral: dados pessoais e de contato
 * - Matrículas: histórico de planos contratados
 * - Financeiro: cobranças e pagamentos
 * - Frequência: histórico de check-ins
 *
 * O ID do aluno é extraído da URL via useParams.
 * Todos os dados são carregados em paralelo via Promise.all
 * para melhor performance.
 */
import { MouseEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studentsService } from '@/services/students.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { financeService } from '@/services/finance.service';
import { attendanceService } from '@/services/attendance.service';
import { Student, Enrollment, Invoice, Attendance, PhysicalAssessment } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { AssessmentModal } from '@/components/modals/assessmentsModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { assessmentsService } from '@/services/assessments.service';
import {
  ArrowLeft, Loader2, User, CreditCard,
  DollarSign, CheckSquare, Phone, Mail,
  MapPin, AlertCircle, Activity,
  Plus, Pencil, Trash2, ChevronDown, ChevronUp, // ← novos
} from 'lucide-react';


// Configuração de cores e labels por status de matrícula
const enrollmentStatusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Ativa',     color: 'bg-green-500/10 text-green-400' },
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  frozen:    { label: 'Pausada',   color: 'bg-blue-500/10 text-blue-400' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400' },
  expired:   { label: 'Vencida',   color: 'bg-gray-500/10 text-gray-400' },
};

// Configuração de cores e labels por status de cobrança
const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  paid:      { label: 'Pago',      color: 'bg-green-500/10 text-green-400' },
  overdue:   { label: 'Vencido',   color: 'bg-red-500/10 text-red-400' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-400' },
};

// Configuração de cores e labels por status do aluno
const studentStatusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Ativo',     color: 'bg-green-500/10 text-green-400' },
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  lead:      { label: 'Lead',      color: 'bg-blue-500/10 text-blue-400' },
  blocked:   { label: 'Bloqueado', color: 'bg-red-500/10 text-red-400' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-400' },
};

// Labels dos objetivos em português
const goalLabels: Record<string, string> = {
  weight_loss:     'Emagrecimento',
  hypertrophy:     'Hipertrofia',
  conditioning:    'Condicionamento',
  rehabilitation:  'Reabilitação',
  other:           'Outro',
};

// Tabs disponíveis na página de detalhe
type Tab = 'overview' | 'enrollments' | 'finance' | 'attendance' | 'assessments';

export default function StudentDetailPage() {
  // Extrai o ID do aluno da URL ex: /students/uuid-aqui
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Estado dos dados carregados
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attendanceData, setAttendanceData] = useState<{
    totalCheckIns: number;
    records: Attendance[];
  } | null>(null);
  const [assessments, setAssessments]           = useState<PhysicalAssessment[]>([]);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment]   = useState<PhysicalAssessment | null>(null);
  const [confirmOpen, setConfirmOpen]           = useState(false);
  const [assessmentToDelete, setAssessmentToDelete]   = useState<PhysicalAssessment | null>(null);
  const [expandedId, setExpandedId]             = useState<string | null>(null);

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // Tab ativa no momento
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  /**
   * Carrega todos os dados do aluno em paralelo.
   * Usa Promise.all para fazer todas as requisições simultaneamente
   * reduzindo o tempo total de carregamento.
   */
  useEffect(() => {
    async function loadData() {
      try {
        const [studentData, enrollmentsData, invoicesData, attendanceResult, assessmentsData] =
          await Promise.all([
            // Dados pessoais do aluno
            studentsService.findOne(id),

            // Matrículas do aluno
            enrollmentsService.findByStudent(id),

            // Cobranças do aluno
            financeService.findAllInvoices(undefined, id),

            // Histórico de frequência
            attendanceService.findByStudent(id),

            // Avaliações do aluno
            assessmentsService.findByStudent(id),
          ]);

        setStudent(studentData);
        setEnrollments(enrollmentsData);
        setInvoices(invoicesData);
        setAttendanceData(attendanceResult);
        setAssessments(assessmentsData);
      } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  // Exibe spinner enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Exibe mensagem se aluno não encontrado
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-400">Aluno não encontrado</p>
        <button
          onClick={() => router.push('/students')}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const studentStatus = studentStatusConfig[student.status];

  async function reloadAssessments(): Promise<void> {
    const data = await assessmentsService.findByStudent(id);
    setAssessments(data);
  }

  function handleNewAssessment(): void {
    setSelectedAssessment(null);
    setAssessmentModalOpen(true);
  }

  function handleEditAssessment(assessment: PhysicalAssessment, e: MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    setSelectedAssessment(assessment);
    setAssessmentModalOpen(true);
  }

  function handleDeleteAssessment(assessment: PhysicalAssessment, e: MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    setAssessmentToDelete(assessment);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!assessmentToDelete) return;
    await assessmentsService.remove(assessmentToDelete.id);
    await reloadAssessments();
    setConfirmOpen(false);
    setAssessmentToDelete(null);
  }

  return (
    <div className="p-8">

      {/* Botão voltar */}
      <button
        onClick={() => router.push('/students')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Alunos
      </button>

      {/* Header do aluno */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">

          {/* Avatar grande com inicial */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>

          {/* Dados principais */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${studentStatus.color}`}>
                {studentStatus.label}
              </span>
            </div>

            {/* Objetivo do aluno */}
            {student.goal && (
              <p className="text-gray-400 text-sm mb-3">
                Objetivo: {goalLabels[student.goal]}
              </p>
            )}

            {/* Informações de contato em linha */}
            <div className="flex flex-wrap gap-4">
              {student.email && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  {student.email}
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {student.phone}
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {student.address}
                </div>
              )}
            </div>
          </div>

          {/* Cards de resumo rápido */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{enrollments.length}</p>
              <p className="text-gray-400 text-xs">Matrículas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
              <p className="text-gray-400 text-xs">Cobranças</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {attendanceData?.totalCheckIns ?? 0}
              </p>
              <p className="text-gray-400 text-xs">Check-ins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'overview',    label: 'Visão Geral', icon: User },
          { id: 'enrollments', label: 'Matrículas',  icon: CreditCard },
          { id: 'finance',     label: 'Financeiro',  icon: DollarSign },
          { id: 'attendance',  label: 'Frequência',  icon: CheckSquare },
          { id: 'assessments', label: 'Avaliações',  icon: Activity},
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB VISÃO GERAL ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Dados pessoais */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Dados Pessoais</h2>
            <div className="space-y-3">
              {[
                { label: 'Nome completo',    value: student.name },
                { label: 'Email',            value: student.email },
                { label: 'Telefone',         value: student.phone },
                { label: 'CPF/Documento',    value: student.document },
                { label: 'Data de nascimento', value: student.birthDate ? formatDate(student.birthDate) : null },
                { label: 'Sexo',             value: student.gender },
                { label: 'Endereço',         value: student.address },
                { label: 'Cadastrado em',    value: formatDate(student.createdAt) },
              ].map((item) => (
                item.value ? (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white text-sm">{item.value}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>

          {/* Contato de emergência e saúde */}
          <div className="space-y-6">

            {/* Contato de emergência */}
            {(student.emergencyContactName || student.emergencyContactPhone) && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Contato de Emergência</h2>
                <div className="space-y-3">
                  {student.emergencyContactName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Nome</span>
                      <span className="text-white text-sm">{student.emergencyContactName}</span>
                    </div>
                  )}
                  {student.emergencyContactPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Telefone</span>
                      <span className="text-white text-sm">{student.emergencyContactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observações de saúde */}
            {student.healthNotes && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Observações de Saúde</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{student.healthNotes}</p>
              </div>
            )}

            {/* Observações gerais */}
            {student.observations && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Observações Gerais</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{student.observations}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB MATRÍCULAS ───────────────────────────────── */}
      {activeTab === 'enrollments' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">PLANO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">INÍCIO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VENCIMENTO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-12">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhuma matrícula encontrada
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => {
                  const status = enrollmentStatusConfig[enrollment.status];
                  return (
                    <tr key={enrollment.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white text-sm font-medium">
                        {enrollment.plan?.name ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(enrollment.startDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(enrollment.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB FINANCEIRO ───────────────────────────────── */}
      {activeTab === 'finance' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DESCRIÇÃO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VALOR</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">VENCIMENTO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-12">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhuma cobrança encontrada
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const status = invoiceStatusConfig[invoice.status];
                  return (
                    <tr key={invoice.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white text-sm">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-medium">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB FREQUÊNCIA ───────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">

          {/* Card resumo de frequência */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/10 p-3 rounded-xl">
                <CheckSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {attendanceData?.totalCheckIns ?? 0}
                </p>
                <p className="text-gray-400 text-sm">Total de check-ins realizados</p>
              </div>
            </div>
          </div>

          {/* Histórico de check-ins */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DATA E HORA</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">OBSERVAÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {(attendanceData?.records ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 py-12">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Nenhum check-in registrado
                    </td>
                  </tr>
                ) : (
                  (attendanceData?.records ?? []).map((record) => (
                    <tr key={record.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white text-sm">
                        {formatDateTime(record.checkedInAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {record.observations ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB AVALIAÇÕES ──────────────────────────────── */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">

          {/* Header com botão */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {assessments.length} {assessments.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
              </p>
            <button
              onClick={handleNewAssessment}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
              <Plus className="w-4 h-4" />
                Nova Avaliação
            </button>
        </div>

      {/* Estado vazio */}
      {assessments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-900 border border-gray-800 rounded-2xl">
          <Activity className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">Nenhuma avaliação registrada</p>
            <p className="text-gray-600 text-sm mt-1">Clique em &quot;Nova Avaliação&quot; para registrar</p>
        </div>
      )}

      {/* Lista em accordion */}
      {assessments.length > 0 && (
        <div className="space-y-3">
          {assessments.map((assessment) => {
            const isExpanded = expandedId === assessment.id;
              return (
                <div key={assessment.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

                {/* Cabeçalho clicável */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {'Avaliação — ' + formatDate(assessment.assessmentDate)}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {assessment.weight && (
                        <span className="text-gray-400 text-xs">{assessment.weight + ' kg'}</span>
                      )}
                      {assessment.height && (
                        <span className="text-gray-400 text-xs">{assessment.height + ' cm'}</span>
                      )}
                      {assessment.bmi && (
                        <span className={
                          'text-xs px-2 py-0.5 rounded-full ' + (
                            Number(assessment.bmi) < 18.5 ? 'bg-blue-500/10 text-blue-400'     :
                            Number(assessment.bmi) < 25   ? 'bg-green-500/10 text-green-400'   :
                            Number(assessment.bmi) < 30   ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          )
                        }>
                          {'IMC ' + Number(assessment.bmi).toFixed(1)}
                        </span>
                      )}
                      {assessment.bodyFatPercentage && (
                        <span className="text-gray-400 text-xs">{assessment.bodyFatPercentage + '% gordura'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditAssessment(assessment, e)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteAssessment(assessment, e)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                  }
                </div>
              </div>

              {/* Conteúdo expandido */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 grid grid-cols-2 gap-6">

                  {/* Composição corporal */}
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Composição Corporal</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Peso',         value: assessment.weight           != null ? assessment.weight + ' kg'  : '—' },
                        { label: 'Altura',       value: assessment.height           != null ? assessment.height + ' cm'  : '—' },
                        { label: 'IMC',          value: assessment.bmi              != null ? Number(assessment.bmi).toFixed(1) : '—' },
                        { label: '% Gordura',    value: assessment.bodyFatPercentage != null ? assessment.bodyFatPercentage + '%' : '—' },
                        { label: 'Massa Magra',  value: assessment.leanMass         != null ? assessment.leanMass + ' kg' : '—' },
                        { label: 'Massa Gorda',  value: assessment.fatMass          != null ? assessment.fatMass + ' kg'  : '—' },
                        { label: 'Meta de Peso', value: assessment.weightGoal       != null ? assessment.weightGoal + ' kg' : '—' },
                      ].map(item => (
                        <div key={item.label} className="bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-gray-500 text-xs">{item.label}</p>
                          <p className="text-white text-sm font-medium mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Circunferências */}
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Circunferências (cm)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Pescoço',   value: assessment.neckCircumference       != null ? assessment.neckCircumference + ''       : '—' },
                        { label: 'Tórax',     value: assessment.chestCircumference      != null ? assessment.chestCircumference + ''      : '—' },
                        { label: 'Cintura',   value: assessment.waistCircumference      != null ? assessment.waistCircumference + ''      : '—' },
                        { label: 'Quadril',   value: assessment.hipCircumference        != null ? assessment.hipCircumference + ''        : '—' },
                        { label: 'Braço D',   value: assessment.rightArmCircumference   != null ? assessment.rightArmCircumference + ''   : '—' },
                        { label: 'Braço E',   value: assessment.leftArmCircumference    != null ? assessment.leftArmCircumference + ''    : '—' },
                        { label: 'Coxa D',    value: assessment.rightThighCircumference != null ? assessment.rightThighCircumference + '' : '—' },
                        { label: 'Coxa E',    value: assessment.leftThighCircumference  != null ? assessment.leftThighCircumference + ''  : '—' },
                        { label: 'Pantur. D', value: assessment.rightCalfCircumference  != null ? assessment.rightCalfCircumference + ''  : '—' },
                        { label: 'Pantur. E', value: assessment.leftCalfCircumference   != null ? assessment.leftCalfCircumference + ''   : '—' },
                      ].map(item => (
                        <div key={item.label} className="bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-gray-500 text-xs">{item.label}</p>
                          <p className="text-white text-sm font-medium mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observações */}
                  {assessment.observations && (
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Observações</p>
                      <p className="text-gray-300 text-sm bg-gray-800 rounded-lg px-3 py-2">{assessment.observations}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Modais */}
    <AssessmentModal
      isOpen={assessmentModalOpen}
      onClose={() => setAssessmentModalOpen(false)}
      onSuccess={reloadAssessments}
      assessment={selectedAssessment}
      preselectedStudentId={id}
    />

    <ConfirmModal
            isOpen={confirmOpen}
            onClose={() => { setConfirmOpen(false); setAssessmentToDelete(null); } }
            onConfirm={handleDeleteConfirm}
            message={'Remover esta avaliação' + (assessmentToDelete?.assessmentDate ? ' de ' + formatDate(assessmentToDelete.assessmentDate) : '') + '? Esta ação não pode ser desfeita.'} title={''}    />
  </div>
)}
    </div>
  );
}
