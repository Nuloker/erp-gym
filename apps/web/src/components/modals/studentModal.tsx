'use client';

/**
 * StudentModal.tsx
 * Modal de criação e edição de aluno.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar com sucesso — recarrega a lista
 * - student: se informado, abre em modo edição com dados preenchidos
 *
 * Funcionalidades:
 * - Validação com react-hook-form + zod
 * - Criação e edição no mesmo componente
 * - Feedback visual de loading durante o envio
 * - Limpeza do formulário ao fechar
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types';
import { X, Loader2 } from 'lucide-react';

// Schema de validação do formulário de aluno
const studentSchema = z.object({
  name:                  z.string().min(2, 'Nome obrigatório'),
  email:                 z.string().email('Email inválido'),
  phone:                 z.string().optional(),
  document:              z.string().optional(),
  birthDate:             z.string().optional(),
  gender:                z.string().optional(),
  status:                z.enum(['lead', 'active', 'pending', 'blocked', 'cancelled']).optional(),
  goal:                  z.enum(['weight_loss', 'hypertrophy', 'conditioning', 'rehabilitation', 'other']).optional(),
  healthNotes:           z.string().optional(),
  observations:          z.string().optional(),
  emergencyContactName:  z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  address:               z.string().optional(),
});

// Tipo inferido do schema
type StudentForm = z.infer<typeof studentSchema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null; // se informado, modo edição
}

export function StudentModal({ isOpen, onClose, onSuccess, student }: StudentModalProps) {
  // Estado de loading durante o envio do formulário
  const [isLoading, setIsLoading] = useState(false);

  // Mensagem de erro retornada pela API
  const [error, setError] = useState('');

  // Configura o formulário com validação via zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  /**
   * Quando o modal abre em modo edição, preenche os campos
   * com os dados do aluno existente.
   * Quando abre em modo criação, limpa o formulário.
   */
  useEffect(() => {
    if (student) {
      // Preenche formulário com dados do aluno para edição
      reset({
        name:                  student.name,
        email:                 student.email,
        phone:                 student.phone ?? '',
        document:              student.document ?? '',
        birthDate:             student.birthDate ?? '',
        gender:                student.gender ?? '',
        status:                student.status,
        goal:                  student.goal,
        healthNotes:           student.healthNotes ?? '',
        observations:          student.observations ?? '',
        emergencyContactName:  student.emergencyContactName ?? '',
        emergencyContactPhone: student.emergencyContactPhone ?? '',
        address:               student.address ?? '',
      });
    } else {
      // Limpa formulário para criação
      reset({});
    }
  }, [student, reset]);

  /**
   * onSubmit
   * Chama create ou update dependendo se é edição ou criação.
   * Fecha o modal e recarrega a lista após sucesso.
   */
  async function onSubmit(data: StudentForm) {
    setIsLoading(true);
    setError('');

    try {
      if (student) {
        // Modo edição — atualiza o aluno existente
        await studentsService.update(student.id, data);
      } else {
        // Modo criação — cria novo aluno
        await studentsService.create(data);
      }

      // Notifica o pai para recarregar a lista
      onSuccess();

      // Fecha o modal
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar aluno');
    } finally {
      setIsLoading(false);
    }
  }

  // Não renderiza nada se o modal estiver fechado
  if (!isOpen) return null;

  return (
    // Overlay escuro ao fundo
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">

      {/* Container do modal */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {student ? 'Editar Aluno' : 'Novo Aluno'}
          </h2>
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Mensagem de erro da API */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Linha 1: Nome e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nome <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Nome completo"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Linha 2: Telefone e Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone</label>
              <input
                {...register('phone')}
                placeholder="(11) 99999-9999"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Documento (CPF)</label>
              <input
                {...register('document')}
                placeholder="000.000.000-00"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Linha 3: Data de Nascimento e Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Data de Nascimento</label>
              <input
                {...register('birthDate')}
                type="date"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Sexo</label>
              <select
                {...register('gender')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>

          {/* Linha 4: Status e Objetivo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Ativo</option>
                <option value="lead">Lead</option>
                <option value="pending">Pendente</option>
                <option value="blocked">Bloqueado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Objetivo</label>
              <select
                {...register('goal')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="weight_loss">Emagrecimento</option>
                <option value="hypertrophy">Hipertrofia</option>
                <option value="conditioning">Condicionamento</option>
                <option value="rehabilitation">Reabilitação</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Endereço</label>
            <input
              {...register('address')}
              placeholder="Rua, número, bairro, cidade"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Contato de emergência */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contato de Emergência</label>
              <input
                {...register('emergencyContactName')}
                placeholder="Nome do contato"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefone de Emergência</label>
              <input
                {...register('emergencyContactPhone')}
                placeholder="(11) 99999-9999"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Observações de saúde */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações de Saúde</label>
            <textarea
              {...register('healthNotes')}
              placeholder="Lesões, restrições médicas, etc."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Observações gerais */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações Gerais</label>
            <textarea
              {...register('observations')}
              placeholder="Informações adicionais sobre o aluno"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-2">
            {/* Botão cancelar */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>

            {/* Botão salvar */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                student ? 'Salvar Alterações' : 'Criar Aluno'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
