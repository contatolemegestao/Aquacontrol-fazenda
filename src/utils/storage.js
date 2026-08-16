import { supabase } from '../lib/supabase';
import {
  INITIAL_PARAMETERS,
  INITIAL_VIVEIROS,
  INITIAL_POVOAMENTOS,
  INITIAL_LANCAMENTOS
} from '../data/initialData';

// Função para gerar chaves isoladas por e-mail no LocalStorage
const getUserKey = (baseKey, userEmail) => {
  const safeEmail = userEmail ? userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest';
  return `${baseKey}_${safeEmail}`;
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

// --- CARREGAMENTO ISOLADO POR USUÁRIO ---
export const loadViveirosForUser = (userEmail) => {
  const isLemeAccount = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const fallback = isLemeAccount ? INITIAL_VIVEIROS : [];
  const key = getUserKey('aqua_control_viveiros_v2', userEmail);
  const data = getStorageData(key, null);
  
  if (!data || !Array.isArray(data)) {
    setStorageData(key, fallback);
    return fallback;
  }
  return data;
};

export const saveViveirosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_viveiros_v2', userEmail);
  setStorageData(key, data);

  if (supabase && userId) {
    try {
      const payload = data.map((v) => ({ ...v, user_id: userId }));
      await supabase.from('viveiros').upsert(payload);
    } catch (e) {
      console.warn('Erro ao sincronizar viveiros no Supabase:', e);
    }
  }
};

export const loadPovoamentosForUser = (userEmail) => {
  const isLemeAccount = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const fallback = isLemeAccount ? INITIAL_POVOAMENTOS : [];
  const key = getUserKey('aqua_control_povoamentos_v2', userEmail);
  const data = getStorageData(key, null);
  
  if (!data || !Array.isArray(data)) {
    setStorageData(key, fallback);
    return fallback;
  }
  return data;
};

export const savePovoamentosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_povoamentos_v2', userEmail);
  setStorageData(key, data);

  if (supabase && userId) {
    try {
      const payload = data.map((p) => ({
        id: p.id,
        user_id: userId,
        viveiro_id: p.viveiroId,
        numero_lote: p.numeroLote || 'Lote 01',
        data_povoamento: p.dataPovoamento,
        quantidade: p.quantidade,
        densidade: p.densidade,
        status: p.status,
        data_finalizacao: p.dataFinalizacao || null
      }));
      await supabase.from('povoamentos').upsert(payload);
    } catch (e) {
      console.warn('Erro ao sincronizar povoamentos no Supabase:', e);
    }
  }
};

export const loadParametrosForUser = (userEmail) => {
  const key = getUserKey('aqua_control_parametros_v2', userEmail);
  const data = getStorageData(key, null);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    setStorageData(key, INITIAL_PARAMETERS);
    return INITIAL_PARAMETERS;
  }
  return data;
};

export const saveParametrosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_parametros_v2', userEmail);
  setStorageData(key, data);

  if (supabase && userId) {
    try {
      const payload = data.map((p) => ({
        id: p.id,
        user_id: userId,
        name: p.name,
        unit: p.unit,
        has_min: p.hasMin,
        min: p.min,
        max: p.max,
        is_custom: p.isCustom
      }));
      await supabase.from('parametros').upsert(payload);
    } catch (e) {
      console.warn('Erro ao sincronizar parâmetros no Supabase:', e);
    }
  }
};

export const loadLancamentosForUser = (userEmail) => {
  const isLemeAccount = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const fallback = isLemeAccount ? INITIAL_LANCAMENTOS : [];
  const key = getUserKey('aqua_control_lancamentos_v2', userEmail);
  const data = getStorageData(key, null);

  if (!data || !Array.isArray(data)) {
    setStorageData(key, fallback);
    return fallback;
  }
  return data;
};

export const saveLancamentosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_lancamentos_v2', userEmail);
  setStorageData(key, data);

  if (supabase && userId) {
    try {
      const payload = data.map((l) => ({
        id: l.id,
        user_id: userId,
        viveiro_id: l.viveiroId,
        povoamento_id: l.povoamentoId,
        parameter_id: l.parameterId,
        date: l.date,
        value: l.value
      }));
      await supabase.from('lancamentos').upsert(payload);
    } catch (e) {
      console.warn('Erro ao sincronizar lançamentos no Supabase:', e);
    }
  }
};

// --- BUSCA NA NUVEM FILTRADA PELO USER_ID DO SUPABASE ---
export const fetchAllFromSupabaseForUser = async (userId) => {
  if (!supabase || !userId) return null;
  try {
    const [vivRes, povRes, parRes, lanRes] = await Promise.all([
      supabase.from('viveiros').select('*').eq('user_id', userId),
      supabase.from('povoamentos').select('*').eq('user_id', userId),
      supabase.from('parametros').select('*').eq('user_id', userId),
      supabase.from('lancamentos').select('*').eq('user_id', userId)
    ]);

    return {
      viveiros: vivRes.data && vivRes.data.length > 0 ? vivRes.data : null,
      povoamentos: povRes.data && povRes.data.length > 0 ? povRes.data : null,
      parametros: parRes.data && parRes.data.length > 0 ? parRes.data : null,
      lancamentos: lanRes.data && lanRes.data.length > 0 ? lanRes.data : null
    };
  } catch (e) {
    console.warn('Erro ao buscar dados do usuário no Supabase:', e);
    return null;
  }
};
