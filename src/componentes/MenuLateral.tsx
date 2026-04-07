'use client';

import React from 'react';
import { MessageSquare, Users, Settings, LogOut, LayoutDashboard } from 'lucide-react';

export type AbaNavegacao = 'CHAT' | 'CADASTROS' | 'CONFIGURACOES';

interface MenuLateralProps {
  abaAtiva: AbaNavegacao;
  onTrocarAba: (aba: AbaNavegacao) => void;
  onSair: () => void;
}

export const MenuLateral: React.FC<MenuLateralProps> = ({ abaAtiva, onTrocarAba, onSair }) => {
  const itensMenu = [
    { id: 'CHAT' as AbaNavegacao, icone: MessageSquare, label: 'Chat' },
    { id: 'CADASTROS' as AbaNavegacao, icone: Users, label: 'Cadastros' },
    { id: 'CONFIGURACOES' as AbaNavegacao, icone: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-[80px] bg-[var(--sidebar-bg)] border-r border-[var(--card-border)] flex flex-col items-center py-8 justify-between backdrop-blur-xl transition-colors duration-300">
      <div className="flex flex-col items-center gap-10 w-full">
        {/* LOGO SIMPLIFICADO */}
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform cursor-pointer">
          G
        </div>

        {/* ITENS DE NAVEGAÇÃO */}
        <nav className="flex flex-col gap-4 w-full px-2">
          {itensMenu.map((item) => {
            const Icone = item.icone;
            const ativo = abaAtiva === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTrocarAba(item.id)}
                title={item.label}
                className={`relative group w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  ativo 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'text-[var(--muted-text)] hover:text-indigo-500 hover:bg-indigo-500/10'
                }`}
              >
                <Icone size={24} />
                
                {/* TOOLTIP ON HOVER */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-[var(--card-border)] font-medium z-50 shadow-2xl">
                  {item.label}
                </div>

                {/* INDICADOR LATERAL */}
                {ativo && (
                  <div className="absolute -left-2 w-1 h-8 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTÃO DE SAIR */}
      <div className="w-full px-2 text-center">
        <button
          onClick={onSair}
          title="Sair"
          className="w-full aspect-square rounded-2xl flex items-center justify-center text-[var(--muted-text)] hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group relative"
        >
          <LogOut size={24} />
          <div className="absolute left-full ml-4 px-3 py-1 bg-[var(--background)] text-[var(--foreground)] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-[var(--card-border)] font-medium z-50 shadow-2xl">
            Sair do Sistema
          </div>
        </button>
      </div>
    </aside>
  );
};
