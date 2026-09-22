'use client';

/**
 * Pagination.tsx
 * Componente reutilizável de paginação.
 *
 * Props:
 * - currentPage: página atual (1-indexed)
 * - totalItems: total de itens na lista
 * - itemsPerPage: itens por página
 * - onPageChange: callback chamado ao trocar de página
 * - onItemsPerPageChange: callback ao alterar itens por página (opcional)
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage:          number;
  totalItems:           number;
  itemsPerPage:         number;
  onPageChange:         (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Não exibe se só há uma página
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  // Calcula range de itens exibidos
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to   = Math.min(currentPage * itemsPerPage, totalItems);

  // Gera array de páginas visíveis com ellipsis
  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  const pages = getPages();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">

      {/* Info: exibindo X–Y de Z */}
      <div className="flex items-center gap-4">
        <p className="text-gray-500 text-sm">
          {totalItems === 0
            ? 'Nenhum resultado'
            : `Exibindo ${from}–${to} de ${totalItems}`
          }
        </p>

        {/* Seletor de itens por página */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // volta para a primeira página
              }}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PER_PAGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">

          {/* Botão anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Páginas numeradas */}
          {pages.map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            )
          )}

          {/* Botão próximo */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
