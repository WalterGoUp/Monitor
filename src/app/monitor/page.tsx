'use client';

import { useConexaoSocket } from '@/ganchos/useConexaoSocket';
import { useEstadoAtendimento } from '@/estado/useEstadoAtendimento';
import { Clock, Users, Activity, BarChart3 } from 'lucide-react';

export default function PainelMonitorTV() {
  useConexaoSocket();
  const { filaEspera } = useEstadoAtendimento();

  // Data atual formatada
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-12 flex flex-col font-sans overflow-hidden">
      
      {/* Cabeçalho de Alto Impacto */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Monitor GoUP</h1>
            <p className="text-slate-500 font-medium tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" />
              CENTRAL DE ATENDIMENTO • TEMPO REAL
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-200 capitalize">{dataHoje}</div>
          <p className="text-indigo-400 font-bold tracking-[0.2em] mt-1">EM OPERAÇÃO</p>
        </div>
      </header>

      {/* Grid Principal de Métricas */}
      <div className="grid grid-cols-2 gap-12 flex-1">
        
        {/* Card: Em Espera - Foco Máximo */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-red-500/20 rounded-[40px] h-full flex flex-col items-center justify-center p-12 shadow-2xl">
            <div className="absolute top-8 right-8 text-red-500/20">
              <Clock size={80} />
            </div>
            <h2 className="text-4xl text-slate-400 mb-8 uppercase tracking-[0.3em] font-light">Em Espera</h2>
            <div className="relative">
              <span className="text-[18rem] font-black text-red-500 leading-none drop-shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                {filaEspera.length}
              </span>
            </div>
            <div className="mt-8 px-8 py-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-400 font-bold text-xl uppercase tracking-widest">
              ATENDER IMEDIATAMENTE
            </div>
          </div>
        </div>

        {/* Card: Em Atendimento (Exemplo estático + Placeholder dinâmico) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-emerald-500/20 rounded-[40px] h-full flex flex-col items-center justify-center p-12 shadow-2xl">
            <div className="absolute top-8 right-8 text-emerald-500/20">
              <Users size={80} />
            </div>
            <h2 className="text-4xl text-slate-400 mb-8 uppercase tracking-[0.3em] font-light">Em Atendimento</h2>
            <div className="relative">
              <span className="text-[18rem] font-black text-emerald-500 leading-none drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                {/* Aqui pode ser mapeado do backend via store futuramente */}
                0
              </span>
            </div>
            <div className="mt-8 px-8 py-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 font-bold text-xl uppercase tracking-widest">
              OPERADORES ATIVOS
            </div>
          </div>
        </div>
      </div>
      
      {/* Rodapé Dinâmico */}
      <footer className="mt-16 flex justify-between items-center text-slate-500 text-xl font-medium border-t border-slate-800/50 pt-10">
        <div className="flex items-center gap-10">
          <span className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            Sincronizado com WhatsApp
          </span>
          <span className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            Servidor Estável
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="text-slate-600 italic">V 1.0.0</span>
          <span>•</span>
          <span className="font-bold tracking-tighter">Powered by GoUP Intelligence</span>
        </div>
      </footer>

      {/* Barra de Progresso Sugerida (Opcional) */}
      <div className="fixed bottom-0 left-0 h-1 bg-indigo-600 w-full animate-pulse shadow-[0_-10px_20px_rgba(79,70,229,0.4)]" />
    </div>
  );
}
