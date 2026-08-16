import { supabase } from '../lib/supabase';
import {
  INITIAL_PARAMETERS,
  INITIAL_VIVEIROS,
  INITIAL_POVOAMENTOS,
  INITIAL_LANCAMENTOS
} from '../data/initialData';

const KEYS = {
  VIVEIROS: 'aqua_control_viveiros_v168',
  POVOAMENTOS: 'aqua_control_povoamentos_v168',
  PARAMETROS: 'aqua_control_parametros_v168',
  LANCAMENTOS: 'aqua_control_lancamentos_v168'
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
  if (!data || !Array.isArray(data) || data.length < 100) {
    setStorageData(KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    return INITIAL_LANCAMENTOS;
  }
  return data;
};
export const saveLancamentos = (data) => setStorageData(KEYS.LANCAMENTOS, data);

// --- INTEGRAÇÃO ASSÍNCRONA COM SUPABASE ---
export const fetchAllFromSupabase = async () => {
  if (!supabase) return null;
  try {
    const [vivRes, povRes, parRes, lanRes] = await Promise.all([
      supabase.from('viveiros').select('*'),
      supabase.from('povoamentos').select('*'),
      supabase.from('parametros').select('*'),
      supabase.from('lancamentos').select('*')
    ]);

    return {
      viveiros: vivRes.data && vivRes.data.length > 0 ? vivRes.data : null,
      povoamentos: povRes.data && povRes.data.length > 0 ? povRes.data : null,
      parametros: parRes.data && parRes.data.length > 0 ? parRes.data : null,
      lancamentos: lanRes.data && lanRes.data.length > 0 ? lanRes.data : null
    };
  } catch (e) {
    console.warn('Supabase não conectado ou inacessível:', e);
    return null;
  }
};

export const resetToDefaultData = () => {
  localStorage.clear();
  window.location.reload();
};
