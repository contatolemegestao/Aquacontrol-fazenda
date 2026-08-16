export const INITIAL_PARAMETERS = [
  {
    id: 'param-1',
    name: 'Oxigênio Dissolvido (O2)',
    unit: 'mg/L',
    hasMin: true,
    min: 4,
    max: 20,
    isCustom: false
  },
  {
    id: 'param-2',
    name: 'pH',
    unit: '-',
    hasMin: true,
    min: 6,
    max: 8.5,
    isCustom: false
  },
  {
    id: 'param-3',
    name: 'Temperatura',
    unit: '°C',
    hasMin: true,
    min: 28,
    max: 32,
    isCustom: false
  },
  {
    id: 'param-4',
    name: 'Alcalinidade',
    unit: 'mg CaCO₃/L',
    hasMin: true,
    min: 80,
    max: 250,
    isCustom: false
  },
  {
    id: 'param-5',
    name: 'Dureza',
    unit: 'mg CaCO₃/L',
    hasMin: true,
    min: 80,
    max: 250,
    isCustom: false
  },
  {
    id: 'param-6',
    name: 'Amônia Tóxica (NH₃)',
    unit: 'mg/L',
    hasMin: false,
    min: null,
    max: 0.05,
    isCustom: false
  },
  {
    id: 'param-7',
    name: 'Nitrogênio Amoniacal Total (NAT)',
    unit: 'mg/L',
    hasMin: false,
    min: null,
    max: 1,
    isCustom: false
  },
  {
    id: 'param-8',
    name: 'Nitrito (NO₂⁻)',
    unit: 'mg/L',
    hasMin: false,
    min: null,
    max: 0.5,
    isCustom: false
  },
  {
    id: 'param-9',
    name: 'Salinidade',
    unit: 'ppt (g/L)',
    hasMin: true,
    min: 10,
    max: 20,
    isCustom: false
  },
  {
    id: 'param-10',
    name: 'Transparência',
    unit: 'cm',
    hasMin: true,
    min: 30,
    max: 50,
    isCustom: false
  }
];

export const INITIAL_VIVEIROS = [
  {
    id: 'viv-1',
    name: 'Viveiro 01 - Berçário',
    area: 5000,
    createdAt: '2026-01-01'
  },
  {
    id: 'viv-2',
    name: 'Viveiro 02 - Engorda A',
    area: 12000,
    createdAt: '2026-01-01'
  },
  {
    id: 'viv-3',
    name: 'Viveiro 03 - Engorda B',
    area: 15000,
    createdAt: '2026-01-01'
  }
];

export const INITIAL_POVOAMENTOS = [
  {
    id: 'pov-1',
    viveiroId: 'viv-1',
    numeroLote: 'Lote 01/2026',
    dataPovoamento: '2026-01-15',
    quantidade: 150000,
    densidade: 30,
    status: 'finalizado',
    dataFinalizacao: '2026-04-15',
    createdAt: '2026-01-15'
  },
  {
    id: 'pov-2',
    viveiroId: 'viv-1',
    numeroLote: 'Lote 02/2026',
    dataPovoamento: '2026-05-15',
    quantidade: 160000,
    densidade: 32,
    status: 'ativo',
    createdAt: '2026-05-15'
  },
  {
    id: 'pov-3',
    viveiroId: 'viv-2',
    numeroLote: 'Lote 01/2026',
    dataPovoamento: '2026-05-15',
    quantidade: 180000,
    densidade: 15,
    status: 'ativo',
    createdAt: '2026-05-15'
  }
];

export const INITIAL_LANCAMENTOS = [];

// 1. Oxigênio Dissolvido (param-1) para Viveiro 01 - Lote 02/2026 (Ativo): 60 lançamentos diários seguidos
const O2_VALUES_60 = [
  5.5, 5.8, 6.2, 6.0, 5.4, 4.8, 4.2, 3.8, 3.5, 4.5,
  5.2, 5.9, 6.3, 6.8, 7.2, 7.0, 6.5, 5.9, 5.3, 4.6,
  3.9, 3.2, 4.1, 5.0, 5.7, 6.4, 6.1, 5.8, 5.2, 4.7,
  5.3, 6.0, 6.6, 7.4, 8.0, 7.5, 6.9, 6.1, 5.5, 4.8,
  3.6, 2.9, 3.7, 4.6, 5.4, 6.2, 6.9, 7.3, 6.7, 6.0,
  5.6, 5.1, 4.5, 5.2, 6.1, 7.0, 20.5, 7.8, 6.2, 5.8
];

