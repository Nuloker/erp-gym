'use client';

/**
 * assessments/page.tsx
 * Página de gerenciamento de avaliações físicas.
 *
 * Layout:
 * - Header com total de avaliações e botão nova avaliação
 * - Campo de busca por nome do aluno
 * - Tabela com avaliações — expandível para ver medidas completas
 * - Paginação client-side
 */
import React, { useEffect, useState, useCallback } from 'react';
import { assessmentsService } from '@/services/assessments.service';
import { PhysicalAssessment } from '@/types';
import { AssessmentModal } from '@/components/modals/assessmentsModal';
import { ConfirmModal } from '@/components/modals/confirmModal';
import { Pagination } from '@/components/pagination';
import { formatDate } from '@/lib/utils';
import {
  Plus, Loader2, Activity, Search,
  ChevronDown, ChevronUp, Pencil, Trash2,
} from 'lucide-react';

const DEFAULT_PER_PAGE = 10;

function val(v?: number, suffix = ''): string {
  if (v == null) return '—';
  return v + suffix;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments]           = useState<PhysicalAssessment[]>([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [search, setSearch]                     = useState('');
  const [currentPage, setCurrentPage]           = useState(1);
  const [itemsPerPage, setItemsPerPage]         = useState(DEFAULT_PER_PAGE);
  const [expandedId, setExpandedId]             = useState<string | null>(null);
  const [modalOpen, setModalOpen]               = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<PhysicalAssessment | null>(null);
  const [confirmOpen, setConfirmOpen]           = useState(false);
  const [toDelete, setToDelete]                 = useState<PhysicalAssessment | null>(null);

  const loadAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await assessmentsService.findAll();
      setAssessments(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAssessments(); }, [loadAssessments]);

  const filtered = assessments.filter(a =>
    (a.student?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleNew() {
    setSelectedAssessment(null);
    setModalOpen(true);
  }

  function handleEdit(assessment: PhysicalAssessment, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedAssessment(assessment);
    setModalOpen(true);
  }

  function handleDeleteClick(assessment: PhysicalAssessment, e: React.MouseEvent) {
    e.stopPropagation();
    setToDelete(assessment);
    setConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!toDelete) return;
    await assessmentsService.remove(toDelete.id);
    await loadAssessments();
    setConfirmOpen(false);
    setToDelete(null);
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
          <h1 className="text-white text-2xl font-bold">Avaliações Físicas</h1>
          <p className="text-gray-400 text-sm mt-1">
            {assessments.length} {assessments.length === 1 ? 'avaliação cadastrada' : 'avaliações cadastradas'}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Avaliação
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome do aluno..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Estado vazio */}
      {assessments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Activity className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma avaliação cadastrada</p>
          <p className="text-gray-600 text-sm mt-1">Crie a primeira avaliação clicando em &quot;Nova Avaliação&quot;</p>
        </div>
      )}

      {/* Tabela */}
      {assessments.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ALUNO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">DATA</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">PESO</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">ALTURA</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">IMC</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">% GORDURA</th>
                <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-12">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhuma avaliação encontrada
                  </td>
                </tr>
              ) : (
                paginated.map((assessment) => {
                  const isExpanded = expandedId === assessment.id;
                  return (
                    <React.Fragment key={assessment.id}>

                      {/* Linha principal */}
                      <tr
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(assessment.student?.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {assessment.student?.name ?? '—'}
                              </p>
                              {assessment.evaluator && (
                                <p className="text-gray-500 text-xs">
                                  {'Avaliador: ' + assessment.evaluator.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(assessment.assessmentDate)}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {val(assessment.weight, ' kg')}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {val(assessment.height, ' cm')}
                        </td>
                        <td className="px-6 py-4">
                          {assessment.bmi ? (
                            <span className={
                              'px-2 py-0.5 rounded-full text-xs font-medium ' + (
                                assessment.bmi < 18.5 ? 'bg-blue-500/10 text-blue-400'     :
                                assessment.bmi < 25   ? 'bg-green-500/10 text-green-400'   :
                                assessment.bmi < 30   ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                              )
                            }>
                              {Number(assessment.bmi).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {val(assessment.bodyFatPercentage, '%')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleEdit(assessment, e)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(assessment, e)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded
                              ? <ChevronUp   className="w-4 h-4 text-gray-500" />
                              : <ChevronDown className="w-4 h-4 text-gray-500" />
                            }
                          </div>
                        </td>
                      </tr>

                      {/* Linha expandida */}
                      {isExpanded && (
                        <tr className="border-b border-gray-800/50 bg-gray-800/20">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6">

                              {/* Composição corporal */}
                              <div>
                                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                                  Composição Corporal
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { label: 'Massa Magra',  value: val(assessment.leanMass,    ' kg') },
                                    { label: 'Massa Gorda',  value: val(assessment.fatMass,     ' kg') },
                                    { label: 'Meta de Peso', value: val(assessment.weightGoal,  ' kg') },
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
                                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">
                                  Circunferências (cm)
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { label: 'Pescoço',   value: val(assessment.neckCircumference)       },
                                    { label: 'Tórax',     value: val(assessment.chestCircumference)      },
                                    { label: 'Cintura',   value: val(assessment.waistCircumference)      },
                                    { label: 'Quadril',   value: val(assessment.hipCircumference)        },
                                    { label: 'Braço D',   value: val(assessment.rightArmCircumference)   },
                                    { label: 'Braço E',   value: val(assessment.leftArmCircumference)    },
                                    { label: 'Coxa D',    value: val(assessment.rightThighCircumference) },
                                    { label: 'Coxa E',    value: val(assessment.leftThighCircumference)  },
                                    { label: 'Pantur. D', value: val(assessment.rightCalfCircumference)  },
                                    { label: 'Pantur. E', value: val(assessment.leftCalfCircumference)   },
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
                                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                                    Observações
                                  </p>
                                  <p className="text-gray-300 text-sm bg-gray-800 rounded-lg px-3 py-2">
                                    {assessment.observations}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>

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
      )}

      {/* Modais */}
      <AssessmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadAssessments}
        assessment={selectedAssessment}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        message={'Remover a avaliação de "' + (toDelete?.student?.name ?? '') + '"? Esta ação não pode ser desfeita.'}
        title=""
      />
    </div>
  );
}
