import React, { useState } from 'react';
import { SlidersHorizontal, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ParametrosModule({ parametros, setParametros }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [hasMin, setHasMin] = useState(true);
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openNewModal = () => {
    setEditingParam(null);
    setName('');
    setUnit('mg/L');
    setHasMin(true);
    setMinVal('');
    setMaxVal('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingParam(p);
    setName(p.name);
    setUnit(p.unit);
    setHasMin(p.hasMin ?? (p.min !== null && p.min !== undefined));
    setMinVal(p.min !== null && p.min !== undefined ? p.min.toString() : '');
    setMaxVal(p.max !== null && p.max !== undefined ? p.max.toString() : '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Informe o nome do parâmetro.');
      return;
    }
    if (!unit.trim()) {
      setErrorMsg('Informe a unidade de medida.');
      return;
    }

    const numMax = parseFloat(maxVal);
    if (isNaN(numMax)) {
      setErrorMsg('Informe um valor máximo aceitável válido.');
      return;
    }

    let numMin = null;
    if (hasMin) {
      numMin = parseFloat(minVal);
      if (isNaN(numMin)) {
        setErrorMsg('Informe um valor mínimo aceitável válido.');
        return;
      }
      if (numMin > numMax) {
        setErrorMsg('O valor mínimo não pode ser maior que o máximo.');
        return;
      }
    }

    if (editingParam) {
      setParametros(
        parametros.map((p) =>
          p.id === editingParam.id
            ? {
                ...p,
                name: name.trim(),
                unit: unit.trim(),
                hasMin,
                min: hasMin ? numMin : null,
                max: numMax
              }
            : p
        )
      );
    } else {
      const newParam = {
        id: `param-${Date.now()}`,
        name: name.trim(),
        unit: unit.trim(),
        hasMin,
        min: hasMin ? numMin : null,
        max: numMax,
        isCustom: true
      };
      setParametros([...parametros, newParam]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este parâmetro?')) {
      setParametros(parametros.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-7 h-7 text-brand-500" />
            Configuração de Parâmetros
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Parâmetros de qualidade de água pré-preenchidos conforme sua planilha com limites de alerta ajustáveis.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shadow-md shadow-brand-500/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Incluir Parâmetro Manualmente</span>
        </button>
      </div>

      {/* Tabela de Parâmetros */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Parâmetros Cadastrados</h2>
          <span className="text-xs text-gray-500 font-medium">Total: {parametros.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3.5">Parâmetro</th>
                <th className="px-6 py-3.5">Unidade</th>
                <th className="px-6 py-3.5">Mínimo Aceitável</th>
                <th className="px-6 py-3.5">Máximo Aceitável</th>
                <th className="px-6 py-3.5">Alerta de Nível Aceitável</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {parametros.map((p) => {
                const hasMinimumDefined = p.hasMin && p.min !== null && p.min !== undefined;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                      {p.name}
                      {p.isCustom && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Customizado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 font-medium">
                      {p.unit}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {hasMinimumDefined ? (
                        <span className="text-emerald-700">{p.min} {p.unit}</span>
                      ) : (
                        <span className="text-gray-400 italic text-xs font-sans">
                          N/A (sem mínimo)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-emerald-700">
                      {p.max} {p.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {hasMinimumDefined ? `${p.min} a ${p.max} ${p.unit}` : `0 a ${p.max} ${p.unit}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        title="Editar Parâmetro"
                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Excluir Parâmetro"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Form para Adicionar ou Editar Parâmetro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingParam ? 'Editar Parâmetro' : 'Incluir Novo Parâmetro'}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Nome do Parâmetro
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alcalinidade Total"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Unidade de Medida
                </label>
                <input
                  type="text"
                  placeholder="Ex: mg/L, °C, ppt"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
                />
              </div>

              {/* Opção para Parâmetro com ou sem mínimo */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasMinCheck"
                  checked={hasMin}
                  onChange={(e) => setHasMin(e.target.checked)}
                  className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                />
                <label htmlFor="hasMinCheck" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Este parâmetro possui limite mínimo recomendado?
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Exibe o campo de valor mínimo SOMENTE se tem mínimo! */}
                {hasMin ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                      Mínimo Aceitável
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ex: 4"
                      value={minVal}
                      onChange={(e) => setMinVal(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-2.5 flex items-center justify-center text-xs text-gray-400 italic">
                    Sem mínimo (N/A)
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Máximo Aceitável
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ex: 20"
                    value={maxVal}
                    onChange={(e) => setMaxVal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition shadow-md shadow-brand-500/20"
                >
                  Salvar Parâmetro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
