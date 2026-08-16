import { supabase } from '../lib/supabase';
import {
  INITIAL_PARAMETERS,
  INITIAL_VIVEIROS,
  INITIAL_POVOAMENTOS,
  INITIAL_LANCAMENTOS
} from '../data/initialData';

// Chaves locais por e-mail para resiliência de cache
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

// --- BUSCA NA NUVEM FILTRADA E ISOLADA NO SUPABASE ---
export const fetchAllFromSupabaseForUser = async (userId) => {
  if (!supabase || !userId) return null;
  try {
    const [vivRes, povRes, parRes, lanRes] = await Promise.all([
      supabase.from('viveiros').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('povoamentos').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('parametros').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('lancamentos').select('*').eq('user_id', userId).order('date', { ascending: true })
    ]);

    return {
      viveiros: vivRes.data,
      povoamentos: povRes.data,
      parametros: parRes.data,
      lancamentos: lanRes.data
    };
  } catch (e) {
    console.error('Erro de conexão ao buscar dados no Supabase:', e);
    return null;
  }
};

// --- INICIALIZAÇÃO DE DADOS PARA CONTA MASTER (LEME GESTÃO) ---
export const seedInitialDataForLemeAccount = async (userEmail, userId) => {
  const isLemeAccount = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  
  if (isLemeAccount) {
    // Carregar ou semear dados de demonstração da planilha para a conta master
    const keyViv = getUserKey('aqua_control_viveiros_v3', userEmail);
    const keyPov = getUserKey('aqua_control_povoamentos_v3', userEmail);
    const keyPar = getUserKey('aqua_control_parametros_v3', userEmail);
    const keyLan = getUserKey('aqua_control_lancamentos_v3', userEmail);

    let viv = getStorageData(keyViv, INITIAL_VIVEIROS);
    let pov = getStorageData(keyPov, INITIAL_POVOAMENTOS);
    let par = getStorageData(keyPar, INITIAL_PARAMETERS);
    let lan = getStorageData(keyLan, INITIAL_LANCAMENTOS);

    setStorageData(keyViv, viv);
    setStorageData(keyPov, pov);
    setStorageData(keyPar, par);
    setStorageData(keyLan, lan);

    // Semear no Supabase caso o banco esteja limpo para este user_id
    if (supabase && userId) {
      try {
        const { data: existingViv } = await supabase.from('viveiros').select('id').eq('user_id', userId);
        if (!existingViv || existingViv.length === 0) {
          await supabase.from('viveiros').upsert(viv.map((v) => ({ ...v, user_id: userId })));
          await supabase.from('povoamentos').upsert(
            pov.map((p) => ({
              id: p.id,
              user_id: userId,
              viveiro_id: p.viveiroId,
              numero_lote: p.numeroLote || 'Lote 01',
              data_povoamento: p.dataPovoamento,
              quantidade: p.quantidade,
              densidade: p.densidade,
              status: p.status,
              data_finalizacao: p.dataFinalizacao || null
            }))
          );
          await supabase.from('parametros').upsert(
            par.map((p) => ({
              id: p.id,
              user_id: userId,
              name: p.name,
              unit: p.unit,
              has_min: p.hasMin,
              min: p.min,
              max: p.max,
              is_custom: p.isCustom
            }))
          );
          await supabase.from('lancamentos').upsert(
            lan.map((l) => ({
              id: l.id,
              user_id: userId,
              viveiro_id: l.viveiroId,
              povoamento_id: l.povoamentoId,
              parameter_id: l.parameterId,
              date: l.date,
              value: l.value
            }))
          );
        }
      } catch (err) {
        console.warn('Semeando dados iniciais master no Supabase:', err);
      }
    }

    return { viveiros: viv, povoamentos: pov, parametros: par, lancamentos: lan };
  }

  // Para qualquer outra conta nova externa: Retorna 0 viveiros, 0 povoamentos, 0 lançamentos
  const keyPar = getUserKey('aqua_control_parametros_v3', userEmail);
  const par = getStorageData(keyPar, INITIAL_PARAMETERS);
  setStorageData(keyPar, par);

  return {
    viveiros: [],
    povoamentos: [],
    parametros: par,
    lancamentos: []
  };
};

// --- CARREGADORES LOCAIS ---
export const loadViveirosForUser = (userEmail) => {
  const isLeme = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const key = getUserKey('aqua_control_viveiros_v3', userEmail);
  return getStorageData(key, isLeme ? INITIAL_VIVEIROS : []);
};

export const saveViveirosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_viveiros_v3', userEmail);
  setStorageData(key, data);

  if (supabase && userId) {
    try {
      const payload = data.map((v) => ({ ...v, user_id: userId }));
      await supabase.from('viveiros').upsert(payload);
    } catch (e) {
      console.error('Erro ao salvar viveiro no Supabase:', e);
    }
  }
};

export const loadPovoamentosForUser = (userEmail) => {
  const isLeme = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const key = getUserKey('aqua_control_povoamentos_v3', userEmail);
  return getStorageData(key, isLeme ? INITIAL_POVOAMENTOS : []);
};

export const savePovoamentosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_povoamentos_v3', userEmail);
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
      console.error('Erro ao salvar povoamento no Supabase:', e);
    }
  }
};

export const loadParametrosForUser = (userEmail) => {
  const key = getUserKey('aqua_control_parametros_v3', userEmail);
  return getStorageData(key, INITIAL_PARAMETERS);
};

export const saveParametrosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_parametros_v3', userEmail);
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
      console.error('Erro ao salvar parâmetro no Supabase:', e);
    }
  }
};

export const loadLancamentosForUser = (userEmail) => {
  const isLeme = userEmail?.toLowerCase() === 'contatolemegestao@gmail.com';
  const key = getUserKey('aqua_control_lancamentos_v3', userEmail);
  return getStorageData(key, isLeme ? INITIAL_LANCAMENTOS : []);
};

export const saveLancamentosForUser = async (userEmail, data, userId) => {
  const key = getUserKey('aqua_control_lancamentos_v3', userEmail);
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
      console.error('Erro ao salvar lançamento no Supabase:', e);
    }
  }
};
