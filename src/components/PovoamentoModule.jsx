import React, { useState } from 'react';
import { Fish, Plus, CheckCircle2, AlertCircle, Calculator, CheckSquare, Tag } from 'lucide-react';
import { formatThousands, parseThousands, formatDensidade } from '../utils/formatters';

export default function PovoamentoModule({ viveiros, povoamentos, setPovoamentos }) {
  const [selectedViveiroId, setSelectedViveiroId] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [dataPovoamento, setDataPovoamento] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [quantidadeFormatted, setQuantidadeFormatted] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 4000);
  };

  const handleQtdChange = (e) => {
    const rawVal = e.target.value;
    setQuantidadeFormatted(formatThousands(rawVal));
  };

  // Filtrar apenas viveiros que NÃO possuem um ciclo ativo
  const viveirosDisponiveis = viveiros.filter((v) => {
    return !povoamentos.some((p) => p.viveiroId === v.id && p.status === 'ativo');
  });

  const selectedViveiro = viveiros.find((v) => v.id === selectedViveiroId);
  const numQuantidade = parseThousands(quantidadeFormatted);
  const rawDensidade =
    selectedViveiro && selectedViveiro.area > 0 && numQuantidade > 0
      ? numQuantidade / selectedViveiro.area
      : 0;

  const handleSavePovoamento = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedViveiroId) {
      setErrorMsg('Selecione um viveiro livre para povoar.');
      return;
    }
    if (!numeroLote.trim()) {
      setErrorMsg('Informe o Número do Lote (ex: Lote 01, Lote 02/2026).');
      return;
    }
    if (!dataPovoamento) {
      setErrorMsg('Informe a data do povoamento.');
      return;
    }
    if (numQuantidade <= 0) {
      setErrorMsg('Informe uma quantidade de camarões maior que zero.');
      return;
    }

    const newPovoamento = {
      id: `pov-${Date.now()}`,
      viveiroId: selectedViveiroId,
      numeroLote: numeroLote.trim(),
      dataPovoamento,
      quantidade: numQuantidade,
      densidade: rawDensidade,
      status: 'ativo',
      createdAt: new Date().toISOString()
    };

    setPovoamentos([newPovoamento, ...povoamentos]);
    setSelectedViveiroId('');
    setNumeroLote('');
    setQuantidadeFormatted('');
    triggerToast('Povoamento cadastrado com sucesso!');
  };

  const handleFinalizarCiclo = (povoamentoId) => {
    if (
      window.confirm(
        'Deseja finalizar este ciclo de povoamento (despesca)? O viveiro ficará livre para um novo povoamento.'
      )
    ) {
      setPovoamentos(
        povoamentos.map((p) =>
          p.id === povoamentoId
            ? { ...p, status: 'finalizado', dataFinalizacao: new Date().toISOString().split('T')[0] }
            : p
        )
      );
      triggerToast('Ciclo finalizado com sucesso!');
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
            <Fish className="w-7 h-7 text-brand-500" />
            Povoamento de Viveiros
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre os novos lotes de povoamento nos viveiros sem ciclo ativo. O sistema calcula a densidade automaticamente.
          </p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2 self-start md:self-auto">
          <span>Ciclos Ativos:</span>
          <span className="bg-emerald-500 text-white text-xs px-2.5 py-0.5 rounded-full">
            {povoamentos.filter((p) => p.status === 'ativo').length}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Novo Povoamento</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePovoamento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Seletor de Viveiro Disponível */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Viveiro Livre
              </label>
              <select
                value={selectedViveiroId}
                onChange={(e) => setSelectedViveiroId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none bg-white transition"
              >
                <option value="">-- Selecione um Viveiro Livre --</option>
                {viveirosDisponiveis.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.area.toLocaleString('pt-BR')} m²)
                  </option>
                ))}
              </select>
              {viveirosDisponiveis.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Todos os viveiros já estão povoados ou não há viveiros cadastrados.
                </p>
              )}
            </div>

            {/* Número do Lote */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Número do Lote
              </label>
              <input
                type="text"
                placeholder="Ex: Lote 01/2026"
                value={numeroLote}
                onChange={(e) => setNumeroLote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-semibold outline-none transition"
              />
            </div>

            {/* Data do Povoamento */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Data do Povoamento
              </label>
              <input
                type="date"
                value={dataPovoamento}
                onChange={(e) => setDataPovoamento(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
              />
            </div>

            {/* Quantidade Povoada (Camarões) com separador de milhar */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Quantidade Povoada (Camarões)
              </label>
              <input
                type="text"
                placeholder="Ex: 150.000"
                value={quantidadeFormatted}
                onChange={handleQtdChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-mono font-medium outline-none transition"
              />
            </div>
          </div>

          {/* Cálculo de Densidade em tempo real */}
          {selectedViveiro && (
            <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-brand-700 font-semibold block uppercase tracking-wider">
                    Densidade Calculada
                  </span>
                  <span className="text-xl font-bold text-brand-900 font-mono">
                    {formatDensidade(rawDensidade)} <span className="text-sm font-sans font-normal text-brand-700">camarões / m²</span>
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-gray-500 hidden sm:block">
                Fórmula: {numQuantidade.toLocaleString('pt-BR')} camarões ÷ {selectedViveiro.area.toLocaleString('pt-BR')} m²
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={viveirosDisponiveis.length === 0}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Povoamento</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Povoamentos (Ativos e Histórico) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Histórico de Povoamentos por Lote</h2>
        </div>

        {povoamentos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Fish className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Nenhum povoamento cadastrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3.5">Viveiro</th>
                  <th className="px-6 py-3.5">Número do Lote</th>
                  <th className="px-6 py-3.5">Data Povoamento</th>
                  <th className="px-6 py-3.5">Qtd Povoada</th>
                  <th className="px-6 py-3.5">Densidade</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {povoamentos.map((p) => {
                  const viv = viveiros.find((v) => v.id === p.viveiroId);
                  const isAtivo = p.status === 'ativo';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {viv ? viv.name : 'Viveiro Removido'}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-brand-500" />
                        {p.numeroLote || 'Lote Indefinido'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(p.dataPovoamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-800">
                        {p.quantidade.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-600">
                        {formatDensidade(p.densidade)} cam/m²
                      </td>
                      <td className="px-6 py-4">
                        {isAtivo ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            🟢 Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            ⚪ Finalizado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAtivo && (
                          <button
                            onClick={() => handleFinalizarCiclo(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Finalizar Ciclo</span>
                          </button>
                        )}
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