const startDateO2 = new Date('2026-06-14T00:00:00');
O2_VALUES_60.forEach((val, i) => {
  const curDate = new Date(startDateO2);
  curDate.setDate(curDate.getDate() + i);
  const dateStr = curDate.toISOString().split('T')[0];

  INITIAL_LANCAMENTOS.push({
    id: `l-o2-day-${i + 1}`,
    viveiroId: 'viv-1',
    povoamentoId: 'pov-2', // Lote 02/2026 (Ativo)
    parameterId: 'param-1',
    date: dateStr,
    value: val,
    createdAt: `${dateStr}T08:00:00`
  });
});

// 2. Lançamentos históricos para Lote 01/2026 (Finalizado) do Viveiro 01
const O2_VALUES_LOTE1 = [4.5, 5.2, 6.0, 5.8, 6.2, 4.2, 5.0, 6.5, 5.7, 6.1, 5.9, 6.3];
const LOTE1_DATES = [
  '2026-01-20', '2026-01-27', '2026-02-03', '2026-02-10',
  '2026-02-17', '2026-02-24', '2026-03-03', '2026-03-10',
  '2026-03-17', '2026-03-24', '2026-03-31', '2026-04-07'
];
O2_VALUES_LOTE1.forEach((val, i) => {
  INITIAL_LANCAMENTOS.push({
    id: `l-o2-lote1-${i + 1}`,
    viveiroId: 'viv-1',
    povoamentoId: 'pov-1', // Lote 01/2026 (Finalizado)
    parameterId: 'param-1',
    date: LOTE1_DATES[i],
    value: val,
    createdAt: `${LOTE1_DATES[i]}T08:00:00`
  });
});

// 3. Lançamentos para os demais 9 parâmetros para Lote 02/2026 (Ativo)
const WEEKLY_DATES = [
  '2026-05-20', '2026-05-27', '2026-06-03', '2026-06-10',
  '2026-06-17', '2026-06-24', '2026-07-01', '2026-07-08',
  '2026-07-15', '2026-07-22', '2026-07-29', '2026-08-05'
];

const OTHER_PARAM_DATA = {
  'param-2': [7.5, 7.8, 8.1, 5.8, 7.6, 8.4, 8.8, 7.2, 5.5, 7.9, 8.2, 7.7], // pH
  'param-3': [29.5, 30.0, 31.2, 27.5, 29.8, 32.5, 30.5, 27.0, 29.0, 31.0, 33.0, 30.2], // Temperatura
  'param-4': [120, 140, 110, 75, 135, 160, 260, 150, 68, 170, 190, 130], // Alcalinidade
  'param-5': [130, 150, 120, 140, 70, 180, 195, 265, 160, 75, 210, 145], // Dureza
  'param-6': [0.01, 0.02, 0.03, 0.07, 0.02, 0.04, 0.08, 0.01, 0.03, 0.06, 0.02, 0.03], // Amônia
  'param-7': [0.2, 0.4, 0.5, 1.2, 0.3, 0.6, 1.4, 0.3, 0.5, 0.8, 1.1, 0.4], // NAT
  'param-8': [0.1, 0.2, 0.15, 0.6, 0.25, 0.3, 0.75, 0.2, 0.35, 0.55, 0.3, 0.2], // Nitrito
  'param-9': [15, 16, 14, 8, 17, 19, 22, 15, 9, 18, 21, 16], // Salinidade
  'param-10': [35, 40, 38, 25, 42, 45, 54, 36, 28, 48, 52, 41] // Transparência
};

Object.keys(OTHER_PARAM_DATA).forEach((paramId) => {
  const values = OTHER_PARAM_DATA[paramId];
  values.forEach((val, weekIdx) => {
    INITIAL_LANCAMENTOS.push({
      id: `l-${paramId}-w${weekIdx + 1}`,
      viveiroId: 'viv-1',
      povoamentoId: 'pov-2', // Lote 02/2026 (Ativo)
      parameterId: paramId,
      date: WEEKLY_DATES[weekIdx],
      value: val,
      createdAt: `${WEEKLY_DATES[weekIdx]}T08:00:00`
    });
  });
});
