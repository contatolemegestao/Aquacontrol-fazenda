import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModule from './components/LoginModule';
import DashboardModule from './components/DashboardModule';
import LancamentoModule from './components/LancamentoModule';
import ViveirosModule from './components/ViveirosModule';
import PovoamentoModule from './components/PovoamentoModule';
import ParametrosModule from './components/ParametrosModule';
import { supabase } from './lib/supabase';
import {
  loadViveirosForUser, saveViveirosForUser,
  loadPovoamentosForUser, savePovoamentosForUser,
  loadParametrosForUser, saveParametrosForUser,
  loadLancamentosForUser, saveLancamentosForUser,
  fetchAllFromSupabaseForUser,
  seedInitialDataForLemeAccount
} from './utils/storage';
import { INITIAL_PARAMETERS } from './data/initialData';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('viveiros');

  const [viveiros, setViveiros] = useState([]);
  const [povoamentos, setPovoamentos] = useState([]);
  const [parametros, setParametros] = useState(INITIAL_PARAMETERS);
  const [lancamentos, setLancamentos] = useState([]);

  // 1. Escuta de Autenticação Supabase Auth
  useEffect(() => {
    async function checkAuthSession() {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setUser(data.session.user);
          }
        } catch (e) {
          console.warn('Erro ao verificar sessão do Supabase:', e);
        }
      }
      setAuthChecking(false);
    }
    checkAuthSession();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
        }
      );
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // 2. Carregar dados isolados quando o usuário loga
  useEffect(() => {
    if (!user) return;

    const email = user.email || '';
    const userId = user.id || '';

    async function loadUserData() {
      // 1. Carregar local primeiro (rápido e offline)
      const localViv = loadViveirosForUser(email);
      const localPov = loadPovoamentosForUser(email);
      const localPar = loadParametrosForUser(email);
      const localLan = loadLancamentosForUser(email);

      setViveiros(localViv);
      setPovoamentos(localPov);
      setParametros(localPar);
      setLancamentos(localLan);

      // Ajustar aba inicial de acordo com o usuário
      if (localViv.length === 0) {
        setActiveTab('viveiros');
      } else {
        setActiveTab('dashboard');
      }

      // 2. Tentar buscar dados na nuvem Supabase especificamente para este user_id
      const cloud = await fetchAllFromSupabaseForUser(userId);
      if (cloud && (cloud.viveiros || cloud.povoamentos || cloud.parametros || cloud.lancamentos)) {
        if (cloud.viveiros) {
          setViveiros(cloud.viveiros);
        }
        if (cloud.povoamentos) {
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
        if (cloud.parametros) {
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
        if (cloud.lancamentos) {
          const mapped = cloud.lancamentos.map((l) => ({
            id: l.id,
            viveiroId: l.viveiro_id,
            povoamentoId: l.povoamento_id,
            parameterId: l.parameter_id,
            date: l.date,
            time: l.time || '',
            value: Number(l.value)
          }));
          setLancamentos(mapped);
        }
      } else if (email.toLowerCase() === 'contatolemegestao@gmail.com') {
        // Se for a conta da Leme Gestao e o banco Supabase estiver vazio, semeia a planilha
        const seeded = await seedInitialDataForLemeAccount(email, userId);
        setViveiros(seeded.viveiros);
        setPovoamentos(seeded.povoamentos);
        setParametros(seeded.parametros);
        setLancamentos(seeded.lancamentos);
      }
    }

    loadUserData();
  }, [user]);

  // 3. Salvar alterações isoladas por usuário
  useEffect(() => {
    if (user) {
      saveViveirosForUser(user.email, viveiros, user.id);
    }
  }, [viveiros, user]);

  useEffect(() => {
    if (user) {
      savePovoamentosForUser(user.email, povoamentos, user.id);
    }
  }, [povoamentos, user]);

  useEffect(() => {
    if (user) {
      saveParametrosForUser(user.email, parametros, user.id);
    }
  }, [parametros, user]);

  useEffect(() => {
    if (user) {
      saveLancamentosForUser(user.email, lancamentos, user.id);
    }
  }, [lancamentos, user]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  // Carregando Inicial
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Carregando AquaControl...</p>
        </div>
      </div>
    );
  }

  // Se NÃO estiver logado, exibe Tela de Login
  if (!user) {
    return <LoginModule onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navbar com Usuário e Logout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

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
