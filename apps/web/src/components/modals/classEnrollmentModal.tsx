'use client';

/**
 * classEnrollmentModal.tsx
 * Modal para inscrever um aluno em uma turma.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar
 * - onSuccess: função chamada após salvar — recarrega a turma
 * - classGroupId: ID da turma que receberá o aluno
 * - currentStudentIds: IDs dos alunos já inscritos — excluídos da lista
 *
 * Funcionalidades:
 * - Carrega lista de alunos ativos ao abrir
 * - Remove da lista alunos já inscritos na turma
 * - Busca por nome para facilitar seleção em turmas grandes
 */
import { useEffect, useState } from 'react';
import { studentsService } from '@/services/students.service';
import { classesService } from '@/services/classes.service';
import { Student } from '@/types';
import { X, Loader2, Search } from 'lucide-react';

interface ClassEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classGroupId: string;
  currentStudentIds: string[]; // IDs dos alunos já inscritos
}

export function ClassEnrollmentModal({
  isOpen,
  onClose,
  onSuccess,
  classGroupId,
  currentStudentIds,
}: ClassEnrollmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [search, setSearch] = useState('');

  /**
   * Carrega alunos ativos ao abrir o modal.
   * Remove da lista os alunos já inscritos na turma.
   */
  useEffect(() => {
    if (!isOpen) return;

    async function loadStudents() {
      setIsLoadingData(true);
      try {
        const data = await studentsService.findAll('active');

        // Filtra alunos que já estão inscritos na turma
        const available = data.filter(
          (s) => !currentStudentIds.includes(s.id),
        );
        setStudents(available);
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadStudents();
    setSelectedStudentId('');
    setSearch('');
    setError('');
  }, [isOpen, currentStudentIds]);

  /**
   * Filtra alunos pelo nome digitado na busca.
   * Filtragem local para evitar requisições desnecessárias.
   */
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  /**
   * handleEnroll
   * Inscreve o aluno selecionado na turma.
   * Valida se um aluno foi selecionado antes de enviar.
   */
  async function handleEnroll() {
    if (!selectedStudentId) return;
    setIsLoading(true);
    setError('');

    try {
      await classesService.enrollStudent(classGroupId, selectedStudentId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao inscrever aluno');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Inscrever Aluno</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Busca de aluno */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>

              {/* Lista de alunos disponíveis */}
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-6">
                    Nenhum aluno disponível
                  </p>
                ) : (
                  filtered.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                        selectedStudentId === student.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      {/* Avatar com inicial */}
                      <div className="w-7 h-7 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs opacity-60">{student.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={!selectedStudentId || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Inscrevendo...</>
              ) : (
                'Inscrever Aluno'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
