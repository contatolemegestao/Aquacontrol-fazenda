import React, { useState } from 'react';
import { Plus, Layers, Trash2, Edit2, CheckCircle2, AlertCircle, Maximize2, Check } from 'lucide-react';
import { formatThousands, parseThousands, formatDensidade } from '../utils/formatters';

export default function ViveirosModule({ viveiros, setViveiros, povoamentos }) {
  const [name, setName] = useState('');
  const [areaFormatted, setAreaFormatted] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleAreaChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatThousands(rawVal);
    setAreaFormatted(formatted);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor, informe o nome do viveiro.');
      return;
    }
    const numArea = parseThousands(areaFormatted);
    if (numArea <= 0) {
      setErrorMsg('Por favor, informe uma área válida maior que zero.');
      return;
    }

    if (editingId) {
      setViveiros(
        viveiros.map((v) =>
          v.id === editingId ? { ...v, name: name.trim(), area: numArea } : v
        )
      );
      setEditingId(null);
      triggerToast('Viveiro alterado com sucesso!');
    } else {
      const newViveiro = {
        id: `viv-${Date.now()}`,
        name: name.trim(),
        area: numArea,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setViveiros([...viveiros, newViveiro]);
      triggerToast('Viveiro cadastrado com sucesso!');
    }

    setName('');
    setAreaFormatted('');
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setName(v.name);
    setAreaFormatted(formatThousands(v.area.toString()));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setAreaFormatted('');
    setErrorMsg('');
  };

  const handleDelete = (id) => {
    const hasActivePovoamento = povoamentos.some(
      (p) => p.viveiroId === id && p.status === 'ativo'
    );
    if (hasActivePovoamento) {
      alert('Este viveiro possui um povoamento ativo no momento. Finalize o ciclo antes de excluí-lo.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este viveiro?')) {
      setViveiros(viveiros.filter((v) => v.id !== id));
      triggerToast('Viveiro excluído com sucesso.');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification no Canto Superior Direito */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-brand-500" />
            Cadastro de Viveiros
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre os viveiros da fazenda informando o nome e a área útil total em m².
          </p>
        </div>
        <div className="bg-brand-50 px-4 py-2 rounded-xl text-brand-700 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <span>Total de Viveiros:</span>
          <span className="bg-brand-500 text-white text-xs px-2.5 py-0.5 rounded-full">
            {viveiros.length}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          {editingId ? 'Editar Viveiro' : 'Adicionar Novo Viveiro'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Nome do Viveiro
            </label>
            <input
              type="text"
              placeholder="Ex: Viveiro 01 - Berçário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Área em m²
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: 10.000"
                value={areaFormatted}
                onChange={handleAreaChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-mono font-medium outline-none transition"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-medium">m²</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Salvar Alteração' : 'Adicionar Viveiro'}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Viveiros List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Viveiros Cadastrados</h2>
        </div>

        {viveiros.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Nenhum viveiro cadastrado ainda.</p>
            <p className="text-sm mt-1">Preencha os campos acima para adicionar o primeiro viveiro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3.5">Nome do Viveiro</th>
                  <th className="px-6 py-3.5">Área (m²)</th>
                  <th className="px-6 py-3.5">Status Atual</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {viveiros.map((v) => {
                  const activePovoamento = povoamentos.find(
                    (p) => p.viveiroId === v.id && p.status === 'ativo'
                  );
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                          {v.name.substring(0, 2).toUpperCase()}
                        </div>
                        {v.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <span className="inline-flex items-center gap-1 font-mono font-medium">
                          <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                          {v.area.toLocaleString('pt-BR')} m²
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activePovoamento ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Povoado ({formatDensidade(activePovoamento.densidade)} cam/m²)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            Sem Povoamento Ativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(v)}
                          title="Editar Viveiro"
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          title="Excluir Viveiro"
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
        )}
      </div>
    </div>
  );
}
