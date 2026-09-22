'use client';

/**
 * students/page.tsx
 * Página de listagem de alunos com paginação e busca.
 *
 * Funcionalidades:
 * - Lista todos os alunos do tenant com busca por nome/email
 * - Paginação client-side com seletor de itens por página
 * - Busca reseta para a página 1 automaticamente
 * - Nome do aluno é clicável e navega para a página de detalhe
 * - Botão "Novo Aluno" abre o StudentModal para criação
 * - Botão "Editar" abre o StudentModal com dados preenchidos
 * - Botão "Remover" abre o ConfirmModal e executa soft delete
 */
import { useEffect, useState } from 'react';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, Plus, Loader2, Search } from 'lucide-react';
import { StudentModal } from '@/components/modals/studentModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { Pagination } from '@/components/pagination';

// Mapeamento de status para cor e label em português
const statusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Ativo',     color: 'bg-green-500/10 text-green-400'   },
  pending:   { label: 'Pendente',  color: 'bg-yellow-500/10 text-yellow-400' },
  lead:      { label: 'Lead',      color: 'bg-blue-500/10 text-blue-400'     },
  blocked:   { label: 'Bloqueado', color: 'bg-red-500/10 text-red-400'       },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-400'     },
};

const DEFAULT_PER_PAGE = 10;

export default function StudentsPage() {
  const [students, setStudents]               = useState<Student[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isDeleting, setIsDeleting]           = useState(false);
  const [search, setSearch]                   = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [itemsPerPage, setItemsPerPage]       = useState(DEFAULT_PER_PAGE);
  const [modalOpen, setModalOpen]             = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [confirmOpen, setConfirmOpen]         = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  /**
   * Busca todos os alunos do tenant via API.
   * Chamada ao montar a página e após criar/editar/remover.
   */
  async function loadStudents() {
    try {
      const data = await studentsService.findAll();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  // Filtra por busca — case-insensitive por nome e email
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Fatia os dados para a página atual
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Ao buscar, volta para página 1
  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleNew() {
    setSelectedStudent(null);
    setModalOpen(true);
  }

  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setModalOpen(true);
  }

  function handleDeleteClick(student: Student) {
    setStudentToDelete(student);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await studentsService.remove(studentToDelete.id);
      await loadStudents();
      setConfirmOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Modal de criação/edição */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedStudent(null); }}
        onSuccess={loadStudents}
        student={selectedStudent}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setStudentToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Remover Aluno"
        message={'Tem certeza que deseja remover o aluno "' + studentToDelete?.name + '"? Esta ação não pode ser desfeita.'}
        confirmLabel="Sim, remover"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Alunos</h1>
          <p className="text-gray-400 mt-1">{students.length} aluno(s) cadastrado(s)</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </button>
      </div>

      {/* Campo de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Tabela */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">NOME</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">EMAIL</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">TELEFONE</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">CADASTRO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-12">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum aluno encontrado
                </td>
              </tr>
            ) : (
              paginated.map((student) => {
                const status = statusConfig[student.status];
                return (
                  <tr
                    key={student.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Nome com avatar e link para detalhe */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>

                        <a
                          href={`/students/${student.id}`}
                          className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
                        >
                          {student.name}
                        </a>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-400 text-sm">{student.email}</td>

                    {/* Telefone */}
                    <td className="px-6 py-4 text-gray-400 text-sm">{student.phone ?? '—'}</td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + status.color}>
                        {status.label}
                      </span>
                    </td>

                    {/* Data de cadastro */}
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(student.createdAt)}</td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(perPage) => {
            setItemsPerPage(perPage);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
