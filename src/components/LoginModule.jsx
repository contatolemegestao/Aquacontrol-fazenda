import React, { useState } from 'react';
import { Waves, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginModule({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('contatolemegestao@gmail.com');
  const [password, setPassword] = useState('lemegestao2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Preencha o e-mail e a senha.');
      setLoading(false);
      return;
    }

    try {
      if (supabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim()
          });

          if (error) {
            throw error;
          }

          if (data?.user) {
            setSuccessMsg('Conta criada com sucesso! Você já pode fazer login.');
            setIsSignUp(false);
          }
        } else {
          // Fazer Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
          });

          if (error) {
            // Se o usuário ainda não existir no Supabase, tenta criar automaticamente para o email da Leme Gestao
            if (email.trim().toLowerCase() === 'contatolemegestao@gmail.com') {
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim()
              });

              if (!signUpError && signUpData?.user) {
                // Tenta login novamente
                const { data: retryData } = await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password: password.trim()
                });
                if (retryData?.session) {
                  onLoginSuccess(retryData.session.user);
                  return;
                }
              }
            }
            throw error;
          }

          if (data?.session) {
            onLoginSuccess(data.session.user);
            return;
          }
        }
      } else {
        // Fallback local caso Supabase não esteja conectado
        onLoginSuccess({
          id: 'user-demo-leme',
          email: email.trim()
        });
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErrorMsg(
        err.message || 'Falha ao autenticar. Verifique suas credenciais e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('contatolemegestao@gmail.com');
    setPassword('lemegestao2026');
    setErrorMsg('');
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

          {/* Badge Conta Padrão */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-brand-900 font-medium">Acesso Padrão Configurado</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-brand-600 font-bold hover:underline"
            >
              Preencher
            </button>
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

          {/* Formulário */}
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
              <span>{loading ? 'Autenticando...' : isSignUp ? 'Criar Nova Conta' : 'Entrar no Sistema'}</span>
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
