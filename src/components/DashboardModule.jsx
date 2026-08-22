import React, { useState } from 'react';
import {
  BarChart3,
  Table as TableIcon,
  Filter,
  Activity,
  Tag,
  Sliders,
  Sparkles,
  Sun,
  Calendar,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

// Determina o período do dia (Manhã, Tarde, Noite) com base no horário HH:MM
const getPeriodFromTimeStr = (timeStr) => {
  if (!timeStr) return 'manha'; // fallback padrão
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return 'manha';

  // Manhã: 05:00 até 11:59 (5 <= hour < 12)
  if (hour >= 5 && hour < 12) return 'manha';
  // Tarde: 12:00 até 17:59 (12 <= hour < 18)
  if (hour >= 12 && hour < 18) return 'tarde';
  // Noite: 18:00 até 04:59 (hour >= 18 ou hour < 5)
  return 'noite';
};

// Configuração dos 5 Pares Estratégicos de Parâmetros (Subscrito O₂ corrigido)
const STRATEGIC_PAIRS = [
  {
    id: 'pair-o2-temp',
    title: 'Oxigênio Dissolvido (O₂) x Temperatura',
    param1Id: 'param-1',
    param2Id: 'param-3',
    sameAxis: false,
    leftLabel: 'mg/L',
    rightLabel: '°C'
  },
  {
    id: 'pair-alc-dur',
    title: 'Alcalinidade x Dureza',
    param1Id: 'param-4',
    param2Id: 'param-5',
    sameAxis: true,
    leftLabel: 'mg CaCO₃/L',
    rightLabel: 'mg CaCO₃/L'
  },
  {
    id: 'pair-alc-ph',
    title: 'Alcalinidade x pH',
    param1Id: 'param-4',
    param2Id: 'param-2',
    sameAxis: false,
    leftLabel: 'mg CaCO₃/L',
    rightLabel: 'pH'
  },
  {
    id: 'pair-nh3-ph',
    title: 'Amônia Tóxica (NH₃) x pH',
    param1Id: 'param-6',
    param2Id: 'param-2',
    sameAxis: false,
    leftLabel: 'mg/L',
    rightLabel: 'pH'
  },
  {
    id: 'pair-sal-no2',
    title: 'Salinidade x Nitrito (NO₂⁻)',
    param1Id: 'param-9',
    param2Id: 'param-8',
    sameAxis: false,
    leftLabel: 'ppt',
    rightLabel: 'mg/L'
  }
];

// IDs de parâmetros que já fazem parte dos pares estratégicos principais
const STRATEGIC_PARAM_IDS = new Set([
  'param-1', // O2
  'param-3', // Temp
  'param-4', // Alc
  'param-5', // Dur
  'param-2', // pH
  'param-6', // NH3
  'param-9', // Sal
  'param-8'  // NO2
]);

export default function DashboardModule({
  viveiros,
  povoamentos = [],
  parametros,
  lancamentos
}) {
  const [viewMode, setViewMode] = useState('chart');

  // Filtros principais do Dashboard
  const [selectedViveiroId, setSelectedViveiroId] = useState('all');
  const [selectedPovoamentoId, setSelectedPovoamentoId] = useState('all');
  
  // FILTRO OBRIGATÓRIO DE PERÍODO (Manhã, Tarde ou Noite) - Padrão: Manhã
  const [selectedPeriod, setSelectedPeriod] = useState('manha'); // manha | tarde | noite

  // FILTRO FLEXÍVEL DE DATA: 'ciclo' (Ciclo Inteiro) | 'personalizado' | 'dia' (Dia Específico)
  const [dateScope, setDateScope] = useState('ciclo');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [specificDateInput, setSpecificDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Estado dos checkboxes independentes de cada gráfico par: { [pairId]: { showP1: true, showP2: true } }
  const [pairCheckboxes, setPairCheckboxes] = useState({
    'pair-o2-temp': { showP1: true, showP2: true },
    'pair-alc-dur': { showP1: true, showP2: true },
    'pair-alc-ph': { showP1: true, showP2: true },
    'pair-nh3-ph': { showP1: true, showP2: true },
    'pair-sal-no2': { showP1: true, showP2: true }
  });

  // Estado do Gráfico/Tabela Livre (Análise Comparativa Personalizada)
  const [customParam1Id, setCustomParam1Id] = useState(parametros[0]?.id || '');
  const [customParam2Id, setCustomParam2Id] = useState(parametros[1]?.id || '');
  const [customCheckboxes, setCustomCheckboxes] = useState({ showP1: true, showP2: true });

  const lotesDisponiveis = selectedViveiroId === 'all'
    ? povoamentos
    : povoamentos.filter((p) => p.viveiroId === selectedViveiroId);

  // Lote ativo ou selecionado para determinar o marco zero (Data de Povoamento)
  const selectedLoteObj = povoamentos.find((p) => p.id === selectedPovoamentoId);
  const minCycleStartDate = selectedLoteObj?.dataPovoamento || '2026-01-01';

  // Parâmetros individuais (que não fazem parte dos pares consolidados ou que têm acompanhamento individual, ex: Transparência e NAT)
  const individualParams = parametros.filter((p) => !STRATEGIC_PARAM_IDS.has(p.id) || p.id === 'param-10' || p.id === 'param-7');

  const handleViveiroChange = (vId) => {
    setSelectedViveiroId(vId);
    setSelectedPovoamentoId('all');
  };

  const togglePairCheckbox = (pairId, paramKey) => {
    setPairCheckboxes((prev) => {
      const current = prev[pairId] || { showP1: true, showP2: true };
      const updated = { ...current, [paramKey]: !current[paramKey] };
      if (!updated.showP1 && !updated.showP2) {
        return prev;
      }
      return { ...prev, [pairId]: updated };
    });
  };

  const toggleCustomCheckbox = (paramKey) => {
    setCustomCheckboxes((prev) => {
      const updated = { ...prev, [paramKey]: !prev[paramKey] };
      if (!updated.showP1 && !updated.showP2) {
        return prev;
      }
      return updated;
    });
  };

  // Label amigável do período selecionado
  const getPeriodLabel = (p) => {
    if (p === 'manha') return '🌅 Manhã (05:00 - 11:59)';
    if (p === 'tarde') return '☀️ Tarde (12:00 - 17:59)';
    if (p === 'noite') return '🌙 Noite (18:00 - 04:59)';
    return 'Manhã';
  };

  // -------------------------------------------------------------
  // LÓGICA DE DADOS COMBINADOS PARA 2 PARÂMETROS
  // -------------------------------------------------------------
  const buildDualParamChartData = (p1Id, p2Id) => {
    const p1 = parametros.find((p) => p.id === p1Id);
    const p2 = parametros.find((p) => p.id === p2Id);
    if (!p1 || !p2) return { data: [], p1, p2 };

    // 1. Filtrar por viveiro e por lote
    let filtered = lancamentos
      .filter((l) => l.parameterId === p1Id || l.parameterId === p2Id)
      .filter((l) => selectedViveiroId === 'all' || l.viveiroId === selectedViveiroId)
      .filter((l) => selectedPovoamentoId === 'all' || l.povoamentoId === selectedPovoamentoId);

    // 2. Filtrar pelo escopo de Data selecionado
    if (dateScope === 'dia') {
      const targetDate = specificDateInput || new Date().toISOString().split('T')[0];
      filtered = filtered.filter((l) => l.date === targetDate);
    } else if (dateScope === 'personalizado') {
      if (startDateInput) {
        // Trava: não permite data inicial menor que a data de povoamento
        const effectiveStart = startDateInput < minCycleStartDate ? minCycleStartDate : startDateInput;
        filtered = filtered.filter((l) => l.date >= effectiveStart);
      }
      if (endDateInput) {
        filtered = filtered.filter((l) => l.date <= endDateInput);
      }
    } else if (dateScope === 'ciclo') {
      // Ciclo Inteiro: A partir da data de povoamento do lote
      filtered = filtered.filter((l) => l.date >= minCycleStartDate);
    }

    // 3. SE FOR MODO "DIA ESPECÍFICO": EIXO X É OS HORÁRIOS
    if (dateScope === 'dia') {
      filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const uniqueTimes = Array.from(new Set(filtered.map((l) => l.time || '08:00'))).sort();

      const data = uniqueTimes.map((timeStr) => {
        const p1Match = filtered.filter((l) => (l.time || '08:00') === timeStr && l.parameterId === p1Id).pop();
        const p2Match = filtered.filter((l) => (l.time || '08:00') === timeStr && l.parameterId === p2Id).pop();

        return {
          date: timeStr,
          formattedDate: formatDateBR(specificDateInput),
          time: timeStr,
          [p1.name]: p1Match ? p1Match.value : null,
          [p2.name]: p2Match ? p2Match.value : null
        };
      });

      return { data, p1, p2 };
    }

    // 4. SE FOR CICLO OU PERÍODO PERSONALIZADO: FILTRA PELO TURNO (MANHÃ/TARDE/NOITE) E PEGA O ÚLTIMO REGISTRO DO TURNO
    filtered = filtered.filter((l) => getPeriodFromTimeStr(l.time) === selectedPeriod);
    filtered.sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')));

    const uniqueDates = Array.from(new Set(filtered.map((l) => l.date))).sort();

    const data = uniqueDates.map((dateStr) => {
      // REGRA DE DESEMPATE: Se houver 2 lançamentos no mesmo turno, pega o ÚLTIMO do turno (.pop())
      const p1Matches = filtered.filter((l) => l.date === dateStr && l.parameterId === p1Id);
      const p2Matches = filtered.filter((l) => l.date === dateStr && l.parameterId === p2Id);

      const p1Match = p1Matches.length > 0 ? p1Matches[p1Matches.length - 1] : null;
      const p2Match = p2Matches.length > 0 ? p2Matches[p2Matches.length - 1] : null;

      return {
        date: formatDateBR(dateStr).substring(0, 5),
        formattedDate: formatDateBR(dateStr),
        time: p1Match?.time || p2Match?.time || '',
        [p1.name]: p1Match ? p1Match.value : null,
        [p2.name]: p2Match ? p2Match.value : null
      };
    });

    return { data, p1, p2 };
  };

  // -------------------------------------------------------------
  // LÓGICA DE DADOS PARA 1 PARÂMETRO INDIVIDUAL
  // -------------------------------------------------------------
  const buildSingleParamChartData = (paramId) => {
    const param = parametros.find((p) => p.id === paramId);
    if (!param) return { data: [], param };

    let filtered = lancamentos
      .filter((l) => l.parameterId === paramId)
      .filter((l) => selectedViveiroId === 'all' || l.viveiroId === selectedViveiroId)
      .filter((l) => selectedPovoamentoId === 'all' || l.povoamentoId === selectedPovoamentoId);

    // Escopo de Data
    if (dateScope === 'dia') {
      const targetDate = specificDateInput || new Date().toISOString().split('T')[0];
      filtered = filtered.filter((l) => l.date === targetDate);
    } else if (dateScope === 'personalizado') {
      if (startDateInput) {
        const effectiveStart = startDateInput < minCycleStartDate ? minCycleStartDate : startDateInput;
        filtered = filtered.filter((l) => l.date >= effectiveStart);
      }
      if (endDateInput) {
        filtered = filtered.filter((l) => l.date <= endDateInput);
      }
    } else if (dateScope === 'ciclo') {
      filtered = filtered.filter((l) => l.date >= minCycleStartDate);
    }

    // Modo Dia Específico
    if (dateScope === 'dia') {
      filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const data = filtered.map((l) => ({
        date: l.time || '08:00',
        formattedDate: formatDateBR(l.date),
        time: l.time || '',
        value: l.value
      }));
      return { data, param };
    }

    // Filtrar Turno e Desempate (.pop())
    filtered = filtered.filter((l) => getPeriodFromTimeStr(l.time) === selectedPeriod);
    filtered.sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')));

    const uniqueDates = Array.from(new Set(filtered.map((l) => l.date))).sort();

    const data = uniqueDates.map((dateStr) => {
      const matches = filtered.filter((l) => l.date === dateStr);
      const lastMatch = matches[matches.length - 1];
      return {
        date: formatDateBR(dateStr).substring(0, 5),
        formattedDate: formatDateBR(dateStr),
        time: lastMatch?.time || '',
        value: lastMatch?.value
      };
    });

    return { data, param };
  };

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      {/* Header & Seletor de Modo no Topo */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-brand-500" />
              Dashboard de Qualidade de Água
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Análise estratégica consolidada por viveiro, lote, período e intervalo de data.
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

        {/* BARRA DE FILTROS: VIVEIRO, LOTE, ESCOPO DE DATA E PERÍODO */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-medium">
            {/* FILTRO VIVEIRO */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-500" />
              <span>Viveiro:</span>
              <select
                value={selectedViveiroId}
                onChange={(e) => handleViveiroChange(e.target.value)}
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

            {/* FILTRO LOTE */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-500" />
              <span>Lote:</span>
              <select
                value={selectedPovoamentoId}
                onChange={(e) => setSelectedPovoamentoId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Todos os Lotes</option>
                {lotesDisponiveis.map((p) => {
                  const viv = viveiros.find((v) => v.id === p.viveiroId);
                  const isAtivo = p.status === 'ativo';
                  return (
                    <option key={p.id} value={p.id}>
                      {isAtivo ? '🟢' : '⚪'} {viv ? `${viv.name} - ` : ''}{p.numeroLote || 'Lote'} ({isAtivo ? 'Ativo' : 'Finalizado'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 🎯 SELETOR DE ESCOPO DE DATA */}
            <div className="flex items-center gap-2 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900 font-bold">Escopo:</span>
              <select
                value={dateScope}
                onChange={(e) => setDateScope(e.target.value)}
                className="px-3 py-1 rounded-lg border border-blue-300 bg-white text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ciclo">Ciclo Inteiro</option>
                <option value="personalizado">Período Personalizado</option>
                <option value="dia">Dia Específico</option>
              </select>
            </div>

            {/* 🎯 FILTRO DE PERÍODO DO DIA (OCULTO SE FOR DIA ESPECÍFICO) */}
            {dateScope !== 'dia' && (
              <div className="flex items-center gap-2 bg-amber-50/80 px-3 py-1 rounded-xl border border-amber-200">
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="text-amber-900 font-bold">Período:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-amber-300 bg-white text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="manha">🌅 Manhã (05:00 às 11:59)</option>
                  <option value="tarde">☀️ Tarde (12:00 às 17:59)</option>
                  <option value="noite">🌙 Noite (18:00 às 04:59)</option>
                </select>
              </div>
            )}
          </div>

          {/* CONTROLES EXTRAS DE DATA QUANDO FOR PERSONALIZADO OU DIA ESPECÍFICO */}
          {dateScope === 'personalizado' && (
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span>Data Inicial:</span>
                <input
                  type="date"
                  min={minCycleStartDate}
                  value={startDateInput || minCycleStartDate}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Data Final:</span>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>
              <p className="text-[11px] text-gray-500 italic">
                * Data inicial limitada ao início do cultivo ({formatDateBR(minCycleStartDate)}).
              </p>
            </div>
          )}

          {dateScope === 'dia' && (
            <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Selecione a Data para Ver a Curva por Horários:</span>
              <input
                type="date"
                value={specificDateInput}
                onChange={(e) => setSpecificDateInput(e.target.value)}
                className="px-3 py-1 rounded-lg border border-amber-300 bg-white font-mono text-sm font-bold text-amber-900"
              />
              <span className="text-[11px] text-amber-700 font-medium">
                (O Eixo X exibirá as horas medidas neste dia)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 📊 TÍTULO ÚNICO PARA A SEQUÊNCIA DA PÁGINA */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-2">
            <Sliders className="w-5 h-5 text-brand-500" />
            {viewMode === 'chart' ? 'Gráficos de Parâmetros' : 'Tabelas de Parâmetros'}
          </h2>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            {dateScope === 'dia'
              ? `Evolução por Horário (${formatDateBR(specificDateInput)})`
              : `Período: ${getPeriodLabel(selectedPeriod)}`}
          </span>
        </div>

        {/* 1. OS 5 PARES ESTRATÉGICOS CONSOLIDADOS (UM DEBAIXO DO OUTRO) */}
        {STRATEGIC_PAIRS.map((pair) => {
          const { data, p1, p2 } = buildDualParamChartData(pair.param1Id, pair.param2Id);
          const { showP1, showP2 } = pairCheckboxes[pair.id] || { showP1: true, showP2: true };

          return (
            <div
              key={pair.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 hover:border-brand-200 transition-colors w-full"
            >
              {/* Header do Gráfico/Tabela Par */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-500"></span>
                    {pair.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {p1?.name} ({pair.leftLabel}) vs {p2?.name} ({pair.rightLabel}) •{' '}
                    <span className="text-brand-600 font-semibold">
                      {dateScope === 'dia' ? `Horários de ${formatDateBR(specificDateInput)}` : getPeriodLabel(selectedPeriod)}
                    </span>
                  </p>
                </div>

                {/* BOTÕES CHECKBOXES INTERATIVOS NO CANTO SUPERIOR DIREITO */}
                {viewMode === 'chart' && (
                  <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                    {p1 && (
                      <button
                        type="button"
                        onClick={() => togglePairCheckbox(pair.id, 'showP1')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                          showP1
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          showP1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {showP1 && <span className="text-[10px] leading-none font-bold">✓</span>}
                        </div>
                        <span>{p1.name}</span>
                      </button>
                    )}

                    {p2 && (
                      <button
                        type="button"
                        onClick={() => togglePairCheckbox(pair.id, 'showP2')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                          showP2
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          showP2 ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {showP2 && <span className="text-[10px] leading-none font-bold">✓</span>}
                        </div>
                        <span>{p2.name}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CONTEÚDO: GRÁFICO DE EIXO DUPLO OU TABELA */}
              {data.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    Sem lançamentos registrados para o filtro selecionado.
                  </p>
                </div>
              ) : viewMode === 'chart' ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                      <YAxis yAxisId="left" tick={{ fill: '#1A56DB', fontSize: 12 }} stroke="#1A56DB" />
                      {!pair.sameAxis && (
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#E11D48', fontSize: 12 }} stroke="#E11D48" />
                      )}
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-xl text-xs space-y-1.5">
                                <p className="text-gray-600 font-semibold border-b pb-1">
                                  {dateScope === 'dia' ? 'Horário' : 'Data'}:{' '}
                                  <span className="font-mono text-gray-900 font-bold">{d.formattedDate}</span>{' '}
                                  {d.time && `às ${d.time}`}
                                </p>
                                {payload.map((entry) => (
                                  <div key={entry.name} className="flex items-center justify-between gap-3">
                                    <span className="font-semibold" style={{ color: entry.color }}>
                                      {entry.name}:
                                    </span>
                                    <span className="font-mono font-bold text-gray-900">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                      {showP1 && p1 && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey={p1.name}
                          name={`${p1.name} (${p1.unit})`}
                          stroke="#1A56DB"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#1A56DB', strokeWidth: 2, stroke: '#ffffff' }}
                          connectNulls
                        />
                      )}
                      {showP2 && p2 && (
                        <Line
                          yAxisId={pair.sameAxis ? 'left' : 'right'}
                          type="monotone"
                          dataKey={p2.name}
                          name={`${p2.name} (${p2.unit})`}
                          stroke="#E11D48"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#E11D48', strokeWidth: 2, stroke: '#ffffff' }}
                          connectNulls
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                /* MODO TABELA */
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">{dateScope === 'dia' ? 'Horário' : 'Data & Hora'}</th>
                        {p1 && <th className="px-4 py-3 font-semibold text-blue-700">{p1.name.toUpperCase()} ({p1.unit})</th>}
                        {p2 && <th className="px-4 py-3 font-semibold text-rose-700">{p2.name.toUpperCase()} ({p2.unit})</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-mono">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 text-gray-600 font-sans">
                            {row.formattedDate} {row.time && `às ${row.time}`}
                          </td>
                          {p1 && <td className="px-4 py-3 font-bold text-blue-700">{row[p1.name] ?? '-'}</td>}
                          {p2 && <td className="px-4 py-3 font-bold text-rose-700">{row[p2.name] ?? '-'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* 2. PARÂMETROS INDIVIDUAIS (TAMANHO NORMAL UM DEBAIXO DO OUTRO NA SEQUÊNCIA) */}
        {individualParams.map((param) => {
          const { data } = buildSingleParamChartData(param.id);

          return (
            <div
              key={param.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 hover:border-brand-200 transition-colors w-full"
            >
              {/* Header do Gráfico/Tabela Individual */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    {param.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Acompanhamento individual de {param.name} •{' '}
                    <span className="text-emerald-700 font-semibold">
                      {dateScope === 'dia' ? `Horários de ${formatDateBR(specificDateInput)}` : getPeriodLabel(selectedPeriod)}
                    </span>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                  {param.unit}
                </span>
              </div>

              {/* CONTEÚDO: GRÁFICO OU TABELA INDIVIDUAL */}
              {data.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    Sem lançamentos registrados para este filtro.
                  </p>
                </div>
              ) : viewMode === 'chart' ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                      <YAxis tick={{ fill: '#059669', fontSize: 12 }} stroke="#059669" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-xl text-xs space-y-1.5">
                                <p className="text-gray-600 font-semibold border-b pb-1">
                                  {dateScope === 'dia' ? 'Horário' : 'Data'}:{' '}
                                  <span className="font-mono text-gray-900 font-bold">{d.formattedDate}</span>{' '}
                                  {d.time && `às ${d.time}`}
                                </p>
                                <p className="font-mono font-bold text-emerald-600 text-sm">
                                  {param.name}: {d.value} {param.unit}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={`${param.name} (${param.unit})`}
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                /* MODO TABELA INDIVIDUAL */
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">{dateScope === 'dia' ? 'Horário' : 'Data & Hora'}</th>
                        <th className="px-4 py-3 font-semibold text-emerald-700 font-bold">{param.name.toUpperCase()} ({param.unit})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-mono">
                      {data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 text-gray-600 font-sans">
                            {row.formattedDate} {row.time && `às ${row.time}`}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-700">
                            {row.value} {param.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🎛️ 3. CARD DO GRÁFICO / TABELA LIVRE (ANÁLISE COMPARATIVA PERSONALIZADA) - ÚLTIMO ELEMENTO DA PÁGINA */}
      <div className={`rounded-2xl p-6 shadow-xl border space-y-4 mt-8 transition-colors ${
        viewMode === 'chart'
          ? 'bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 text-white border-brand-500/20'
          : 'bg-white text-gray-900 border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/20">
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${viewMode === 'chart' ? 'text-white' : 'text-gray-900'}`}>
              <Sparkles className={`w-5 h-5 ${viewMode === 'chart' ? 'text-amber-400' : 'text-brand-500'}`} />
              {viewMode === 'chart'
                ? 'Análise Comparativa Personalizada (Gráfico Livre)'
                : 'Análise Comparativa Personalizada (Tabela Livre)'}
            </h2>
            <p className={`text-xs mt-0.5 ${viewMode === 'chart' ? 'text-slate-400' : 'text-gray-500'}`}>
              Escolha quaisquer 2 parâmetros para analisar correlações livres.
            </p>
          </div>

          {/* BOTÕES CHECKBOXES INTERATIVOS NO CANTO SUPERIOR DIREITO DO CARD LIVRE */}
          {viewMode === 'chart' && (
            <div className="flex items-center gap-3 flex-wrap">
              {(() => {
                const p1 = parametros.find((p) => p.id === customParam1Id);
                const p2 = parametros.find((p) => p.id === customParam2Id);
                return (
                  <>
                    {p1 && (
                      <button
                        type="button"
                        onClick={() => toggleCustomCheckbox('showP1')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                          customCheckboxes.showP1
                            ? 'bg-sky-950/80 border-sky-500/50 text-sky-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          customCheckboxes.showP1 ? 'bg-sky-400 border-sky-400 text-slate-950' : 'border-slate-700 bg-slate-800'
                        }`}>
                          {customCheckboxes.showP1 && <span className="text-[10px] leading-none font-extrabold">✓</span>}
                        </div>
                        <span>{p1.name}</span>
                      </button>
                    )}

                    {p2 && (
                      <button
                        type="button"
                        onClick={() => toggleCustomCheckbox('showP2')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                          customCheckboxes.showP2
                            ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          customCheckboxes.showP2 ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-700 bg-slate-800'
                        }`}>
                          {customCheckboxes.showP2 && <span className="text-[10px] leading-none font-extrabold">✓</span>}
                        </div>
                        <span>{p2.name}</span>
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Controles de Seleção dos 2 Parâmetros (FUNCIONA EM AMBOS OS MODOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${viewMode === 'chart' ? 'text-slate-400' : 'text-gray-600'}`}>
              Parâmetro 1 (Eixo Esquerdo / Coluna 1)
            </label>
            <select
              value={customParam1Id}
              onChange={(e) => setCustomParam1Id(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 border ${
                viewMode === 'chart'
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {parametros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${viewMode === 'chart' ? 'text-slate-400' : 'text-gray-600'}`}>
              Parâmetro 2 (Eixo Direito / Coluna 2)
            </label>
            <select
              value={customParam2Id}
              onChange={(e) => setCustomParam2Id(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 border ${
                viewMode === 'chart'
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {parametros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTEÚDO DO CARD LIVRE: GRÁFICO OU TABELA LIVRE */}
        {(() => {
          const { data, p1, p2 } = buildDualParamChartData(customParam1Id, customParam2Id);
          if (!p1 || !p2 || data.length === 0) {
            return (
              <div className={`py-10 text-center rounded-xl border ${
                viewMode === 'chart'
                  ? 'text-slate-500 bg-slate-900/50 border-slate-800'
                  : 'text-gray-400 bg-gray-50/50 border-gray-200'
              }`}>
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Sem medições suficientes para os parâmetros selecionados.</p>
              </div>
            );
          }

          if (viewMode === 'chart') {
            const sameAxis = p1.unit === p2.unit;
            const { showP1, showP2 } = customCheckboxes;

            return (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                    <YAxis yAxisId="left" tick={{ fill: '#38bdf8', fontSize: 12 }} stroke="#38bdf8" />
                    {!sameAxis && (
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#f43f5e', fontSize: 12 }} stroke="#f43f5e" />
                    )}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl text-white">
                              <p className="text-slate-400 font-semibold border-b border-slate-800 pb-1">
                                {dateScope === 'dia' ? 'Horário' : 'Data'}:{' '}
                                <span className="font-mono text-white">{d.formattedDate}</span>{' '}
                                {d.time && `às ${d.time}`}
                              </p>
                              {payload.map((entry) => (
                                <div key={entry.name} className="flex items-center justify-between gap-3">
                                  <span className="font-semibold" style={{ color: entry.color }}>
                                    {entry.name}:
                                  </span>
                                  <span className="font-mono font-bold text-white">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    {showP1 && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={p1.name}
                        name={`${p1.name} (${p1.unit})`}
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#38bdf8' }}
                        connectNulls
                      />
                    )}
                    {showP2 && (
                      <Line
                        yAxisId={sameAxis ? 'left' : 'right'}
                        type="monotone"
                        dataKey={p2.name}
                        name={`${p2.name} (${p2.unit})`}
                        stroke="#f43f5e"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#f43f5e' }}
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          }

          /* TABELA LIVRE (MODO TABELA) */
          return (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">{dateScope === 'dia' ? 'Horário' : 'Data & Hora'}</th>
                    <th className="px-4 py-3 font-semibold text-blue-700">{p1.name.toUpperCase()} ({p1.unit})</th>
                    <th className="px-4 py-3 font-semibold text-rose-700">{p2.name.toUpperCase()} ({p2.unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-mono">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 text-gray-600 font-sans">
                        {row.formattedDate} {row.time && `às ${row.time}`}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-700">{row[p1.name] ?? '-'}</td>
                      <td className="px-4 py-3 font-bold text-rose-700">{row[p2.name] ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
