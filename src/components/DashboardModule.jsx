import React, { useState } from 'react';
import {
  BarChart3,
  Table as TableIcon,
  Filter,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';

// Converte YYYY-MM-DD para DD/MM/AAAA
const formatDateBR = (isoDateStr) => {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDateStr;
};

// Paleta de cores distintas para cada viveiro no gráfico consolidado
const VIVEIRO_COLORS = [
  '#1A56DB', // Azul Principal
  '#10B981', // Verde Esmeralda
  '#F59E0B', // Âmbar / Laranja
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#E11D48'  // Vermelho Rosa
];

export default function DashboardModule({
  viveiros,
  parametros,
  lancamentos
}) {
  // Estado da caixa de seleção no topo: 'chart' (Gráfico) ou 'table' (Tabela)
  const [viewMode, setViewMode] = useState('chart');

  // Filtro por viveiro ('all' para todos os viveiros ou ID do viveiro)
  const [selectedViveiroId, setSelectedViveiroId] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header & Seletor de Modo no Topo */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-brand-500" />
              Dashboard de Qualidade de Água
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe a evolução histórica dos parâmetros de cada viveiro em gráficos ou tabelas independentes.
            </p>
          </div>

          {/* CAIXA DE SELEÇÃO NO TOPO - Escolher Gráfico ou Tabela */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'chart'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Visualização em Gráfico</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Visualização em Tabela</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtro por viveiro */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>Filtrar Viveiro:</span>
            <select
              value={selectedViveiroId}
              onChange={(e) => setSelectedViveiroId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Todos os Viveiros (Consolidado)</option>
              {viveiros.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Exibindo <span className="font-bold text-gray-800">{parametros.length}</span> parâmetros
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO INDEPENDENTE PARA CADA PARÂMETRO */}
      <div className="space-y-6">
        {parametros.map((param) => {
          // Lançamentos filtrados para este parâmetro
          const paramLancamentos = lancamentos
            .filter((l) => l.parameterId === param.id)
            .filter((l) => selectedViveiroId === 'all' || l.viveiroId === selectedViveiroId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          // Viveiros que possuem medições para este parâmetro
          const viveirosComDados = viveiros.filter((v) =>
            paramLancamentos.some((l) => l.viveiroId === v.id)
          );

          // Extrair todas as datas únicas ordenadas
          const uniqueDates = Array.from(
            new Set(paramLancamentos.map((l) => l.date))
          ).sort();

          // Montar a estrutura de dados para o Recharts (uma linha por viveiro se "all" estiver selecionado)
          const chartData = uniqueDates.map((dateStr) => {
            const dataPoint = {
              date: formatDateBR(dateStr).substring(0, 5), // DD/MM para eixo X
              formattedDate: formatDateBR(dateStr), // DD/MM/AAAA para tooltip
              fullDate: dateStr
            };

            // Adicionar a leitura de cada viveiro como uma chave no objeto do ponto
            viveirosComDados.forEach((v) => {
              const reading = paramLancamentos.find(
                (l) => l.date === dateStr && l.viveiroId === v.id
              );
              if (reading) {
                dataPoint[v.name] = reading.value;
              }
            });

            return dataPoint;
          });

          const hasMin = param.hasMin && param.min !== null && param.min !== undefined;
          const lastReading = paramLancamentos[paramLancamentos.length - 1];

          return (
            <div
              key={param.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 hover:border-brand-200 transition-colors"
            >
              {/* Header do Parâmetro Individual */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-500"></span>
                    {param.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Unidade: <span className="font-mono text-gray-700 font-bold">{param.unit}</span> |
                    Faixa Aceitável: {' '}
                    <span className="font-mono text-emerald-700 font-semibold">
                      {hasMin ? `${param.min} a ${param.max}` : `0 a ${param.max}`} {param.unit}
                    </span>
                  </p>
                </div>

                {/* Badge da última leitura */}
                {lastReading && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 self-start sm:self-auto">
                    <span className="text-xs text-gray-500 font-medium">Último valor:</span>
                    <span className="text-sm font-bold font-mono text-brand-600">
                      {lastReading.value} {param.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* CONTEÚDO: GRÁFICO OU TABELA INDEPENDENTE */}
              {paramLancamentos.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    Sem lançamentos registrados para o parâmetro {param.name}.
                  </p>
                </div>
              ) : viewMode === 'chart' ? (
                /* VISUALIZAÇÃO EM GRÁFICO DE LINHAS CONSOLIDADO */
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        stroke="#cbd5e1"
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        stroke="#cbd5e1"
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-xl text-xs space-y-1.5">
                                <p className="text-gray-600 font-semibold border-b pb-1">Data: <span className="font-mono font-bold text-gray-900">{data.formattedDate}</span></p>
                                {payload.map((entry) => (
                                  <div key={entry.name} className="flex items-center justify-between gap-3">
                                    <span className="font-semibold" style={{ color: entry.color }}>
                                      {entry.name}:
                                    </span>
                                    <span className="font-mono font-bold text-gray-900">
                                      {entry.value} {param.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      {/* Legenda quando exibindo múltiplos viveiros */}
                      {selectedViveiroId === 'all' && (
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
                        />
                      )}

                      {/* Linha Guia Limite Mínimo (se houver) */}
                      {hasMin && (
                        <ReferenceLine
                          y={param.min}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          label={{
                            value: `Mín: ${param.min}`,
                            fill: '#d97706',
                            fontSize: 10,
                            position: 'insideBottomLeft'
                          }}
                        />
                      )}

                      {/* Linha Guia Limite Máximo */}
                      {param.max && (
                        <ReferenceLine
                          y={param.max}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          label={{
                            value: `Máx: ${param.max}`,
                            fill: '#dc2626',
                            fontSize: 10,
                            position: 'insideTopLeft'
                          }}
                        />
                      )}

                      {/* UMA LINHA DE COR DIFERENTE PARA CADA VIVEIRO */}
                      {viveirosComDados.map((v, idx) => {
                        const lineColor = VIVEIRO_COLORS[idx % VIVEIRO_COLORS.length];
                        return (
                          <Line
                            key={v.id}
                            type="monotone"
                            dataKey={v.name}
                            name={v.name}
                            stroke={lineColor}
                            strokeWidth={3}
                            dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#ffffff' }}
                            activeDot={{ r: 6, fill: lineColor }}
                            connectNulls={true}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                /* VISUALIZAÇÃO EM TABELA POR DATAS (DD/MM/AAAA) */
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Viveiro</th>
                        {uniqueDates.map((dateStr) => (
                          <th key={dateStr} className="px-4 py-3 text-center font-mono">
                            {formatDateBR(dateStr)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {viveirosComDados.map((v) => {
                        const vLancamentos = paramLancamentos.filter((l) => l.viveiroId === v.id);

                        return (
                          <tr key={v.id} className="hover:bg-gray-50/80">
                            <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-100">
                              {v.name}
                            </td>
                            {uniqueDates.map((dStr) => {
                              const entry = vLancamentos.find((l) => l.date === dStr);
                              if (!entry) {
                                return (
                                  <td key={dStr} className="px-4 py-3 text-center text-gray-300 font-mono text-xs">
                                    -
                                  </td>
                                );
                              }

                              const val = entry.value;
                              const isBelow = hasMin && val < param.min;
                              const isAbove = param.max !== null && val > param.max;

                              return (
                                <td key={dStr} className="px-4 py-3 text-center font-mono font-bold">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                                      isBelow
                                        ? 'bg-amber-100 text-amber-800'
                                        : isAbove
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-emerald-50 text-emerald-800'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
