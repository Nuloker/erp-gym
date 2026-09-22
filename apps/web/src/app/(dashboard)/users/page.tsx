'use client';

/**
 * users/page.tsx
 * Página de gestão de usuários internos do sistema.
 *
 * Permite criar e gerenciar:
 * - Administradores
 * - Professores
 * - Recepcionistas / Secretários
 * - Financeiro / Contadores
 */
import { useEffect, useState, useCallback } from 'react';
import { usersService } from '@/services/users.service';
import { InternalUser } from '@/types';
import { UserModal } from '@/components/modals/userModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { Pagination } from '@/components/pagination';
import { formatDate } from '@/lib/utils';
import {
  UserCog, Plus, Loader2, Pencil,
  Trash2, CheckCircle, XCircle, KeyRound,
} from 'lucide-react';

const DEFAULT_PER_PAGE = 10;

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin:  { label: 'Super Admin',  color: 'bg-purple-500/10 text-purple-400' },
  admin:        { label: 'Admin',        color: 'bg-blue-500/10 text-blue-400'     },
  receptionist: { label: 'Recepção',     color: 'bg-green-500/10 text-green-400'   },
  financial:    { label: 'Financeiro',   color: 'bg-yellow-500/10 text-yellow-400' },
  teacher:      { label: 'Professor',    color: 'bg-cyan-500/10 text-cyan-400'     },
};

export default function UsersPage() {
  const [users, setUsers]           = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PER_PAGE);

  // Modal de criação/edição
  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  // Modal de confirmação de remoção
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<InternalUser | null>(null);

  // Modal de reset de senha
  const [resetOpen, setResetOpen]   = useState(false);
  const [userToReset, setUserToReset] = useState<InternalUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError]   = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersService.findAll();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Paginação
  const paginated = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleNew() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function handleEdit(user: InternalUser) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleDeleteClick(user: InternalUser) {
    setUserToDelete(user);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return;
    await usersService.remove(userToDelete.id);
    await loadUsers();
    setConfirmOpen(false);
    setUserToDelete(null);
  }

  function handleResetClick(user: InternalUser) {
    setUserToReset(user);
    setNewPassword('');
    setResetError('');
    setResetOpen(true);
  }

  async function handleResetConfirm() {
    if (!userToReset || newPassword.length < 6) {
      setResetError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setIsResetting(true);
    try {
      await usersService.resetPassword(userToReset.id, newPassword);
      setResetOpen(false);
      setUserToReset(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err?.response?.data?.message ?? 'Erro ao resetar senha');
    } finally {
      setIsResetting(false);
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
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Usuários do Sistema</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Estado vazio */}
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-900 border border-gray-800 rounded-2xl">
          <UserCog className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Nenhum usuário cadastrado</p>
          <p className="text-gray-600 text-sm mt-1">Crie o primeiro usuário clicando em &quot;Novo Usuário&quot;</p>
        </div>
      )}

      {/* Tabela */}
      {users.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">NOME</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">EMAIL</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">PERFIL</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">CADASTRO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => {
                const role = roleConfig[user.role] ?? { label: user.role, color: 'bg-gray-800 text-gray-400' };
                return (
                  <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">

                    {/* Nome */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.name}</p>
                          {user.mustChangePassword && (
                            <p className="text-yellow-400 text-xs">Troca de senha pendente</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>

                    {/* Perfil */}
                    <td className="px-6 py-4">
                      <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + role.color}>
                        {role.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Inativo
                        </span>
                      )}
                    </td>

                    {/* Cadastro */}
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.createdAt)}</td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Editar usuário"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetClick(user)}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Resetar senha"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* ── Modal reset de senha ──────────────────────────── */}
      {resetOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Resetar Senha</h2>
            <p className="text-gray-400 text-sm mb-4">
              {'Definir nova senha para ' + userToReset?.name}
            </p>

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                {resetError}
              </div>
            )}

            <input
              type="password"
              placeholder="Nova senha (mínimo 6 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 mb-4"
            />

            <p className="text-yellow-400 text-xs mb-4">
              O usuário será obrigado a trocar a senha no próximo login.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setResetOpen(false); setUserToReset(null); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isResetting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
                  : <><KeyRound className="w-4 h-4" />Resetar Senha</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadUsers}
        user={selectedUser}
      />

      <ConfirmModal
              isOpen={confirmOpen}
              onClose={() => { setConfirmOpen(false); setUserToDelete(null); } }
              onConfirm={handleDeleteConfirm}
              message={'Remover o usuário "' + userToDelete?.name + '"? Esta ação não pode ser desfeita.'} title={''}      />
    </div>
  );
}
