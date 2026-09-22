'use client';

/**
 * classGroupModal.tsx
 * Modal de criação e edição de turma.
 *
 * Props:
 * - isOpen: controla visibilidade do modal
 * - onClose: função chamada ao fechar o modal
 * - onSuccess: função chamada após salvar — recarrega a lista
 * - classGroup: se informado, abre em modo edição com dados preenchidos
 *
 * Funcionalidades:
 * - Carrega lista de modalidades ativas ao abrir
 * - Validação com react-hook-form + zod
 * - Criação e edição no mesmo componente
 * - Campos: nome, modalidade, capacidade, status, observações
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { classesService, ClassGroup, Modality } from '@/services/classes.service';
import { X, Loader2 } from 'lucide-react';

// Schema de validação do formulário de turma
const classGroupSchema = z.object({
  name:         z.string().min(2, 'Nome obrigatório'),
  modalityId:   z.string().uuid('Selecione uma modalidade'),
  maxCapacity:  z.string().optional(),
  isActive:     z.boolean().optional(),
  observations: z.string().optional(),
});

// Tipo inferido do schema
type ClassGroupForm = z.infer<typeof classGroupSchema>;

interface ClassGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  classGroup?: ClassGroup | null; // se informado, modo edição
}

export function ClassGroupModal({ isOpen, onClose, onSuccess, classGroup }: ClassGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Lista de modalidades carregada da API
  const [modalities, setModalities] = useState<Modality[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassGroupForm>({
    resolver: zodResolver(classGroupSchema),
    defaultValues: { isActive: true, maxCapacity: '0' },
  });

  /**
   * Carrega modalidades ativas ao abrir o modal.
   * Preenche o formulário em modo edição ou limpa em modo criação.
   */
  useEffect(() => {
    if (!isOpen) return;

    async function loadModalities() {
      setIsLoadingData(true);
      try {
        const data = await classesService.findAllModalities();
        setModalities(data);
      } catch (err) {
        console.error('Erro ao carregar modalidades:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadModalities();

    if (classGroup) {
      // Modo edição — preenche com dados da turma existente
      reset({
        name:         classGroup.name,
        modalityId:   classGroup.modalityId,
        maxCapacity:  String(classGroup.maxCapacity),
        isActive:     classGroup.isActive,
        observations: classGroup.observations ?? '',
      });
    } else {
      // Modo criação — limpa o formulário
      reset({ isActive: true, maxCapacity: '0' });
    }

    setError('');
  }, [isOpen, classGroup, reset]);

  /**
   * onSubmit
   * Converte maxCapacity de string para number
   * e cria ou atualiza a turma conforme o modo.
   */
  async function onSubmit(data: ClassGroupForm) {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...data,
        // Converte capacidade de string para number
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity) : 0,
      };

      if (classGroup) {
        await classesService.updateClassGroup(classGroup.id, payload);
      } else {
        await classesService.createClassGroup(payload);
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar turma');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {classGroup ? 'Editar Turma' : 'Nova Turma'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

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
              {/* Nome da turma */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nome da Turma <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('name')}
                  placeholder="Ex: Funcional Manhã, Spinning Avançado"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Modalidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Modalidade <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('modalityId')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione a modalidade...</option>
                  {modalities.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {errors.modalityId && <p className="text-red-400 text-xs mt-1">{errors.modalityId.message}</p>}
              </div>

              {/* Capacidade máxima e status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Capacidade Máxima <span className="text-gray-500 text-xs">(0 = ilimitado)</span>
                  </label>
                  <input
                    {...register('maxCapacity')}
                    type="number"
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-300">Turma ativa</span>
                  </label>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Observações</label>
                <textarea
                  {...register('observations')}
                  placeholder="Informações adicionais sobre a turma"
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
                />
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
              type="submit"
              disabled={isLoading || isLoadingData}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
              ) : (
                classGroup ? 'Salvar Alterações' : 'Criar Turma'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
