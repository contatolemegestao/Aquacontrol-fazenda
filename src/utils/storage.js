import { supabase } from '../lib/supabase';
import {
  INITIAL_PARAMETERS,
  INITIAL_VIVEIROS,
  INITIAL_POVOAMENTOS,
  INITIAL_LANCAMENTOS
} from '../data/initialData';

const KEYS = {
  VIVEIROS: 'aqua_control_viveiros_lote_v1',
  POVOAMENTOS: 'aqua_control_povoamentos_lote_v1',
  PARAMETROS: 'aqua_control_parametros_lote_v1',
  LANCAMENTOS: 'aqua_control_lancamentos_lote_v1'
};

export const getStorageData = (key, fallbackData) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallbackData;
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return fallbackData;
  }
};

export const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
};

// --- LEITURA E ESCRITA LOCAL (FALLBACK PERSISTENTE) ---
export const loadViveiros = () => {
  const data = getStorageData(KEYS.VIVEIROS, null);
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(KEYS.VIVEIROS, INITIAL_VIVEIROS);
    return INITIAL_VIVEIROS;
  }
  return data;
};
export const saveViveiros = (data) => setStorageData(KEYS.VIVEIROS, data);

export const loadPovoamentos = () => {
  const data = getStorageData(KEYS.POVOAMENTOS, null);
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(KEYS.POVOAMENTOS, INITIAL_POVOAMENTOS);
    return INITIAL_POVOAMENTOS;
  }
  return data;
};
export const savePovoamentos = (data) => setStorageData(KEYS.POVOAMENTOS, data);

export const loadParametros = () => {
  const data = getStorageData(KEYS.PARAMETROS, null);
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(KEYS.PARAMETROS, INITIAL_PARAMETERS);
    return INITIAL_PARAMETERS;
  }
  return data;
};
export const saveParametros = (data) => setStorageData(KEYS.PARAMETROS, data);

export const loadLancamentos = () => {
  const data = getStorageData(KEYS.LANCAMENTOS, null);
  if (!data || !Array.isArray(data) || data.length < 50) {
    setStorageData(KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    return INITIAL_LANCAMENTOS;
  }
  return data;
};
export const saveLancamentos = (data) => setStorageData(KEYS.LANCAMENTOS, data);

// Reset completo para dados de fábrica
export const resetToDefaultData = () => {
  localStorage.clear();
  window.location.reload();
};
