import React, { useState } from 'react';
import { FilePlus2, CheckCircle2, AlertCircle, Plus, ArrowDownCircle, ArrowUpCircle, Trash2, Clock, CheckCheck } from 'lucide-react';

export default function LancamentoModule({
  viveiros,
  povoamentos,
  parametros,
  lancamentos,
  setLancamentos
}) {
  // Função auxiliar para pegar a hora atual no formato HH:MM
  const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

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

  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  // Horário do registro: automático com hora atual do dispositivo, mas editável
  const [time, setTime] = useState(getCurrentTimeStr);

  // Estado de valores digitados para a lista de parâmetros: { [paramId]: "valor" }
  const [paramValues, setParamValues] = useState({});

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

  // Atualizar o valor de um parâmetro específico no formulário em lote
  const handleParamValueChange = (paramId, val) => {
    setParamValues((prev) => ({
      ...prev,
      [paramId]: val
    }));
  };

  // Status de Avaliação do Valor lançado
  const getStatusAlert = (param, val) => {
    if (!param || isNaN(val)) return null;
    const hasMin = param.hasMin && param.min !== null && param.min !== undefined;

    if (hasMin && val < param.min) {
      return {
        type: 'below',
        label: `Abaixo (< ${param.min} ${param.unit})`,
        colorClass: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    if (param.max !== null && param.max !== undefined && val > param.max) {
      return {
        type: 'above',
        label: `Acima (> ${param.max} ${param.unit})`,
        colorClass: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    }
    return {
      type: 'ok',
      label: `Ideal (${hasMin ? `${param.min} - ` : '0 - '}${param.max} ${param.unit})`,
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  };

  // Salvar em Lote todas as medições preenchidas
  const handleSaveBatchLancamentos = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedViveiroId) {
      setErrorMsg('Selecione um viveiro para registrar os lançamentos.');
      return;
    }
    if (!selectedPovoamentoId) {
      setErrorMsg('Selecione um lote ativo para registrar os lançamentos.');
      return;
    }
    if (!date) {
      setErrorMsg('Selecione a data do registro.');
      return;
    }
    if (!time) {
      setErrorMsg('Informe o horário do registro.');
      return;
    }

    // Filtrar apenas parâmetros que tiveram algum valor digitado válido
    const newBatch = [];
    let hasInvalid = false;

    Object.keys(paramValues).forEach((paramId) => {
      const valStr = paramValues[paramId];
      if (valStr !== undefined && valStr !== null && valStr.trim() !== '') {
        const numVal = parseFloat(valStr);
        if (isNaN(numVal)) {
          hasInvalid = true;
        } else {
          newBatch.push({
            id: `l-${Date.now()}-${paramId}`,
            viveiroId: selectedViveiroId,
            povoamentoId: selectedPovoamentoId,
            parameterId: paramId,
            date,
            time,
            value: numVal,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    if (hasInvalid) {
      setErrorMsg('Um ou mais valores digitados são inválidos. Verifique os números informados.');
      return;
    }

    if (newBatch.length === 0) {
      setErrorMsg('Preencha pelo menos um parâmetro para realizar o lançamento.');
      return;
    }

    setLancamentos([...newBatch, ...lancamentos]);
    setParamValues({});
    setTime(getCurrentTimeStr());
    triggerToast(`${newBatch.length} medição(ões) lançada(s) com sucesso!`);
  };

  const handleDeleteLancamento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta medição?')) {
      setLancamentos(lancamentos.filter((l) => l.id !== id));
      triggerToast('Medição excluída com sucesso.');
    }
  };

  return (
    <div className="space-y-6 relative font-['Inter',sans-serif]">
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
            Lançamento Diário de Parâmetros
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecione o viveiro, a data e a hora. Preencha apenas os parâmetros que deseja registrar e clique em <b>Lançar Medições</b>.
          </p>
        </div>
        <div className="bg-brand-50 px-4 py-2 rounded-xl text-brand-700 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <span>Total de Lançamentos:</span>
          <span className="bg-brand-500 text-white text-xs px-2.5 py-0.5 rounded-full">
            {lancamentos.length}
          </span>
        </div>
      </div>

      {/* FORMULÁRIO EM LOTE */}
      <form onSubmit={handleSaveBatchLancamentos} className="space-y-6">
        {/* Card 1: Configuração do Lançamento (Viveiro, Lote, Data e Hora) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            1. Dados da Coleta
          </h2>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Seletor 1: Viveiro */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Viveiro
              </label>
              <select
                value={selectedViveiroId}
                onChange={(e) => handleViveiroChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-white font-medium transition"
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
                Cultivo / Lote (Ativo)
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

            {/* Campo Data */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Data da Coleta
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
              />
            </div>

            {/* HORÁRIO DO REGISTRO */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center justify-between">
                <span>Horário da Coleta</span>
                <span className="text-[10px] text-brand-600 font-normal lowercase">(automático)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-mono outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Lista de Todos os Parâmetros para Preenchimento */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                2. Medições dos Parâmetros
              </h2>
              <p className="text-xs text-gray-500">
                Preencha apenas os valores medidos nesta coleta. Deixe em branco os que não foram aferidos.
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full self-start sm:self-auto">
              {parametros.length} Parâmetros Disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {parametros.map((param) => {
              const currentValStr = paramValues[param.id] || '';
              const numVal = parseFloat(currentValStr);
              const alert = getStatusAlert(param, numVal);

              return (
                <div
                  key={param.id}
                  className={`p-4 rounded-xl border transition-all ${
                    currentValStr.trim() !== ''
                      ? 'border-brand-300 bg-brand-50/20 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-900">
                      {param.name}
                    </label>
                    <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {param.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="any"
                        placeholder={`Digite em ${param.unit}`}
                        value={currentValStr}
                        onChange={(e) => handleParamValueChange(param.id, e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-mono font-semibold outline-none bg-white"
                      />
                    </div>

                    {/* Indicador de Status Alerta */}
                    {alert && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shrink-0 ${alert.colorClass}`}>
                        {alert.type === 'ok' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {alert.type === 'below' && <ArrowDownCircle className="w-3.5 h-3.5" />}
                        {alert.type === 'above' && <ArrowUpCircle className="w-3.5 h-3.5" />}
                        <span>{alert.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Faixa ideal de referência */}
                  <p className="text-[11px] text-gray-600 mt-1.5 font-medium">
                    Faixa Recomendada:{' '}
                    <span className="font-semibold">
                      {param.hasMin && param.min !== null ? `${param.min} a ` : 'até '}
                      {param.max} {param.unit}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* BOTÃO DE LANÇAR MEDIÇÕES NO RODAPÉ */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={lotesDoViveiroAtivos.length === 0}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2.5 shadow-lg shadow-brand-500/30"
            >
              <CheckCheck className="w-5 h-5" />
              <span>Lançar Medições</span>
            </button>
          </div>
        </div>
      </form>

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
                  <th className="px-6 py-3.5">Data & Hora</th>
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
                        <div className="flex items-center gap-1.5">
                          <span>{new Date(l.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          {l.time && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold font-mono">
                              <Clock className="w-3 h-3 text-brand-500" />
                              {l.time}
                            </span>
                          )}
                        </div>
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
                      <td className="px-6 py-4 text-gray-800 font-medium">
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
