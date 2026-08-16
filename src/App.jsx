import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardModule from './components/DashboardModule';
import LancamentoModule from './components/LancamentoModule';
import ViveirosModule from './components/ViveirosModule';
import PovoamentoModule from './components/PovoamentoModule';
import ParametrosModule from './components/ParametrosModule';
import {
  loadViveiros, saveViveiros,
  loadPovoamentos, savePovoamentos,
  loadParametros, saveParametros,
  loadLancamentos, saveLancamentos,
  fetchAllFromSupabase
} from './utils/storage';
import { INITIAL_LANCAMENTOS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [viveiros, setViveiros] = useState(loadViveiros);
  const [povoamentos, setPovoamentos] = useState(loadPovoamentos);
  const [parametros, setParametros] = useState(loadParametros);
  
  const [lancamentos, setLancamentos] = useState(() => {
    const loaded = loadLancamentos();
    if (!loaded || loaded.length < 50) {
      saveLancamentos(INITIAL_LANCAMENTOS);
      return INITIAL_LANCAMENTOS;
    }
    return loaded;
  });

  // Tentar buscar e sincronizar do Supabase ao iniciar a aplicação
  useEffect(() => {
    async function syncCloudData() {
      const cloud = await fetchAllFromSupabase();
      if (cloud) {
        if (cloud.viveiros && cloud.viveiros.length > 0) {
          setViveiros(cloud.viveiros);
        }
        if (cloud.povoamentos && cloud.povoamentos.length > 0) {
          const mapped = cloud.povoamentos.map((p) => ({
            id: p.id,
            viveiroId: p.viveiro_id,
            numeroLote: p.numero_lote,
            dataPovoamento: p.data_povoamento,
            quantidade: Number(p.quantidade),
            densidade: Number(p.densidade),
            status: p.status,
            dataFinalizacao: p.data_finalizacao
          }));
          setPovoamentos(mapped);
        }
        if (cloud.parametros && cloud.parametros.length > 0) {
          const mapped = cloud.parametros.map((p) => ({
            id: p.id,
            name: p.name,
            unit: p.unit,
            hasMin: p.has_min,
            min: p.min !== null ? Number(p.min) : null,
            max: Number(p.max),
            isCustom: p.is_custom
          }));
          setParametros(mapped);
        }
        if (cloud.lancamentos && cloud.lancamentos.length > 0) {
          const mapped = cloud.lancamentos.map((l) => ({
            id: l.id,
            viveiroId: l.viveiro_id,
            povoamentoId: l.povoamento_id,
            parameterId: l.parameter_id,
            date: l.date,
            value: Number(l.value)
          }));
          setLancamentos(mapped);
        }
      }
    }
    syncCloudData();
  }, []);

  // Sync de Alterações para LocalStorage + Supabase
  useEffect(() => {
    saveViveiros(viveiros);
  }, [viveiros]);

  useEffect(() => {
    savePovoamentos(povoamentos);
  }, [povoamentos]);

  useEffect(() => {
    saveParametros(parametros);
  }, [parametros]);

  useEffect(() => {
    saveLancamentos(lancamentos);
  }, [lancamentos]);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'viveiros' && (
          <ViveirosModule
            viveiros={viveiros}
            setViveiros={setViveiros}
            povoamentos={povoamentos}
          />
        )}

        {activeTab === 'povoamento' && (
          <PovoamentoModule
            viveiros={viveiros}
            povoamentos={povoamentos}
            setPovoamentos={setPovoamentos}
          />
        )}

        {activeTab === 'parametros' && (
          <ParametrosModule
            parametros={parametros}
            setParametros={setParametros}
          />
        )}

        {activeTab === 'lancamento' && (
          <LancamentoModule
            viveiros={viveiros}
            povoamentos={povoamentos}
            parametros={parametros}
            lancamentos={lancamentos}
            setLancamentos={setLancamentos}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardModule
            viveiros={viveiros}
            povoamentos={povoamentos}
            parametros={parametros}
            lancamentos={lancamentos}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>AquaControl - Controle de Qualidade de Água para Fazendas de Camarão</span>
        </div>
      </footer>
    </div>
  );
}
