// Formata número com separador de milhar no padrão brasileiro (ex: 10000 -> "10.000")
export const formatThousands = (val) => {
  if (val === null || val === undefined || val === '') return '';
  // Remover tudo que não for dígito
  const cleanStr = val.toString().replace(/\D/g, '');
  if (!cleanStr) return '';
  const num = parseInt(cleanStr, 10);
  return num.toLocaleString('pt-BR');
};

// Converte string formatada "10.000" de volta para número puro 10000
export const parseThousands = (formattedStr) => {
  if (!formattedStr) return 0;
  const cleanStr = formattedStr.toString().replace(/\D/g, '');
  return parseInt(cleanStr, 10) || 0;
};

// Formata a densidade: se for inteiro (ex: 15), mostra 15. Se for decimal (ex: 15.555), mostra 15.6 (1 casa decimal)
export const formatDensidade = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Number(val);
  if (Number.isInteger(num)) {
    return num.toLocaleString('pt-BR');
  } else {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  }
};
