'use client';

/**
 * UserModal.tsx
 * Modal de criação e edição de usuário interno.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersService } from '@/services/users.service';
import { InternalUser } from '@/types';
import { X, Loader2 } from 'lucide-react';

const schema = z.object({
  name:               z.string().min(2, 'Nome obrigatório'),
  email:              z.string().email('Email inválido'),
  password:           z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role:               z.enum(['super_admin', 'admin', 'receptionist', 'financial', 'teacher']),
  isActive:           z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
});

type UserForm = z.infer<typeof schema>;

const roleLabels: Record<string, string> = {
  super_admin:  'Super Admin',
  admin:        'Administrador',
  receptionist: 'Recepção / Secretário',
  financial:    'Financeiro / Contador',
  teacher:      'Professor',
};

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  user?:     InternalUser | null;
}

export function UserModal({ isOpen, onClose, onSuccess, user }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        name:               user.name,
        email:              user.email,
        password:           '',
        role:               user.role,
        isActive:           user.isActive,
        mustChangePassword: user.mustChangePassword,
      });
    } else {
      reset({
        role:               'receptionist',
        isActive:           true,
        mustChangePassword: true,
      });
    }
  }, [user, reset, isOpen]);

  async function onSubmit(data: UserForm) {
    setIsLoading(true);
    setError('');
    try {
      if (user) {
        // Na edição, só envia a senha se foi preenchida
        const payload: any = {
          name:               data.name,
          email:              data.email,
          role:               data.role,
          isActive:           data.isActive,
          mustChangePassword: data.mustChangePassword,
        };
        if (data.password) payload.password = data.password;
        await usersService.update(user.id, payload);
      } else {
        await usersService.create({
          name:               data.name,
          email:              data.email,
          password:           data.password ?? '',
          role:               data.role as any,
          isActive:           data.isActive,
          mustChangePassword: data.mustChangePassword,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar usuário');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nome e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome <span className="text-red-400">*</span></label>
              <input {...register('name')} placeholder="Nome completo" className={inputClass} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email <span className="text-red-400">*</span></label>
              <input {...register('email')} type="email" placeholder="email@academia.com" className={inputClass} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className={labelClass}>
              Senha {user ? '(deixe vazio para não alterar)' : <span className="text-red-400">*</span>}
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder={user ? 'Nova senha (opcional)' : 'Mínimo 6 caracteres'}
              className={inputClass}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Perfil */}
          <div>
            <label className={labelClass}>Perfil <span className="text-red-400">*</span></label>
            <select {...register('role')} className={inputClass}>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
          </div>

          {/* Descrição do perfil selecionado */}
          <div className="bg-gray-800/50 rounded-lg px-4 py-3 text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300">Permissões do perfil:</p>
            <p><span className="text-purple-400">Super Admin</span> — acesso total ao sistema</p>
            <p><span className="text-blue-400">Administrador</span> — gerencia tudo exceto configurações globais</p>
            <p><span className="text-green-400">Recepção</span> — alunos, matrículas, check-in e baixa controlada</p>
            <p><span className="text-yellow-400">Financeiro</span> — acesso total ao módulo financeiro e relatórios</p>
            <p><span className="text-cyan-400">Professor</span> — gerencia fichas de treino e turmas sob seu escopo</p>
          </div>

          {/* Status e flags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                {...register('isActive', { setValueAs: v => v === 'true' || v === true })}
                className={inputClass}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Forçar troca de senha no login</label>
              <select
                {...register('mustChangePassword', { setValueAs: v => v === 'true' || v === true })}
                className={inputClass}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>

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
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
                : user ? 'Salvar Alterações' : 'Criar Usuário'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
