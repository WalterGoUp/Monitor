'use client';

import { create } from 'zustand';

export interface Contato {
  id: number;
  nome: string;
  telefone: string;
}

export interface Mensagem {
  id: number;
  remetente: 'cliente' | 'operador' | 'sistema';
  conteudo: string;
  criado_em: string;
}

export interface Atendimento {
  id: number;
  contato: Contato;
  status: 'em_espera' | 'em_atendimento' | 'finalizado';
  mensagens: Mensagem[];
}

interface EstadoAtendimento {
  filaEspera: Atendimento[];
  atendimentoAtivo: Atendimento | null;
  setFilaEspera: (atendimentos: Atendimento[]) => void;
  adicionarAtendimentoFila: (atendimento: Atendimento) => void;
  setAtendimentoAtivo: (atendimento: Atendimento | null) => void;
  adicionarMensagem: (atendimentoId: number, mensagem: Mensagem) => void;
}

export const useEstadoAtendimento = create<EstadoAtendimento>((set) => ({
  filaEspera: [],
  atendimentoAtivo: null,
  
  setFilaEspera: (atendimentos) => set({ filaEspera: atendimentos }),
  
  adicionarAtendimentoFila: (atendimento) => 
    set((state) => ({ filaEspera: [...state.filaEspera, atendimento] })),
    
  setAtendimentoAtivo: (atendimento) => set({ atendimentoAtivo: atendimento }),
  
  adicionarMensagem: (atendimentoId, mensagem) =>
    set((state) => {
      // Atualiza a mensagem se for no atendimento ativo aberto na tela
      if (state.atendimentoAtivo && state.atendimentoAtivo.id === atendimentoId) {
        return {
          atendimentoAtivo: {
            ...state.atendimentoAtivo,
            mensagens: [...state.atendimentoAtivo.mensagens, mensagem],
          },
        };
      }
      return state; 
    }),
}));
