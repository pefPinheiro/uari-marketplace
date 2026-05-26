'use client';

import React, { useEffect, useState } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService } from '../../services/lojista';

interface Message {
  sender: 'store' | 'client' | 'admin';
  text: string;
  time: string;
}

interface Thread {
  id: string;
  clientName: string;
  clientAvatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  status: string;
  messages: Message[];
}

export default function ChatPage() {
  const { store } = useLojista();
  const [activeTab, setActiveTab] = useState<'clientes' | 'admin'>('clientes');
  
  // Lista de Threads de Clientes
  const [clientThreads, setClientThreads] = useState<Thread[]>([]);
  
  // Lista de Threads de Admin/Suporte UÁRI
  const [adminThreads, setAdminThreads] = useState<Thread[]>([
    {
      id: 'admin-1',
      clientName: 'Curadoria & Suporte UÁRI',
      clientAvatar: '🛡️',
      lastMessage: 'Olá! Sou o curador chefe. Sua proposta de Óleo de Copaíba foi homologada!',
      time: '10:30',
      unread: true,
      status: 'Suporte',
      messages: [
        { sender: 'admin', text: 'Olá lojista! Identificamos sua proposta de novo produto na fila de curadoria local.', time: '10:15' },
        { sender: 'store', text: 'Olá! Que ótimo. Há alguma pendência de fotos ou descrição?', time: '10:20' },
        { sender: 'admin', text: 'Não, as especificações estão ideais. O produto foi homologado com sucesso e já está ativo na vitrine de Tefé!', time: '10:30' }
      ]
    },
    {
      id: 'admin-2',
      clientName: 'Financeiro & Mensalidade',
      clientAvatar: '💰',
      lastMessage: 'Seu comprovante de Pix de transferência foi gerado.',
      time: 'Ontem',
      unread: false,
      status: 'Financeiro',
      messages: [
        { sender: 'admin', text: 'Prezado lojista, identificamos a sua solicitação de resgate de faturamento virtual.', time: 'Ontem' },
        { sender: 'store', text: 'Perfeito. Obrigado pelo processamento rápido!', time: 'Ontem' },
        { sender: 'admin', text: 'Seu comprovante de Pix de transferência foi gerado.', time: 'Ontem' }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');

  // Carrega mensagens de clientes da API/Mock
  useEffect(() => {
    async function loadChats() {
      if (!store?.id) return;
      setLoading(true);
      try {
        const chats = await lojistaService.fetchStoreMessages(store.id);
        setClientThreads(chats);
        
        // Inicializa com a primeira thread de clientes
        if (chats.length > 0) {
          setActiveThreadId(chats[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, [store?.id]);

  // Altera abas
  const handleTabChange = (tab: 'clientes' | 'admin') => {
    setActiveTab(tab);
    const threadsList = tab === 'clientes' ? clientThreads : adminThreads;
    if (threadsList.length > 0) {
      setActiveThreadId(threadsList[0].id);
    } else {
      setActiveThreadId(null);
    }
  };

  // Seleciona a lista ativa baseada na aba
  const activeThreadsList = activeTab === 'clientes' ? clientThreads : adminThreads;
  const activeThread = activeThreadsList.find((t) => t.id === activeThreadId);

  // Envio de mensagem
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      sender: 'store',
      text: inputText,
      time: currentTime
    };

    // Atualiza localmente dependendo da aba ativa
    if (activeTab === 'clientes') {
      setClientThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: inputText,
              time: currentTime,
              unread: false,
              messages: [...t.messages, newMsg]
            };
          }
          return t;
        })
      );
    } else {
      setAdminThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              lastMessage: inputText,
              time: currentTime,
              unread: false,
              messages: [...t.messages, newMsg]
            };
          }
          return t;
        })
      );
    }
    
    setInputText('');

    // Simula resposta automática após 1.5 segundos
    setTimeout(() => {
      const responseTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      let responseMsg: Message;

      if (activeTab === 'clientes') {
        const clientResponses = [
          "Beleza! Combinado então. Te vejo na feira central ou mando o entregador.",
          "Excelente atendimento! Muito obrigado pela atenção.",
          "Maravilha, já anotei aqui. Até mais!"
        ];
        const randomResponse = clientResponses[Math.floor(Math.random() * clientResponses.length)];
        
        responseMsg = {
          sender: 'client',
          text: randomResponse,
          time: responseTime
        };

        setClientThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThreadId) {
              return {
                ...t,
                lastMessage: randomResponse,
                time: responseTime,
                messages: [...t.messages, responseMsg]
              };
            }
            return t;
          })
        );
      } else {
        const adminResponses = [
          "Entendido! Seu ticket de suporte foi atualizado com sucesso.",
          "Agradecemos o contato. Nossos curadores estão analisando a solicitação e daremos retorno em breve.",
          "Processamento concluído com sucesso. Qualquer outra dúvida, estamos à disposição."
        ];
        const randomResponse = adminResponses[Math.floor(Math.random() * adminResponses.length)];

        responseMsg = {
          sender: 'admin',
          text: randomResponse,
          time: responseTime
        };

        setAdminThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThreadId) {
              return {
                ...t,
                lastMessage: randomResponse,
                time: responseTime,
                messages: [...t.messages, responseMsg]
              };
            }
            return t;
          })
        );
      }
    }, 1500);
  };

  if (loading && clientThreads.length === 0) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <div style={styles.skeletonText}>Carregando mensagens da plataforma...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatShell}>
        
        {/* Lado Esquerdo: Abas de Conversa e Threads */}
        <aside style={styles.threadsList}>
          
          {/* Header Switcher de Abas Premium */}
          <div style={styles.listHeader}>
            <h3 style={styles.listTitle}>Central de Mensagens</h3>
            
            {/* Tab buttons */}
            <div style={styles.tabsWrapper}>
              <button 
                onClick={() => handleTabChange('clientes')}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'clientes' ? styles.tabBtnActive : {})
                }}
              >
                <span>Clientes</span>
              </button>
              <button 
                onClick={() => handleTabChange('admin')}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'admin' ? styles.tabBtnActive : {})
                }}
              >
                <span>Suporte Admin</span>
                {adminThreads.some(t => t.unread) && <span style={styles.tabBadgeDot} />}
              </button>
            </div>
          </div>

          {/* Listagem de Chats da aba ativa */}
          <div style={styles.threadsScroll}>
            {activeThreadsList.map((t) => {
              const isActive = t.id === activeThreadId;
              return (
                <div 
                  key={t.id} 
                  onClick={() => {
                    setActiveThreadId(t.id);
                    // Marca como lido localmente
                    if (activeTab === 'clientes') {
                      setClientThreads(prev => prev.map(item => item.id === t.id ? { ...item, unread: false } : item));
                    } else {
                      setAdminThreads(prev => prev.map(item => item.id === t.id ? { ...item, unread: false } : item));
                    }
                  }}
                  style={{
                    ...styles.threadCard,
                    ...(isActive ? styles.threadCardActive : {})
                  }}
                >
                  <div style={styles.avatarCircle}>{t.clientAvatar}</div>
                  <div style={styles.threadMeta}>
                    <div style={styles.threadHeaderRow}>
                      <span style={styles.clientName}>{t.clientName}</span>
                      <span style={styles.msgTime}>{t.time}</span>
                    </div>
                    <p style={{
                      ...styles.lastMsg,
                      fontWeight: t.unread ? '700' : '500',
                      color: t.unread ? 'var(--primary)' : 'var(--on-surface-variant)'
                    }}>{t.lastMessage}</p>
                    <div style={styles.threadBadgeRow}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: t.status === 'Pendente' ? 'rgba(254, 107, 0, 0.08)' : 'rgba(26, 115, 18, 0.08)',
                        color: t.status === 'Pendente' ? 'var(--secondary)' : 'var(--tertiary)'
                      }}>{t.status}</span>
                      {t.unread && <span style={styles.unreadDot} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Lado Direito: Janela Ativa do Chat */}
        {activeThread ? (
          <div style={styles.chatWindow}>
            
            {/* Header do Chat Ativo */}
            <div style={styles.chatHeader}>
              <div style={styles.activeClientMeta}>
                <div style={styles.avatarBig}>{activeThread.clientAvatar}</div>
                <div>
                  <h4 style={styles.activeClientName}>{activeThread.clientName}</h4>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: activeThread.status === 'Pendente' ? 'rgba(254, 107, 0, 0.08)' : 'rgba(26, 115, 18, 0.08)',
                    color: activeThread.status === 'Pendente' ? 'var(--secondary)' : 'var(--tertiary)',
                    marginTop: '2px',
                    display: 'inline-block'
                  }}>{activeThread.status}</span>
                </div>
              </div>
            </div>

            {/* Balões de Mensagem */}
            <div style={styles.messagesScroll}>
              {activeThread.messages.map((msg, index) => {
                const isStore = msg.sender === 'store';
                const isAdmin = msg.sender === 'admin';
                return (
                  <div 
                    key={index} 
                    style={{
                      ...styles.msgRow,
                      justifyContent: isStore ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      ...styles.msgBubble,
                      backgroundColor: isStore 
                        ? 'var(--primary)' 
                        : (isAdmin ? '#fffdf5' : 'var(--surface-container-high)'), 
                      color: isStore ? '#ffffff' : 'var(--on-surface)',
                      border: isAdmin ? '1px solid rgba(254, 107, 0, 0.2)' : 'none',
                      borderRadius: isStore ? '16px 16px 2px 16px' : '16px 16px 16px 2px'
                    }}>
                      {isAdmin && (
                        <span style={styles.adminLabel}>🛡️ ADMINISTRAÇÃO UÁRI</span>
                      )}
                      <p style={styles.msgText}>{msg.text}</p>
                      <span style={{
                        ...styles.msgTimeLabel,
                        color: isStore ? '#eed9ff' : 'var(--outline)'
                      }}>{msg.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={styles.inputForm}>
              <input 
                type="text" 
                placeholder={activeTab === 'clientes' ? "Digite sua resposta para o cliente..." : "Envie sua mensagem para a administração..."}
                style={styles.chatInput}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" style={styles.sendBtn}>
                <span>Enviar</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.emptyChat}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)' }}>chat_bubble_outline</span>
            <p style={styles.emptyChatText}>Selecione um chat ao lado para iniciar a conversa.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// Estilos premium inline baseados no UÁRI Design System
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: 'calc(100vh - 120px)',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '350px',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(110, 0, 193, 0.1)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  skeletonText: {
    color: 'var(--on-surface-variant)',
    fontSize: '14px',
  },
  chatShell: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    height: '100%',
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    overflow: 'hidden',
  },
  threadsList: {
    borderRight: '1px solid var(--surface-container-highest)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--surface-container-low)',
  },
  listHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--surface-container-highest)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  tabsWrapper: {
    display: 'flex',
    backgroundColor: 'var(--surface-container-high)',
    borderRadius: '8px',
    padding: '2px',
    position: 'relative',
  },
  tabBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--on-surface-variant)',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    position: 'relative',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--primary)',
    boxShadow: '0px 2px 8px rgba(110, 0, 193, 0.06)',
  },
  tabBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--error)',
    position: 'absolute',
    top: '6px',
    right: '8px',
  },
  threadsScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  threadCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--surface-container-highest)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignItems: 'flex-start',
  },
  threadCardActive: {
    backgroundColor: '#ffffff',
    borderLeft: '4px solid var(--primary)',
  },
  avatarCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-container-high)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  threadMeta: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  threadHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  clientName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--on-surface)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: 'Plus Jakarta Sans',
  },
  msgTime: {
    fontSize: '11px',
    color: 'var(--outline)',
  },
  lastMsg: {
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  threadBadgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2px',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
  },
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  chatHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  activeClientMeta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  avatarBig: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  activeClientName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  messagesScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: 'var(--surface-bright)',
  },
  msgRow: {
    display: 'flex',
    width: '100%',
  },
  msgBubble: {
    maxWidth: '65%',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.01)',
  },
  adminLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--secondary)',
    marginBottom: '2px',
    display: 'block',
  },
  msgText: {
    fontSize: '14px',
    lineHeight: '20px',
    whiteSpace: 'pre-wrap',
  },
  msgTimeLabel: {
    fontSize: '10px',
    alignSelf: 'flex-end',
  },
  inputForm: {
    padding: '16px 24px',
    borderTop: '1px solid var(--surface-container-highest)',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'var(--surface-container-low)',
  },
  chatInput: {
    flex: 1,
    padding: '12px 18px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
  },
  sendBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--outline)',
    gap: '12px',
  },
  emptyChatText: {
    fontSize: '15px',
    fontWeight: '600',
  }
};
