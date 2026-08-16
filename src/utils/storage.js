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

export const saveViveiros = async (data) => {
  setStorageData(KEYS.VIVEIROS, data);
  if (supabase) {
    try {
      await supabase.from('viveiros').upsert(data);
    } catch (e) {
      console.warn('Erro ao sincronizar viveiros no Supabase:', e);
    }
  }
};

export const loadPovoamentos = () => {
  const data = getStorageData(KEYS.POVOAMENTOS, null);
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(KEYS.POVOAMENTOS, INITIAL_POVOAMENTOS);
    return INITIAL_POVOAMENTOS;
  }
  return data;
};

export const savePovoamentos = async (data) => {
  setStorageData(KEYS.POVOAMENTOS, data);
  if (supabase) {
    try {
      const formatted = data.map((p) => ({
        id: p.id,
        viveiro_id: p.viveiroId,
        numero_lote: p.numeroLote || 'Lote 01',
        data_povoamento: p.dataPovoamento,
        quantidade: p.quantidade,
        densidade: p.densidade,
        status: p.status,
        data_finalizacao: p.dataFinalizacao || null
      }));
      await supabase.from('povoamentos').upsert(formatted);
    } catch (e) {
      console.warn('Erro ao sincronizar povoamentos no Supabase:', e);
    }
  }
};

export const loadParametros = () => {
  const data = getStorageData(KEYS.PARAMETROS, null);
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(KEYS.PARAMETROS, INITIAL_PARAMETERS);
    return INITIAL_PARAMETERS;
  }
  return data;
};

export const saveParametros = async (data) => {
  setStorageData(KEYS.PARAMETROS, data);
  if (supabase) {
    try {
      const formatted = data.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        has_min: p.hasMin,
        min: p.min,
        max: p.max,
        is_custom: p.isCustom
      }));
      await supabase.from('parametros').upsert(formatted);
    } catch (e) {
      console.warn('Erro ao sincronizar parâmetros no Supabase:', e);
    }
  }
};

export const loadLancamentos = () => {
  const data = getStorageData(KEYS.LANCAMENTOS, null);
  if (!data || !Array.isArray(data) || data.length < 50) {
    setStorageData(KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    return INITIAL_LANCAMENTOS;
  }
  return data;
};

export const saveLancamentos = async (data) => {
  setStorageData(KEYS.LANCAMENTOS, data);
  if (supabase) {
    try {
      const formatted = data.map((l) => ({
        id: l.id,
        viveiro_id: l.viveiroId,
        povoamento_id: l.povoamentoId,
        parameter_id: l.parameterId,
        date: l.date,
        value: l.value
      }));
      await supabase.from('lancamentos').upsert(formatted);
    } catch (e) {
      console.warn('Erro ao sincronizar lançamentos no Supabase:', e);
    }
  }
};

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
