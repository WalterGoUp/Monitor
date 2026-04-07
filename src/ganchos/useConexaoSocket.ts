'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useEstadoAtendimento } from '../estado/useEstadoAtendimento';

// URL do seu backend Node.js (ajuste para a URL da VPS em produção)
const URL_SOCKET = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useConexaoSocket = () => {
  const { adicionarAtendimentoFila, adicionarMensagem } = useEstadoAtendimento();

  useEffect(() => {
    const socket = io(URL_SOCKET, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Conectado ao motor de atendimento:', socket.id);
    });

    // Evento: Cliente mandou mensagem e não tinha atendimento aberto
    socket.on('novo_chamado', (novoAtendimento) => {
      adicionarAtendimentoFila(novoAtendimento);
    });

    // Evento: Cliente mandou mensagem em um atendimento já existente
    socket.on('nova_mensagem', ({ chamadoId, mensagem }) => {
      adicionarMensagem(chamadoId, mensagem);
    });

    return () => {
      socket.disconnect();
    };
  }, [adicionarAtendimentoFila, adicionarMensagem]);
};
