'use client';

/**
 * attendance/page.tsx
 * Página de check-in e histórico de frequência.
 */
import { useEffect, useState } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { studentsService } from '@/services/students.service';
import { Attendance, Student } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { CheckSquare, Loader2, Search } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [attendanceData, studentsData] = await Promise.all([
          attendanceService.findAll(),
          studentsService.findAll('active'),
        ]);
        setRecords(attendanceData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  /**
   * Registra um check-in para o aluno selecionado.
   * Atualiza a lista de check-ins após registrar.
   */
  async function handleCheckIn() {
    if (!selectedStudent) return;
    setIsChecking(true);

    try {
      await attendanceService.create({ studentId: selectedStudent });

      // Recarrega a lista de check-ins
      const data = await attendanceService.findAll();
      setRecords(data);

      // Exibe mensagem de sucesso
      const student = students.find((s) => s.id === selectedStudent);
      setSuccess(`Check-in de ${student?.name} registrado com sucesso!`);
      setSelectedStudent('');

      // Remove a mensagem após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao registrar check-in:', error);
    } finally {
      setIsChecking(false);
    }
  }

  // Filtra registros pelo nome do aluno
  const filtered = records.filter((r) =>
    r.student?.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Check-in</h1>
        <p className="text-gray-400 mt-1">Registre a presença dos alunos</p>
      </div>

      {/* Card de registro de check-in */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Registrar Check-in</h2>

        {/* Mensagem de sucesso */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          {/* Seletor de aluno */}
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o aluno...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>

          {/* Botão de check-in */}
          <button
            onClick={handleCheckIn}
            disabled={!selectedStudent || isChecking}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckSquare className="w-4 h-4" />
            )}
            Check-in
          </button>
        </div>
      </div>

      {/* Busca no histórico */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome do aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Tabela de histórico */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ALUNO</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DATA E HORA</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">OBSERVAÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-12">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum check-in registrado
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {record.student?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{record.student?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDateTime(record.checkedInAt)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{record.observations ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
