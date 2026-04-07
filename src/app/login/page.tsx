'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function TelaLogin() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const lidarComLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    
    // Autenticação com usuário Master solicitado
    if (email === 'GOUP' && senha === 'GOUP226457') {
      setTimeout(() => {
        setCarregando(false);
        localStorage.setItem('token_atendimento', 'sessao_ativa');
        router.push('/');
      }, 1500);
    } else {
      setTimeout(() => {
        setCarregando(false);
        alert('Usuário ou Senha incorretos');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
      
      {/* Decoração de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="glass-card p-8 md:p-10">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6 shadow-xl shadow-indigo-600/20">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Monitor GoUP</h1>
            <p className="text-slate-400">Entre para gerenciar seus atendimentos</p>
          </header>

          <form onSubmit={lidarComLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Usuário</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="DIGITE SEU USUÁRIO"
                  className="input-premium pl-12 uppercase"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="input-premium pl-12 uppercase"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={carregando}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
            >
              {carregando ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Problemas no acesso? <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Contate o suporte</a>
            </p>
          </footer>
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-xs tracking-widest uppercase">
          &copy; 2026 Monitor GoUP - Sistema de Atendimento
        </p>
      </div>
    </div>
  );
}
