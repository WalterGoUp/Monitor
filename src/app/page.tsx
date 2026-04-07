'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConexaoSocket } from '@/ganchos/useConexaoSocket';
import { useEstadoAtendimento } from '@/estado/useEstadoAtendimento';
import { MenuLateral, AbaNavegacao } from '@/componentes/MenuLateral';
import { MessageCircle, User, Send, LogOut, Clock, Search, MoreVertical, LayoutGrid, Cog, MessageSquare, Activity } from 'lucide-react';

export default function DashboardOperador() {
  const router = useRouter();
  // Inicializa a escuta do WebSocket
  useConexaoSocket(); 
  
  const { filaEspera, atendimentoAtivo, setAtendimentoAtivo } = useEstadoAtendimento();
  const [mensagemInput, setMensagemInput] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('CHAT');
  const [subAbaCadastro, setSubAbaCadastro] = useState<'MENU' | 'OPERADORES' | 'SETORES' | 'RESPOSTAS'>('MENU');

  // Estados para as Respostas Rápidas (Mensagens do Sistema)
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState(`Olá, {{nome_cliente}}, Seja Bem-Vindo(a) a {{nome_empresa}}.\n✅protocolo de atendimento: *#{{protocolo}}*\nAbertura: *{{data_abertura}}*`);
  
  const [mensagemFinalizacao, setMensagemFinalizacao] = useState(`Agradecemos o seu contato!\n\n*Pedimos por gentileza que não responda essa mensagem.*\n\nPois esse atendimento foi concluído e qualquer nova mensagem abrirá um novo atendimento.\n\nMas lembramos que qualquer dúvida estamos sempre á disposição. Conte com a gente.\n\nAtendimento Finalizado!\nProtocolo de atendimento *#{{protocolo}}*`);
  
  const [mensagemTransferencia, setMensagemTransferencia] = useState(`Atendimento atribuído ao atendente {{nome_atendente}}`);
  
  const [mostrarTransferencia, setMostrarTransferencia] = useState(true);

  // Configurações Globais
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(true);

  // WhatsApp Meta Cloud API
  const [whatsappPhoneId, setWhatsappPhoneId] = useState('');
  const [whatsappWabaId, setWhatsappWabaId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');

  // Estados do Chat e Sidebar
  const [abaSidebarChat, setAbaSidebarChat] = useState<'ATENDENDO' | 'ESPERA' | 'CONTATOS'>('ESPERA');
  const [termoBuscaAgenda, setTermoBuscaAgenda] = useState('');
  const [clientesAtendendo, setClientesAtendendo] = useState<{ id: number; nome: string; ultimaMensagem: string; hora: string; unread?: number }[]>([]);
  const [contatosAgenda, setContatosAgenda] = useState<{ id: number; nome: string; celular: string }[]>([]);

  // Dados mock para operadores e setores
  const [operadores, setOperadores] = useState<{ id: number; nome: string; login: string; celular: string; status: string }[]>([]);
  const [setores, setSetores] = useState<{ id: number; descricao: string; status: string }[]>([]);

  const [modalOperador, setModalOperador] = useState(false);
  const [modalSetor, setModalSetor] = useState(false);

  const [novoOperador, setNovoOperador] = useState({
    nome: '', login: '', senha: '', celular: '', status: 'ATIVO'
  });

  const [novoSetor, setNovoSetor] = useState({
    descricao: '', status: 'ATIVO'
  });

  // Verificação de autenticação mock
  useEffect(() => {
    const token = localStorage.getItem('token_atendimento');
    if (!token) {
      router.push('/login');
    } else {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza configurações com LocalStorage
  useEffect(() => {
    const configTema = localStorage.getItem('goup_tema');
    const configSom = localStorage.getItem('goup_som');
    
    if (configTema !== null) setTemaEscuro(configTema === 'dark');
    if (configSom !== null) setNotificacaoAtiva(configSom === 'true');

    // Carrega credenciais WhatsApp
    setWhatsappPhoneId(localStorage.getItem('goup_wa_phone') || '');
    setWhatsappWabaId(localStorage.getItem('goup_wa_waba') || '');
    setWhatsappToken(localStorage.getItem('goup_wa_token') || '');
  }, []);

  const alternarTema = (dark: boolean) => {
    setTemaEscuro(dark);
    localStorage.setItem('goup_tema', dark ? 'dark' : 'light');
  };

  const alternarSom = (ativo: boolean) => {
    setNotificacaoAtiva(ativo);
    localStorage.setItem('goup_som', String(ativo));
  };

  const salvarWhatsApp = () => {
    localStorage.setItem('goup_wa_phone', whatsappPhoneId);
    localStorage.setItem('goup_wa_waba', whatsappWabaId);
    localStorage.setItem('goup_wa_token', whatsappToken);
    alert('Configurações do WhatsApp salvas com sucesso!');
  };

  // Função para testar som (Gera um chime via Web Audio API)
  const testarSom = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, context.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.5); // A4
    
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.5);
  };

  const sair = () => {
    localStorage.removeItem('token_atendimento');
    router.push('/login');
  };

  const enviarMensagem = () => {
    if (!mensagemInput.trim() || !atendimentoAtivo) return;
    
    // Aqui entraria o axios.post() para o backend
    console.log('Enviando para o backend:', mensagemInput);
    
    // Limpa o input
    setMensagemInput('');
  };

  const aceitarAtendimento = (cliente: any) => {
    const novoAtendido = {
      id: cliente.id,
      contato: {
        nome: cliente.contato.nome,
        telefone: cliente.contato.telefone
      },
      status: 'ATENDENDO',
      mensagens: []
    };
    
    setClientesAtendendo(prev => [...prev, {
       id: novoAtendido.id,
       nome: novoAtendido.contato.nome,
       ultimaMensagem: 'Atendimento iniciado',
       hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setAtendimentoAtivo(novoAtendido as any);
    setAbaSidebarChat('ATENDENDO');
  };

  const finalizarAtendimento = () => {
    if (!atendimentoAtivo) return;
    setClientesAtendendo(prev => prev.filter(c => c.id !== atendimentoAtivo.id));
    setAtendimentoAtivo(null);
  };

  const selecionarChat = (chat: any) => {
    // Se vier da lista formatada do tecnico, precisamos garantir que o setAtendimentoAtivo receba o objeto completo ou mockado
    const atendimentoFull = {
      id: chat.id,
      contato: { nome: chat.nome, telefone: chat.telefone || '' },
      status: 'ATENDENDO',
      mensagens: []
    };
    setAtendimentoAtivo(atendimentoFull as any);
  };

  const IniciarChatContato = (contato: any) => {
    const chatNovo = {
      id: contato.id,
      contato: {
        nome: contato.nome,
        telefone: contato.celular
      },
      status: 'ATENDENDO',
      mensagens: []
    };
    
    setClientesAtendendo(prev => [...prev, {
        id: chatNovo.id,
        nome: chatNovo.contato.nome,
        ultimaMensagem: 'Iniciando conversa...',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setAtendimentoAtivo(chatNovo as any);
    setAbaSidebarChat('ATENDENDO');
  };

  // Função para aplicar máscara de celular
  const aplicarMascaraCelular = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    return v;
  };

  if (carregando) return null;

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${temaEscuro ? '' : 'light-mode'}`}>
      
      {/* MENU LATERAL GLOBAL */}
      <MenuLateral 
        abaAtiva={abaAtiva} 
        onTrocarAba={setAbaAtiva} 
        onSair={sair} 
      />

      {/* CONTEÚDO PRINCIPAL (DINÂMICO) */}
      <div className="flex-1 flex overflow-hidden">
        
        {abaAtiva === 'CHAT' && (
          <>
            {/* Coluna 1: Fila de Espera (Sidebar do Chat) */}
            <aside className="w-[380px] flex flex-col border-r border-[var(--card-border)] bg-[var(--sidebar-bg)] backdrop-blur-md">
              
              {/* TABS DE SELEÇÃO DA SIDEBAR */}
              <div className="p-3 bg-[var(--header-bg)] flex gap-1 border-b border-[var(--card-border)]">
                {[
                   { id: 'ATENDENDO', label: 'Atendendo', color: 'indigo', count: clientesAtendendo.length },
                   { id: 'ESPERA', label: 'Espera', color: 'rose', count: filaEspera.length },
                   { id: 'CONTATOS', label: 'Contatos', color: 'amber', count: contatosAgenda.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAbaSidebarChat(tab.id as any)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex flex-col items-center gap-1 border ${
                      abaSidebarChat === tab.id 
                        ? 'bg-[var(--card-bg)] border-[var(--card-border)] text-white shadow-lg' 
                        : 'border-transparent text-[var(--muted-text)] hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                        tab.id === 'ESPERA' ? 'bg-rose-500 text-white animate-pulse' : 
                        tab.id === 'ATENDENDO' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {abaSidebarChat === tab.id && (
                      <div className={`absolute bottom-0 w-8 h-1 rounded-full ${
                        tab.id === 'ESPERA' ? 'bg-rose-500' : 
                        tab.id === 'ATENDENDO' ? 'bg-indigo-500' : 'bg-amber-500'
                      }`} />
                    )}
                  </button>
                ))}
              </div>

              {/* CONTEÚDO LISTAGEM SIDEBAR */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                
                {/* BUSCA DE CONTATOS (SÓ APARECE NA ABA CONTATOS) */}
                {abaSidebarChat === 'CONTATOS' && (
                  <div className="mb-6 relative">
                    <input 
                      type="text" 
                      className="input-premium pl-10 text-xs py-2 h-10" 
                      placeholder="Buscar por nome ou celular..."
                      value={termoBuscaAgenda}
                      onChange={(e) => setTermoBuscaAgenda(e.target.value.toUpperCase())}
                    />
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                )}

                {/* LISTA: EM ATENDIMENTO */}
                {abaSidebarChat === 'ATENDENDO' && (
                  <div className="space-y-2">
                    {clientesAtendendo.map((cliente) => (
                      <div 
                        key={cliente.id}
                        onClick={() => selecionarChat(cliente)}
                        className={`glass-card p-4 cursor-pointer hover:bg-white/5 transition-all relative group ${atendimentoAtivo?.id === cliente.id ? 'border-indigo-500/50 bg-indigo-500/5 shadow-indigo-500/10 shadow-lg' : 'border-[var(--card-border)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold ring-2 ring-indigo-500/20 shadow-lg">
                            {cliente.nome.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-[var(--foreground)] uppercase truncate">{cliente.nome}</h4>
                            <p className="text-[10px] text-[var(--muted-text)] truncate">{cliente.ultimaMensagem}</p>
                          </div>
                          <span className="text-[9px] text-slate-600 font-mono italic">{cliente.hora}</span>
                        </div>
                      </div>
                    ))}
                    {clientesAtendendo.length === 0 && (
                      <div className="py-20 text-center space-y-3 opacity-30">
                        <MessageSquare size={32} className="mx-auto text-slate-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Nenhum chat seu aberto</p>
                      </div>
                    )}
                  </div>
                )}

                {/* LISTA: FILA DE ESPERA */}
                {abaSidebarChat === 'ESPERA' && (
                  <div className="space-y-3">
                    {filaEspera.map((cliente) => (
                      <div 
                        key={cliente.id}
                        className="glass-card p-4 border-rose-500/10 hover:border-rose-500/30 transition-all bg-rose-500/5 relative overflow-hidden group"
                      >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                            {cliente.contato.nome.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-[var(--foreground)] uppercase">{cliente.contato.nome}</h4>
                            </div>
                            <p className="text-[10px] text-rose-300 font-medium truncate mt-0.5">{cliente.mensagens[0]?.conteudo || 'Nova interação'}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                           <button 
                            onClick={(e) => { e.stopPropagation(); aceitarAtendimento(cliente); }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg text-white shadow-lg shadow-emerald-600/20 flex-1 transition-all active:scale-95"
                           >
                             ACEITAR
                           </button>
                           <button className="bg-slate-800/40 hover:bg-slate-800 text-[9px] text-[var(--muted-text)] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex-1 transition-all">
                             RECUSAR
                           </button>
                        </div>
                      </div>
                    ))}
                    {filaEspera.length === 0 && (
                      <div className="py-20 text-center space-y-3 opacity-30">
                        <Activity size={32} className="mx-auto text-slate-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fila Limpa</p>
                      </div>
                    )}
                  </div>
                )}

                {/* LISTA: CONTATOS / AGENDA */}
                {abaSidebarChat === 'CONTATOS' && (
                  <div className="space-y-2">
                    {contatosAgenda
                      .filter(c => c.nome.includes(termoBuscaAgenda.toUpperCase()) || c.celular.includes(termoBuscaAgenda))
                      .map((contato) => (
                      <div 
                        key={contato.id}
                        className="glass-card p-4 border-[var(--card-border)] hover:border-amber-500/30 group transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 group-hover:bg-amber-500/10 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-amber-500 font-bold transition-colors">
                              {contato.nome.charAt(0)}
                            </div>
                            <div>
                               <h4 className="font-bold text-xs text-slate-300 group-hover:text-[var(--foreground)] uppercase transition-colors">{contato.nome}</h4>
                               <p className="text-[10px] text-[var(--muted-text)] font-mono tracking-tighter">{contato.celular}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => IniciarChatContato(contato)}
                            className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/10"
                            title="Iniciar Conversa"
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Coluna 2 e 3: Área de Chat Principal */}
            <main className="flex-1 flex flex-col relative">
              {atendimentoAtivo ? (
                <>
                  {/* Cabeçalho do Chat */}
                  <header className="h-[80px] px-8 border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden ring-2 ring-slate-800/50">
                          <User size={24} />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                      </div>
                      <div>
                        <h2 className="font-bold text-[var(--foreground)] text-lg leading-tight uppercase tracking-tight">{atendimentoAtivo.contato.nome}</h2>
                        <p className="text-xs text-[var(--muted-text)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          WhatsApp • {atendimentoAtivo.contato.telefone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                        onClick={finalizarAtendimento}
                        className="bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                       >
                         Finalizar Chat
                       </button>
                    </div>
                  </header>

                  {/* Histórico de Mensagens */}
                  <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    {atendimentoAtivo.mensagens.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex flex-col max-w-[65%] ${
                          msg.remetente === 'operador' ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div 
                          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.remetente === 'operador' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none'
                          }`}
                        >
                          {msg.conteudo}
                        </div>
                        <span className="text-[10px] text-slate-600 mt-2 px-1 font-medium">
                          {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Area de Input de Envio */}
                  <div className="p-6 bg-[var(--header-bg)] backdrop-blur-md border-t border-[var(--card-border)]">
                    <div className="max-w-4xl mx-auto flex gap-4 items-end bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--card-border)]">
                      <textarea 
                        rows={1}
                        placeholder="Digite sua resposta..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 py-3 px-4 resize-none transition-all placeholder-slate-500 overflow-hidden"
                        value={mensagemInput}
                        onChange={(e) => setMensagemInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            enviarMensagem();
                          }
                        }}
                      />
                      <button 
                        onClick={enviarMensagem}
                        disabled={!mensagemInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-slate-900/50 rounded-[40px] flex items-center justify-center text-slate-800 mb-8 border border-slate-800/40">
                    <MessageCircle size={48} className="animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-300 mb-2">Seu terminal está pronto</h2>
                  <p className="text-slate-500 max-w-sm">Selecione um cliente na lista à esquerda para iniciar o atendimento em tempo real.</p>
                </div>
              )}
            </main>
          </>
        )}

        {abaAtiva === 'CADASTROS' && (
          <div className="flex-1 flex flex-col p-10 bg-slate-950 overflow-y-auto">
            
            {/* MENU DE CADASTROS */}
            {subAbaCadastro === 'MENU' && (
              <>
                <header className="mb-10">
                  <h1 className="text-3xl font-bold text-white mb-2">Cadastros</h1>
                  <p className="text-slate-500">Gerencie os principais módulos do sistema.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => setSubAbaCadastro('OPERADORES')}
                    className="glass-card p-6 border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                      <User size={24} className="text-indigo-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Operadores</h3>
                    <p className="text-sm text-slate-500 italic">Gestão de acessos e perfis da equipe.</p>
                  </div>

                  <div 
                    onClick={() => setSubAbaCadastro('SETORES')}
                    className="glass-card p-6 border-emerald-500/10 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                      <LayoutGrid size={24} className="text-emerald-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Setores</h3>
                    <p className="text-sm text-slate-500 italic">Definição dos departamentos de suporte.</p>
                  </div>

                  <div 
                    onClick={() => setSubAbaCadastro('RESPOSTAS')}
                    className="glass-card p-6 border-indigo-500/10 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                      <MessageCircle size={24} className="text-indigo-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Respostas Rápidas</h3>
                    <p className="text-sm text-slate-500 italic">Modelos de mensagens automáticas do sistema.</p>
                  </div>

                  {['Clientes', 'Empresas'].map((tipo) => (
                    <div key={tipo} className="glass-card p-6 opacity-60 hover:opacity-100 transition-all cursor-not-allowed group border-slate-800">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                        <LayoutGrid size={24} className="text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-400 mb-2">{tipo}</h3>
                      <p className="text-sm text-slate-600">Módulo em desenvolvimento.</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* GESTÃO DE OPERADORES */}
            {subAbaCadastro === 'OPERADORES' && (
              <div className="h-full flex flex-col">
                <header className="flex justify-between items-center mb-8">
                  <div>
                    <button 
                      onClick={() => setSubAbaCadastro('MENU')}
                      className="text-indigo-400 text-sm mb-2 flex items-center gap-1 hover:underline text-left"
                    >
                      &larr; Voltar aos Cadastros
                    </button>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Gestão de Operadores</h1>
                  </div>
                  <button 
                    onClick={() => setModalOperador(true)}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    Novo Operador
                  </button>
                </header>

                <div className="glass-card overflow-hidden border-[var(--card-border)]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--header-bg)] text-[var(--muted-text)] text-xs uppercase tracking-widest border-b border-[var(--card-border)]">
                      <tr>
                        <th className="p-4 font-semibold">Nome</th>
                        <th className="p-4 font-semibold">Login / E-mail</th>
                        <th className="p-4 font-semibold">Celular</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {operadores.map((op) => (
                        <tr key={op.id} className="hover:bg-indigo-500/5 transition-colors group">
                          <td className="p-4 font-medium text-slate-100 uppercase">{op.nome}</td>
                          <td className="p-4 text-sm text-slate-400 font-mono tracking-tighter italic">{op.login}</td>
                          <td className="p-4 text-sm text-slate-300">{op.celular}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset ${
                              op.status === 'ATIVO' 
                                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 ring-red-500/20'
                            }`}>
                              {op.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-indigo-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {operadores.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-600 italic">
                            Nenhum operador cadastrado para o monitoramento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MODAL DE CADASTRO */}
                {modalOperador && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="glass-card w-full max-w-xl p-8 relative animate-in fade-in zoom-in duration-300">
                      <header className="mb-8 border-b border-slate-800 pb-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                          <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                          Cadastro de Operador
                        </h2>
                      </header>

                      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">NOME COMPLETO</label>
                            <input 
                              type="text" 
                              className="input-premium uppercase" 
                              placeholder="EX: JOÃO DA SILVA" 
                              value={novoOperador.nome}
                              onChange={(e) => setNovoOperador({...novoOperador, nome: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">CELULAR</label>
                            <input 
                              type="text" 
                              className="input-premium" 
                              placeholder="(99) 99999-9999" 
                              value={novoOperador.celular}
                              onChange={(e) => setNovoOperador({...novoOperador, celular: aplicarMascaraCelular(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">LOGIN (E-MAIL)</label>
                          <input 
                            type="email" 
                            className="input-premium font-mono italic" 
                            placeholder="OPERADOR@SISTEMA.COM" 
                            value={novoOperador.login}
                            onChange={(e) => setNovoOperador({...novoOperador, login: e.target.value.toUpperCase()})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">SENHA</label>
                            <input 
                              type="password" 
                              className="input-premium uppercase" 
                              placeholder="••••••••" 
                              value={novoOperador.senha}
                              onChange={(e) => setNovoOperador({...novoOperador, senha: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">STATUS DO ACESSO</label>
                            <select 
                              className="input-premium bg-slate-900 border-slate-700 font-bold"
                              value={novoOperador.status}
                              onChange={(e) => setNovoOperador({...novoOperador, status: e.target.value})}
                            >
                              <option value="ATIVO">ATIVO</option>
                              <option value="INATIVO">INATIVO</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-800">
                          <button 
                            type="button"
                            onClick={() => setModalOperador(false)}
                            className="btn-secondary flex-1 py-3"
                          >
                            CANCELAR
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setOperadores([...operadores, { ...novoOperador, id: Date.now() }]);
                              setModalOperador(false);
                              setNovoOperador({ nome: '', login: '', senha: '', celular: '', status: 'ATIVO' });
                            }}
                            className="btn-primary flex-1 py-3 uppercase tracking-widest font-black"
                          >
                            SALVAR ACESSO
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GESTÃO DE SETORES */}
            {subAbaCadastro === 'SETORES' && (
              <div className="h-full flex flex-col">
                <header className="flex justify-between items-center mb-8">
                  <div>
                    <button 
                      onClick={() => setSubAbaCadastro('MENU')}
                      className="text-indigo-400 text-sm mb-2 flex items-center gap-1 hover:underline text-left"
                    >
                      &larr; Voltar aos Cadastros
                    </button>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Gestão de Setores</h1>
                  </div>
                  <button 
                    onClick={() => setModalSetor(true)}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    Novo Setor
                  </button>
                </header>

                <div className="glass-card overflow-hidden border-slate-800/50 max-w-4xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-800/50">
                      <tr>
                        <th className="p-4 font-semibold">Descrição do Setor</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {setores.map((setor) => (
                        <tr key={setor.id} className="hover:bg-indigo-500/5 transition-colors group">
                          <td className="p-4 font-medium text-slate-100 uppercase">{setor.descricao}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset ${
                              setor.status === 'ATIVO' 
                                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 ring-red-500/20'
                            }`}>
                              {setor.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-indigo-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {setores.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-600 italic">
                            Nenhum setor cadastrado para o monitoramento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MODAL DE CADASTRO DE SETORES */}
                {modalSetor && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="glass-card w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-300">
                      <header className="mb-8 border-b border-slate-800 pb-4">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                          <div className="w-2 h-8 bg-emerald-600 rounded-full" />
                          Cadastro de Setor
                        </h2>
                      </header>

                      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">DESCRIÇÃO DO SETOR</label>
                          <input 
                            type="text" 
                            autoFocus
                            className="input-premium uppercase" 
                            placeholder="EX: SUPORTE TÉCNICO NÍVEL 1" 
                            value={novoSetor.descricao}
                            onChange={(e) => setNovoSetor({...novoSetor, descricao: e.target.value.toUpperCase()})}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">STATUS</label>
                          <select 
                            className="input-premium bg-slate-900 border-slate-700 font-bold"
                            value={novoSetor.status}
                            onChange={(e) => setNovoSetor({...novoSetor, status: e.target.value})}
                          >
                            <option value="ATIVO">ATIVO</option>
                            <option value="INATIVO">INATIVO</option>
                          </select>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-800">
                          <button 
                            type="button"
                            onClick={() => setModalSetor(false)}
                            className="btn-secondary flex-1 py-3"
                          >
                            CANCELAR
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (!novoSetor.descricao.trim()) return;
                              setSetores([...setores, { ...novoSetor, id: Date.now() }]);
                              setModalSetor(false);
                              setNovoSetor({ descricao: '', status: 'ATIVO' });
                            }}
                            className="btn-primary flex-1 py-3 uppercase tracking-widest font-black"
                          >
                            SALVAR SETOR
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESPOSTAS RÁPIDAS (SISTEMA) */}
            {subAbaCadastro === 'RESPOSTAS' && (
              <div className="h-full flex flex-col max-w-5xl">
                <header className="flex justify-between items-center mb-8">
                  <div>
                    <button 
                      onClick={() => setSubAbaCadastro('MENU')}
                      className="text-indigo-400 text-sm mb-2 flex items-center gap-1 hover:underline text-left"
                    >
                      &larr; Voltar aos Cadastros
                    </button>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Respostas Rápidas (Sistema)</h1>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* CARD: MENSAGEM DE BOAS-VINDAS */}
                  <div className="glass-card flex flex-col p-6 border-slate-800/60 shadow-lg bg-slate-900/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                        <MessageSquare size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Boas Vindas</h3>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        className="input-premium h-48 resize-none font-medium text-sm leading-relaxed" 
                        value={mensagemBoasVindas}
                        onChange={(e) => setMensagemBoasVindas(e.target.value)}
                      />
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-xs text-emerald-400/70 font-semibold uppercase mb-2">Variáveis Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {['{{nome_cliente}}', '{{nome_empresa}}', '{{protocolo}}', '{{data_abertura}}'].map((tag) => (
                            <span key={tag} className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD: MENSAGEM DE FINALIZAÇÃO */}
                  <div className="glass-card flex flex-col p-6 border-slate-800/60 shadow-lg bg-slate-900/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                        <LayoutGrid size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Finalização</h3>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        className="input-premium h-48 resize-none font-medium text-sm leading-relaxed" 
                        value={mensagemFinalizacao}
                        onChange={(e) => setMensagemFinalizacao(e.target.value)}
                      />
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <p className="text-xs text-indigo-400/70 font-semibold uppercase mb-2">Variáveis Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {['{{protocolo}}'].map((tag) => (
                            <span key={tag} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD: MENSAGEM DE TRANSFERÊNCIA */}
                  <div className="glass-card flex flex-col p-6 border-slate-800/60 shadow-lg bg-slate-900/10 md:col-span-2 max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Transferência</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${mostrarTransferencia ? 'text-emerald-500' : 'text-slate-600'}`}>
                          {mostrarTransferencia ? 'Ativada' : 'Desativada'}
                        </span>
                        <div 
                          onClick={() => setMostrarTransferencia(!mostrarTransferencia)}
                          className={`w-12 h-6 rounded-full cursor-pointer transition-all p-1 relative flex items-center ${mostrarTransferencia ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-800'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${mostrarTransferencia ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        disabled={!mostrarTransferencia}
                        className={`input-premium h-20 resize-none font-medium text-sm transition-opacity ${!mostrarTransferencia ? 'opacity-30' : 'opacity-100'}`} 
                        value={mensagemTransferencia}
                        onChange={(e) => setMensagemTransferencia(e.target.value)}
                      />
                      <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <p className="text-xs text-amber-400/70 font-semibold uppercase mb-2">Variáveis Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {['{{nome_atendente}}'].map((tag) => (
                            <span key={tag} className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/10 font-mono">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'CONFIGURACOES' && (
          <div className="flex-1 flex flex-col p-10 overflow-y-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Configurações do Sistema</h1>
              <p className="text-slate-500">Personalize sua experiência de monitoramento e alertas.</p>
            </header>

            <div className="max-w-4xl space-y-8">
              
              {/* SEÇÃO: INTERFACE */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutGrid size={16} />
                  Interface e Tema
                </h3>
                <div className="glass-card overflow-hidden divide-y divide-slate-800/10">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Modo de Exibição</h4>
                      <p className="text-sm text-slate-500">Escolha entre o tema escuro premium ou o tema claro de alta claridade.</p>
                    </div>
                    <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-700/30">
                      <button 
                        onClick={() => alternarTema(false)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!temaEscuro ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        LIGHT
                      </button>
                      <button 
                        onClick={() => alternarTema(true)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${temaEscuro ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        DARK
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SEÇÃO: NOTIFICAÇÕES */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={16} />
                  Alertas e Notificações
                </h3>
                <div className="glass-card overflow-hidden">
                  <div className="p-6 flex items-center justify-between border-b border-slate-800/10">
                    <div>
                      <h4 className="font-bold text-lg">Notificações Sonoras</h4>
                      <p className="text-sm text-slate-500">Ativar alerta sonoro para novos atendimentos e mensagens.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={testarSom}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/20 px-3 py-1.5 rounded-lg hover:bg-indigo-400/10 transition-all"
                      >
                        Testar Som
                      </button>
                      <div 
                        onClick={() => alternarSom(!notificacaoAtiva)}
                        className={`w-12 h-6 rounded-full cursor-pointer transition-all p-1 relative flex items-center ${notificacaoAtiva ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notificacaoAtiva ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* EXPLICAÇÃO DE USO */}
                  <div className="p-6 bg-indigo-600/5">
                    <h5 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">Como funcionam as notificações?</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-500 leading-relaxed">
                      <div className="space-y-3">
                        <p>
                          <strong className="text-indigo-400/80">Permissões:</strong> Os navegadores modernos bloqueiam sons automáticos por segurança. Para ouvir os alertas, você deve clicar em qualquer lugar da tela após carregar a página.
                        </p>
                        <p>
                          <strong className="text-indigo-400/80">Foco da Aba:</strong> O som será reproduzido mesmo que você esteja em outra aba ou com o navegador minimizado, garantindo que nenhum cliente fique esperando.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p>
                          <strong className="text-indigo-400/80">Teste de áudio:</strong> Use o botão "Testar Som" acima. Se não ouvir nada, verifique se o volume do sistema está alto e se o site não está "mutado" na aba do navegador.
                        </p>
                        <ul className="text-[11px] list-disc ml-4 space-y-1">
                          <li>Funciona em Chrome, Edge e Safari</li>
                          <li>Não requer instalação de plugins</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CONEXÃO WHATSAPP OFICIAL (META CLOUD API) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare size={16} />
                    Infraestrutura - WhatsApp Oficial
                  </h3>
                  <a 
                    href="https://developers.facebook.com/apps/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-black text-indigo-400 hover:underline uppercase tracking-widest flex items-center gap-1"
                  >
                    Gerar Token no Meta Developers &rarr;
                  </a>
                </div>

                <div className="glass-card overflow-hidden">
                  <div className="p-8 border-b border-slate-800/10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                        <Activity size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Meta Business Cloud API</h4>
                        <p className="text-sm text-slate-500 max-w-lg">Configuração de mensageria oficial para evitar banimentos e garantir entrega 100%.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number ID</label>
                        <input 
                          className="input-premium font-mono text-sm" 
                          placeholder="EX: 105632485974125"
                          value={whatsappPhoneId}
                          onChange={(e) => setWhatsappPhoneId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Business Account ID</label>
                        <input 
                          className="input-premium font-mono text-sm" 
                          placeholder="EX: 204587496352148"
                          value={whatsappWabaId}
                          onChange={(e) => setWhatsappWabaId(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Token de Acesso Permanente</label>
                        <input 
                          className="input-premium font-mono text-[11px]" 
                          placeholder="EAABwZCe87c6... (Seu token gerado no Meta Developers)"
                          type="password"
                          value={whatsappToken}
                          onChange={(e) => setWhatsappToken(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-800/10 flex justify-end">
                      <button 
                        onClick={salvarWhatsApp}
                        className="btn-primary py-3 px-10 tracking-widest uppercase text-xs"
                      >
                        Salvar Credenciais
                      </button>
                    </div>
                  </div>

                  {/* EXPLICAÇÃO WHATSOFFICIAL */}
                  <div className="p-8 bg-amber-500/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-amber-500/80 flex items-center gap-2">
                        <Activity size={14} />
                        Custo Zero (1.000 Mensagens)
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        A Meta oferece gratuitamente as primeiras <strong className="text-amber-400">1.000 conversas de serviço por mês</strong>. Isso é ideal para suporte que não ultrapassa esse volume, eliminando cobranças surpresas.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-amber-500/80 flex items-center gap-2">
                        <User size={14} />
                        Sem Risco de Banimento
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Diferente de sistemas amadores que "clonam" o WhatsApp Web, o GoUP usa o canal oficial da Meta. Suas mensagens são tratadas com prioridade e <strong className="text-amber-400">zero risco de banimento de conta</strong>.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-amber-500/80 flex items-center gap-2">
                        <Cog size={14} />
                        Conexão Multi-Agente
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Uma única conexão oficial serve para <strong className="text-amber-400">ilimitados operadores</strong>. Todos os técnicos respondem pelo mesmo número de forma transparente e organizada.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
