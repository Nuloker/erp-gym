'use client';

/**
 * audit/page.tsx
 * Página de visualização dos logs de auditoria.
 *
 * Exibe todas as ações críticas (POST, PATCH, DELETE)
 * executadas no sistema com detalhes de quem, quando e o quê.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { auditService, AuditLog } from '@/services/audit.service';
import { Pagination } from '@/components/pagination';
import { formatDate } from '@/lib/utils';
import { Shield, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const DEFAULT_PER_PAGE = 25;

const methodConfig: Record<string, { color: string; bg: string }> = {
  POST:   { color: 'text-green-400',  bg: 'bg-green-500/10'  },
  PATCH:  { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  PUT:    { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  DELETE: { color: 'text-red-400',    bg: 'bg-red-500/10'    },
};

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-400';
  if (code >= 400 && code < 500) return 'text-yellow-400';
  return 'text-red-400';
}

export default function AuditPage() {
  const [logs, setLogs]               = useState<AuditLog[]>([]);
  const [total, setTotal]             = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage]                = useState(DEFAULT_PER_PAGE);
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const result = await auditService.findAll(itemsPerPage, offset);
      setLogs(result.logs);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

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
      <div>
        <h1 className="text-white text-2xl font-bold">Auditoria</h1>
        <p className="text-gray-400 text-sm mt-1">
          Registro de todas as ações críticas executadas no sistema
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Total de Registros</p>
          <p className="text-white text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Ações com Erro</p>
          <p className="text-red-400 text-2xl font-bold">
            {logs.filter(l => l.statusCode >= 400).length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Ações com Sucesso</p>
          <p className="text-green-400 text-2xl font-bold">
            {logs.filter(l => l.statusCode < 400).length}
          </p>
        </div>
      </div>

      {/* Estado vazio */}
      {logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-900 border border-gray-800 rounded-2xl">
          <Shield className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Nenhum log registrado ainda</p>
          <p className="text-gray-600 text-sm mt-1">
            Os logs aparecerão aqui conforme ações forem executadas no sistema
          </p>
        </div>
      )}

      {/* Tabela de logs */}
      {logs.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÃO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">MÉTODO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ROTA</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">USUÁRIO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">STATUS</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DURAÇÃO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DATA</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const method     = methodConfig[log.method] ?? { color: 'text-gray-400', bg: 'bg-gray-800' };
                const isSuccess  = log.statusCode < 400;

                return (
                  <React.Fragment key={log.id}>
                    {/* Linha principal */}
                    <tr
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {isSuccess
                            ? <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            : <XCircle    className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          }
                          <span className="text-white text-xs font-medium font-mono">
                            {log.action ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={'text-xs font-bold px-2 py-0.5 rounded ' + method.bg + ' ' + method.color}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-gray-400 text-xs font-mono truncate max-w-50 block">
                          {log.route}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {log.userEmail ?? '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={'text-sm font-medium ' + statusColor(log.statusCode)}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.duration}ms
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>

                    {/* Linha expandida */}
                    {isExpanded && (
                      <tr className="border-b border-gray-800/50 bg-gray-800/20">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                                Detalhes
                              </p>
                              <div className="space-y-1.5">
                                {[
                                  { label: 'ID do Log',  value: log.id               },
                                  { label: 'IP',         value: log.ipAddress ?? '—' },
                                  { label: 'Usuário ID', value: log.userId    ?? '—' },
                                ].map(item => (
                                  <div key={item.label} className="flex gap-3">
                                    <span className="text-gray-500 text-xs w-24 shrink-0">{item.label}</span>
                                    <span className="text-gray-300 text-xs font-mono">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              {log.errorMessage && (
                                <>
                                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">
                                    Erro
                                  </p>
                                  <p className="text-red-300 text-xs font-mono bg-red-500/5 rounded px-3 py-2">
                                    {log.errorMessage}
                                  </p>
                                </>
                              )}
                              {log.payload && !log.errorMessage && (
                                <>
                                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                                    Payload
                                  </p>
                                  <pre className="text-gray-300 text-xs font-mono bg-gray-800 rounded px-3 py-2 overflow-auto max-h-32">
                                    {JSON.stringify(JSON.parse(log.payload), null, 2)}
                                  </pre>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
