import React, { useState } from 'react';
import { FilePlus2, CheckCircle2, AlertCircle, Plus, ArrowDownCircle, ArrowUpCircle, Trash2, Tag } from 'lucide-react';

export default function LancamentoModule({
  viveiros,
  povoamentos,
  parametros,
  lancamentos,
  setLancamentos
}) {
  // Estado do viveiro selecionado
  const [selectedViveiroId, setSelectedViveiroId] = useState(
    viveiros.length > 0 ? viveiros[0].id : ''
  );

  // Lotes pertencentes ao viveiro selecionado (APENAS CULTIVOS ATIVOS)
  const lotesDoViveiroAtivos = povoamentos.filter(
    (p) => p.viveiroId === selectedViveiroId && p.status === 'ativo'
  );

  // Estado do lote selecionado (povoamentoId)
  const [selectedPovoamentoId, setSelectedPovoamentoId] = useState(() => {
    return lotesDoViveiroAtivos.length > 0 ? lotesDoViveiroAtivos[0].id : '';
  });

  const [selectedParamId, setSelectedParamId] = useState(
    parametros.length > 0 ? parametros[0].id : ''
  );
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [valueStr, setValueStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  // Quando o viveiro muda, atualiza o lote selecionado para o primeiro lote ATIVO daquele viveiro
  const handleViveiroChange = (vivId) => {
    setSelectedViveiroId(vivId);
    const lotesAtivos = povoamentos.filter((p) => p.viveiroId === vivId && p.status === 'ativo');
    if (lotesAtivos.length > 0) {
      setSelectedPovoamentoId(lotesAtivos[0].id);
    } else {
      setSelectedPovoamentoId('');
    }
  };

  // Parâmetro Selecionado
  const selectedParam = parametros.find((p) => p.id === selectedParamId);

  // Valor numérico digitado
  const numValue = parseFloat(valueStr);

  // Status de Avaliação do Valor lançado
  const getStatusAlert = (param, val) => {
    if (!param || isNaN(val)) return null;
    const hasMin = param.hasMin && param.min !== null && param.min !== undefined;

    if (hasMin && val < param.min) {
      return {
        type: 'below',
        label: `Abaixo do Recomendado (< ${param.min} ${param.unit})`,
        colorClass: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    if (param.max !== null && param.max !== undefined && val > param.max) {
      return {
        type: 'above',
        label: `Acima do Recomendado (> ${param.max} ${param.unit})`,
        colorClass: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    }
    return {
      type: 'ok',
      label: `Nível Aceitável (${hasMin ? `${param.min} a ` : '0 a '}${param.max} ${param.unit})`,
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  };

  const currentAlert = getStatusAlert(selectedParam, numValue);

  const handleSaveLancamento = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedViveiroId) {
      setErrorMsg('Selecione um viveiro para registrar o lançamento.');
      return;
    }
    if (!selectedPovoamentoId) {
      setErrorMsg('Selecione um lote ativo para registrar o lançamento.');
      return;
    }
    if (!selectedParamId) {
      setErrorMsg('Selecione um parâmetro para registrar o lançamento.');
      return;
    }
    if (!date) {
      setErrorMsg('Selecione a data do lançamento.');
      return;
    }
    if (valueStr.trim() === '' || isNaN(numValue)) {
      setErrorMsg('Informe um valor numérico válido.');
      return;
    }

    const newLancamento = {
      id: `l-${Date.now()}`,
      viveiroId: selectedViveiroId,
      povoamentoId: selectedPovoamentoId,
      parameterId: selectedParamId,
      date,
      value: numValue,
      createdAt: new Date().toISOString()
    };

    setLancamentos([newLancamento, ...lancamentos]);
    setValueStr('');
    triggerToast('Medição registrada com sucesso!');
  };

  const handleDeleteLancamento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta medição?')) {
      setLancamentos(lancamentos.filter((l) => l.id !== id));
      triggerToast('Medição excluída com sucesso.');
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
            <FilePlus2 className="w-7 h-7 text-brand-500" />
            Lançamento Diário por Lote
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registre medições selecionando o viveiro, o lote de cultivo ativo e o valor do parâmetro.
          </p>
        </div>
        <div className="bg-brand-50 px-4 py-2 rounded-xl text-brand-700 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <span>Total de Lançamentos:</span>
          <span className="bg-brand-500 text-white text-xs px-2.5 py-0.5 rounded-full">
            {lancamentos.length}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Registrar Medição</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveLancamento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Seletor 1: Viveiro */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Viveiro
              </label>
              <select
                value={selectedViveiroId}
                onChange={(e) => handleViveiroChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-white transition"
              >
                {viveiros.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor 2: Lote do Viveiro (APENAS CULTIVOS ATIVOS) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Lote de Cultivo (Ativo)
              </label>
              <select
                value={selectedPovoamentoId}
                onChange={(e) => setSelectedPovoamentoId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-white font-medium transition"
              >
                {lotesDoViveiroAtivos.length === 0 ? (
                  <option value="">-- Nenhum Lote Ativo neste Viveiro --</option>
                ) : (
                  lotesDoViveiroAtivos.map((p) => (
                    <option key={p.id} value={p.id}>
                      🟢 {p.numeroLote || 'Lote'} (Ativo)
                    </option>
                  ))
                )}
              </select>
              {lotesDoViveiroAtivos.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Não há ciclo ativo neste viveiro.
                </p>
              )}
            </div>

            {/* Seletor de Parâmetro Cadastrado */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Parâmetro
              </label>
              <select
                value={selectedParamId}
                onChange={(e) => setSelectedParamId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-white transition"
              >
                {parametros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Data */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
              />
            </div>

            {/* Campo Unidade (Readonly) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Unidade
              </label>
              <input
                type="text"
                readOnly
                value={selectedParam ? selectedParam.unit : ''}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 font-mono text-sm font-semibold outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Campo Valor Medido (Somente Números) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Valor Medido (Apenas números)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="Ex: 5.8"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none font-mono text-base font-semibold"
                />
                {selectedParam && (
                  <span className="absolute right-4 top-2.5 text-xs text-gray-500 font-medium font-mono">
                    {selectedParam.unit}
                  </span>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={lotesDoViveiroAtivos.length === 0}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Medição</span>
              </button>
            </div>
          </div>

          {/* Indicador de Status Alerta em Tempo Real */}
          {currentAlert && (
            <div className={`mt-3 p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium ${currentAlert.colorClass}`}>
              {currentAlert.type === 'below' && <ArrowDownCircle className="w-5 h-5 shrink-0" />}
              {currentAlert.type === 'above' && <ArrowUpCircle className="w-5 h-5 shrink-0" />}
              {currentAlert.type === 'ok' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{currentAlert.label}</span>
            </div>
          )}
        </form>
      </div>

      {/* Tabela de Lançamentos Recentes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Histórico de Lançamentos</h2>
        </div>

        {lancamentos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FilePlus2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Nenhum lançamento registrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3.5">Data</th>
                  <th className="px-6 py-3.5">Viveiro</th>
                  <th className="px-6 py-3.5">Lote</th>
                  <th className="px-6 py-3.5">Parâmetro</th>
                  <th className="px-6 py-3.5">Valor Medido</th>
                  <th className="px-6 py-3.5">Avaliação</th>
                  <th className="px-6 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {lancamentos.map((l) => {
                  const viv = viveiros.find((v) => v.id === l.viveiroId);
                  const pov = povoamentos.find((p) => p.id === l.povoamentoId);
                  const par = parametros.find((p) => p.id === l.parameterId);
                  const alert = getStatusAlert(par, l.value);
                  const isAtivo = pov ? pov.status === 'ativo' : false;

                  return (
                    <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {new Date(l.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {viv ? viv.name : 'Viveiro Indefinido'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-brand-700">
                        {pov ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 border border-gray-200">
                            {isAtivo ? '🟢' : '⚪'} {pov.numeroLote || 'Lote'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {par ? par.name : 'Parâmetro Indefinido'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        {l.value} <span className="text-xs font-normal text-gray-500">{par?.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        {alert && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${alert.colorClass}`}>
                            {alert.type === 'ok' && 'Nível Aceitável'}
                            {alert.type === 'below' && 'Abaixo Recomendado'}
                            {alert.type === 'above' && 'Acima Recomendado'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteLancamento(l.id)}
                          title="Excluir Lançamento"
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
