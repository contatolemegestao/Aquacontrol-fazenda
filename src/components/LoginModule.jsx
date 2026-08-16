import React, { useState } from 'react';
import { Waves, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginModule({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Preencha o e-mail e a senha.');
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setErrorMsg('Serviço de autenticação temporariamente indisponível.');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Criar Nova Conta no Supabase Auth com URL de redirecionamento para o AquaControl na Vercel
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: 'https://aquacontrol-fazenda.vercel.app/'
          }
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          if (data.session) {
            onLoginSuccess(data.user);
            return;
          }
          setSuccessMsg('Conta criada com sucesso! Acesse o e-mail cadastrado e clique no link de confirmação para ativar seu acesso.');
          setIsSignUp(false);
          return;
        }
      } else {
        // Fazer Login estritamente no Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (error) {
          throw error;
        }

        if (data?.session && data?.user) {
          onLoginSuccess(data.user);
          return;
        }
      }
    } catch (err) {
      console.error('Erro de Autenticação Supabase:', err);
      let translated = err.message || 'Falha ao autenticar.';
      if (translated.includes('Invalid login credentials')) {
        translated = 'E-mail ou senha incorretos.';
      } else if (translated.includes('User already registered')) {
        translated = 'Este e-mail já está cadastrado. Faça login.';
      } else if (translated.includes('Password should be at least')) {
        translated = 'A senha deve ter no mínimo 6 caracteres.';
      } else if (translated.includes('Email not confirmed')) {
        translated = 'Seu e-mail ainda não foi confirmado. Acesse sua caixa de entrada (ou spam) e clique no link de ativação.';
      }
      setErrorMsg(translated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Card Principal */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Waves className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Aqua<span className="text-brand-500">Control</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gestão de Qualidade de Água para Fazendas de Camarão
            </p>
          </div>

          {/* Mensagens de Alerta / Sucesso */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulário Estrito */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 mt-2"
            >
              <span>{loading ? 'Verificando...' : isSignUp ? 'Criar Nova Conta' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Alternar entre Login e Criar Conta */}
          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
            {isSignUp ? (
              <p>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                  }}
                  className="text-brand-600 font-bold hover:underline ml-1"
                >
                  Fazer Login
                </button>
              </p>
            ) : (
              <p>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                  }}
                  className="text-brand-600 font-bold hover:underline ml-1"
                >
                  Criar Conta
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer no Login */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          AquaControl &copy; 2026 • Leme Gestão
        </p>
      </div>
    </div>
  );
}
