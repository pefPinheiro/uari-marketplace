'use client';

import React, { useState } from 'react';

// Interfaces
interface Lojista {
  id: string;
  name: string;
  cnpj: string;
  owner: string;
  plan: 'Ouro' | 'Prata' | 'Bronze';
  reputation: number; // 1 to 5
  status: 'Ativo' | 'Pendente' | 'Suspenso';
  logoSvg: string;
  email: string;
  phone: string;
  gmv: string;
  productsCount: number;
  joinDate: string;
}

interface KycDocument {
  id: string;
  type: string;
  urgent?: boolean;
  storeName: string;
  documentMockText: string;
}

interface ApprovedDoc {
  id: string;
  type: string;
  storeName: string;
  timeAgo: string;
}

export default function GestaoLojistasPage() {
  // Lista de lojistas com dados detalhados para interação
  const [lojistas, setLojistas] = useState<Lojista[]>([
    {
      id: 'loj-1',
      name: 'Artesanato Tefé',
      cnpj: '12.345.678/0001-90',
      owner: 'Marcos Oliveira',
      plan: 'Ouro',
      reputation: 5,
      status: 'Ativo',
      logoSvg: 'ceramic',
      email: 'contato@artesanatotefe.com.br',
      phone: '+55 (97) 98111-2233',
      gmv: 'R$ 28.450,00',
      productsCount: 42,
      joinDate: '12/03/2025'
    },
    {
      id: 'loj-2',
      name: 'Tropical Fresh',
      cnpj: '98.765.432/0001-21',
      owner: 'Ana Paula Souza',
      plan: 'Prata',
      reputation: 4,
      status: 'Pendente',
      logoSvg: 'fruit',
      email: 'anapaula@tropicalfresh.com',
      phone: '+55 (97) 99122-3344',
      gmv: 'R$ 12.300,00',
      productsCount: 15,
      joinDate: '18/05/2026'
    },
    {
      id: 'loj-3',
      name: 'Amazon Express',
      cnpj: '55.667.889/0001-11',
      owner: 'Carlos Medeiros',
      plan: 'Bronze',
      reputation: 2,
      status: 'Suspenso',
      logoSvg: 'express',
      email: 'contato@amazonexpress.com.br',
      phone: '+55 (97) 98433-2211',
      gmv: 'R$ 3.890,00',
      productsCount: 6,
      joinDate: '02/01/2026'
    }
  ]);

  // Lista de documentos KYC pendentes
  const [pendingDocs, setPendingDocs] = useState<KycDocument[]>([
    {
      id: 'doc-1',
      type: 'RG do Responsável',
      urgent: true,
      storeName: 'Ateliê da Floresta',
      documentMockText: 'CARTEIRA DE IDENTIDADE - RG\n\nNome: FRANCISCO JOSÉ DOS SANTOS\nRG: 4.892.102-AM\nÓrgão Emissor: SSP/AM\nNascimento: 14/08/1988\n\nDocumento verificado sob os termos de segurança da UÁRI.'
    },
    {
      id: 'doc-2',
      type: 'CNPJ da Empresa',
      storeName: 'Peixaria Central',
      documentMockText: 'COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL\n\nNÚMERO DE INSCRIÇÃO: 23.491.023/0001-50\nNOME EMPRESARIAL: PEIXARIA CENTRAL DE TEFE LTDA\nTÍTULO ESTABELECIMENTO: PEIXARIA CENTRAL\nSITUAÇÃO CADASTRAL: ATIVA\n\nEndereço: Rua Quintino Bocaiúva, Centro, Tefé-AM'
    },
    {
      id: 'doc-3',
      type: 'Comprovante de Endereço',
      storeName: 'Tropical Fresh',
      documentMockText: 'FATURA DE ENERGIA ELÉTRICA - AMAZONAS ENERGIA\n\nMês de Referência: Abril 2026\nCliente: ANA PAULA SOUZA\nEndereço: Estrada do Aeroporto, 452, Aeroporto, Tefé-AM\nConsumo: 310 kWh\nValor Total: R$ 382,40\n\nComprovante oficial de endereço de Tefé.'
    }
  ]);

  // Documentos aprovados recentemente
  const [approvedDocs, setApprovedDocs] = useState<ApprovedDoc[]>([
    {
      id: 'app-1',
      type: 'Alvará de Funcionamento',
      storeName: 'Amazon Express',
      timeAgo: '2h atrás'
    }
  ]);

  // Configurações Globais Financeiras
  const [comissionInput, setComissionInput] = useState('12,5');
  const [savingCommission, setSavingCommission] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Estados dos Modais e Interatividades
  const [selectedLojista, setSelectedLojista] = useState<Lojista | null>(null);
  const [viewingDoc, setViewingDoc] = useState<KycDocument | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePlan, setInvitePlan] = useState<'Ouro' | 'Prata' | 'Bronze'>('Prata');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros Avançados
  const [filterSearch, setFilterSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Helpers para notificações
  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Funções de Ação KYC
  const approveDocument = (id: string) => {
    const doc = pendingDocs.find(d => d.id === id);
    if (!doc) return;

    // Remove das pendências
    setPendingDocs(prev => prev.filter(d => d.id !== id));

    // Adiciona na lista de aprovados recentes
    const newAppDoc: ApprovedDoc = {
      id: `app-${Date.now()}`,
      type: doc.type,
      storeName: doc.storeName,
      timeAgo: 'Agora mesmo'
    };
    setApprovedDocs(prev => [newAppDoc, ...prev]);
    triggerNotification(`✓ Documento "${doc.type}" da loja "${doc.storeName}" aprovado com sucesso!`);
  };

  const rejectDocument = (id: string) => {
    const doc = pendingDocs.find(d => d.id === id);
    if (!doc) return;

    const motive = prompt(`Motivo de reprovação para o documento "${doc.type}" (${doc.storeName}):`, 'Documento ilegível ou inválido.');
    if (motive === null) return; // cancelado pelo user

    setPendingDocs(prev => prev.filter(d => d.id !== id));
    triggerNotification(`✗ Documento "${doc.type}" rejeitado. Lojista notificado.`, 'info');
  };

  // Enviar convite de lojista
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setSendingInvite(true);
    setTimeout(() => {
      setSendingInvite(false);
      setShowInviteModal(false);
      setInviteEmail('');
      triggerNotification(`✉ Convite de adesão enviado para ${inviteEmail} (Plano ${invitePlan})!`);

      // Opcionalmente adiciona na lista como pendente de adesão
      const newLojista: Lojista = {
        id: `loj-${Date.now()}`,
        name: inviteEmail.split('@')[0].toUpperCase(),
        cnpj: 'Aguardando Cadastro...',
        owner: 'Convidado',
        plan: invitePlan,
        reputation: 3,
        status: 'Pendente',
        logoSvg: 'express',
        email: inviteEmail,
        phone: 'Pendente',
        gmv: 'R$ 0,00',
        productsCount: 0,
        joinDate: 'Hoje'
      };
      setLojistas(prev => [...prev, newLojista]);
    }, 1200);
  };

  // Salvar Taxa de Comissão Global
  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommission(true);
    setTimeout(() => {
      setSavingCommission(false);
      triggerNotification(`⚙ Taxa de comissão padrão alterada para ${comissionInput}% com sucesso!`);
    }, 800);
  };

  // Alterar Status do Lojista
  const changeLojistaStatus = (id: string, newStatus: 'Ativo' | 'Pendente' | 'Suspenso') => {
    setLojistas(prev =>
      prev.map(l => (l.id === id ? { ...l, status: newStatus } : l))
    );
    if (selectedLojista && selectedLojista.id === id) {
      setSelectedLojista(prev => prev ? { ...prev, status: newStatus } : null);
    }
    triggerNotification(`Lojista atualizado para status: ${newStatus}`, 'success');
  };

  // Renderizador de Logos em SVG inline de alta qualidade
  const renderLogo = (logoType: string) => {
    if (logoType === 'ceramic') {
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.storeLogo}>
          <rect width="44" height="44" rx="8" fill="#E8F5E9" />
          <path d="M12 28C12 32 15 34 22 34C29 34 32 32 32 28C32 25 30 22 28 19L26 14H18L16 19C14 22 12 25 12 28Z" fill="#2E7D32" />
          <ellipse cx="22" cy="12" rx="6" ry="2" fill="#81C784" />
          <path d="M16 19H28" stroke="#ffffff" strokeWidth="2" />
        </svg>
      );
    }
    if (logoType === 'fruit') {
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.storeLogo}>
          <rect width="44" height="44" rx="8" fill="#FFF3E0" />
          <circle cx="22" cy="24" r="10" fill="#FF9800" />
          <circle cx="24" cy="22" r="8" fill="#FFB74D" />
          <path d="M26 12C26 12 22 13 21 16C20 19 22 20 22 20C22 20 25 18 26 16C27 14 26 12 26 12Z" fill="#4CAF50" />
        </svg>
      );
    }
    // express
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.storeLogo}>
        <rect width="44" height="44" rx="8" fill="#E1F5FE" />
        <path d="M11 15H33V29H11V15Z" fill="#0277BD" />
        <path d="M16 11L11 15V29L14 33H29L33 29V15L28 11H16Z" stroke="#01579B" strokeWidth="2" />
        <path d="M16 22H28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 18L28 22L24 26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Filtragem dos Lojistas Ativos da Tabela
  const filteredLojistas = lojistas.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      l.cnpj.includes(filterSearch) ||
      l.owner.toLowerCase().includes(filterSearch.toLowerCase());
    
    const matchesPlan = filterPlan === 'Todos' || l.plan === filterPlan;
    const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div style={styles.container}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          ...styles.toast,
          backgroundColor: notification.type === 'success' ? 'var(--tertiary)' : notification.type === 'error' ? 'var(--error)' : 'var(--primary)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header Row */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Gestão de Lojistas</h1>
          <p style={styles.pageSubtitle}>Quebra essa castanha</p>
        </div>

        <div style={styles.headerActions}>
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)} 
            style={{
              ...styles.outlineBtn,
              backgroundColor: showFilters ? 'var(--surface-container-high)' : 'transparent'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            <span>Filtros Avançados</span>
          </button>

          <button type="button" onClick={() => setShowInviteModal(true)} style={styles.primaryBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            <span>Convidar Lojista</span>
          </button>
        </div>
      </section>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <section style={styles.filtersPanel}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Busca Rápida</label>
            <input 
              type="text" 
              placeholder="Nome, Proprietário ou CNPJ..." 
              value={filterSearch} 
              onChange={(e) => setFilterSearch(e.target.value)} 
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Plano de Parceria</label>
            <select 
              value={filterPlan} 
              onChange={(e) => setFilterPlan(e.target.value)} 
              style={styles.filterSelect}
            >
              <option value="Todos">Todos os Planos</option>
              <option value="Ouro">Ouro</option>
              <option value="Prata">Prata</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status Operacional</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              style={styles.filterSelect}
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>

          <button 
            type="button" 
            onClick={() => {
              setFilterSearch('');
              setFilterPlan('Todos');
              setFilterStatus('Todos');
            }} 
            style={styles.clearFiltersBtn}
          >
            Limpar Filtros
          </button>
        </section>
      )}

      {/* Main Content Layout Grid */}
      <div style={styles.mainGrid}>
        
        {/* Lado Esquerdo: Lojistas Ativos e Configuração Financeira */}
        <div style={styles.leftColumn}>
          
          {/* Card Lojistas Ativos */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <h2 style={styles.cardTitle}>Lojistas Ativos</h2>
              <span style={styles.verTodosLink} onClick={() => {
                setFilterPlan('Todos');
                setFilterStatus('Todos');
                setFilterSearch('');
                setShowFilters(true);
              }}>
                Ver todos ›
              </span>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>Loja</th>
                    <th style={styles.th}>Responsável</th>
                    <th style={styles.th}>Plano</th>
                    <th style={styles.th}>Reputação</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLojistas.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: 'var(--outline)', padding: '32px' }}>
                        Nenhum lojista encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLojistas.map(l => (
                      <tr key={l.id} style={styles.trRow}>
                        
                        {/* Loja */}
                        <td style={styles.tdStore}>
                          <div style={styles.storeInfoCell}>
                            {renderLogo(l.logoSvg)}
                            <div>
                              <span style={styles.storeNameText}>{l.name}</span>
                              <span style={styles.storeCnpjText}>CNPJ: {l.cnpj}</span>
                            </div>
                          </div>
                        </td>

                        {/* Responsável */}
                        <td style={styles.td}>
                          <div style={styles.responsibleCell}>
                            {l.owner}
                          </div>
                        </td>

                        {/* Plano */}
                        <td style={styles.td}>
                          <span style={{
                            ...styles.planBadge,
                            ...(l.plan === 'Ouro' ? styles.planGold : l.plan === 'Prata' ? styles.planSilver : styles.planBronze)
                          }}>
                            {l.plan}
                          </span>
                        </td>

                        {/* Reputação (Estrelas) */}
                        <td style={styles.td}>
                          <span style={styles.starsWrapper}>
                            {'★'.repeat(l.reputation)}
                            {'☆'.repeat(5 - l.reputation)}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(l.status === 'Ativo' ? styles.statusAtivo : l.status === 'Pendente' ? styles.statusPendente : styles.statusSuspenso)
                          }}>
                            <span style={{
                              ...styles.statusDot,
                              backgroundColor: l.status === 'Ativo' ? '#1a7312' : l.status === 'Pendente' ? '#fe6b00' : '#ba1a1a'
                            }} />
                            {l.status}
                          </span>
                        </td>

                        {/* Ações */}
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button 
                            type="button" 
                            onClick={() => setSelectedLojista(l)} 
                            style={styles.detailsBtn}
                          >
                            Ver Detalhes
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Card Configuração Financeira */}
          <div style={styles.card}>
            <div style={styles.cardHeaderSimple}>
              <div style={styles.finHeaderIconBg}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>account_balance_wallet</span>
              </div>
              <div>
                <h2 style={styles.cardTitleNoMargin}>Configuração Financeira</h2>
                <p style={styles.cardSubtitle}>Ajustar taxas e comissões globais do marketplace</p>
              </div>
            </div>

            <form onSubmit={handleSaveCommission} style={styles.commissionForm}>
              <div style={styles.formGroup}>
                <label style={styles.commissionLabel}>Taxa de Comissão (%)</label>
                
                <div style={styles.commissionInputBox}>
                  <input 
                    type="text" 
                    value={comissionInput} 
                    onChange={(e) => setComissionInput(e.target.value)} 
                    style={styles.commissionInput}
                  />
                  <span style={styles.commissionSuffix}>%</span>
                </div>
              </div>

              <div style={styles.commissionActions}>
                <button type="submit" style={styles.orangeBtn} disabled={savingCommission}>
                  {savingCommission ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                
                <span 
                  style={styles.historyLink} 
                  onClick={() => triggerNotification('Histórico: 27/05/2026 - Taxa alterada de 10,0% para 12,5% por Admin Master.', 'info')}
                >
                  Histórico de Alterações
                </span>
              </div>
            </form>

            <span style={styles.finHelpText}>A taxa atual é aplicada a todas as vendas de novos lojistas.</span>

          </div>

        </div>

        {/* Lado Direito: KYC & Documentos e Aprovados */}
        <div style={styles.rightColumn}>
          
          <div style={styles.card}>
            
            {/* Header do KYC */}
            <div style={styles.kycHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#1a7312', fontSize: '22px' }}>verified_user</span>
                <h2 style={styles.cardTitleNoMargin}>KYC & Documentos</h2>
              </div>
              {pendingDocs.length > 0 && (
                <span style={styles.kycPendingBadge}>
                  {pendingDocs.length.toString().padStart(2, '0')} Pendentes
                </span>
              )}
            </div>

            {/* List de KYC Cards */}
            <div style={styles.kycList}>
              {pendingDocs.length === 0 ? (
                <div style={styles.emptyKycBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#1a7312' }}>check_circle_outline</span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--on-surface)' }}>Tudo em dia!</span>
                  <span style={{ fontSize: '11px', color: 'var(--outline)' }}>Nenhum documento aguardando análise no momento.</span>
                </div>
              ) : (
                pendingDocs.map(doc => (
                  <div key={doc.id} style={styles.kycCard}>
                    
                    <div style={styles.kycCardHeader}>
                      <span style={styles.docTypeName}>{doc.type}</span>
                      {doc.urgent && <span style={styles.urgentTag}>URGENTE</span>}
                    </div>

                    <span style={styles.docStoreName}>Loja: {doc.storeName}</span>

                    <div style={styles.kycCardActions}>
                      <button 
                        type="button" 
                        onClick={() => setViewingDoc(doc)} 
                        style={styles.viewDocBtn}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                        <span>Visualizar</span>
                      </button>

                      <div style={styles.kycDecisionButtons}>
                        <button 
                          type="button" 
                          onClick={() => approveDocument(doc.id)} 
                          style={styles.approveDocSquareBtn}
                          title="Aprovar Documento"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => rejectDocument(doc.id)} 
                          style={styles.rejectDocSquareBtn}
                          title="Recusar Documento"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Recentemente Aprovados Section */}
            <div style={styles.approvedSection}>
              <h3 style={styles.approvedSectionTitle}>RECENTEMENTE APROVADOS</h3>
              
              <div style={styles.approvedList}>
                {approvedDocs.map(doc => (
                  <div key={doc.id} style={styles.approvedRow}>
                    <div style={styles.approvedIconBg}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--outline)' }}>description</span>
                    </div>
                    
                    <div style={styles.approvedTextGroup}>
                      <span style={styles.approvedDocName}>{doc.type}</span>
                      <span style={styles.approvedSubtext}>{doc.storeName} • {doc.timeAgo}</span>
                    </div>

                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--outline)' }}>check_circle</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL 1: Visualizador de Documentos KYC */}
      {viewingDoc && (
        <div style={styles.modalOverlay}>
          <div style={styles.documentViewerCard}>
            <div style={styles.docViewerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>description</span>
                <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--on-surface)' }}>{viewingDoc.type}</span>
              </div>
              <span className="material-symbols-outlined" style={styles.closeModalIcon} onClick={() => setViewingDoc(null)}>close</span>
            </div>

            <p style={styles.docViewerStoreName}>Loja solicitante: <strong>{viewingDoc.storeName}</strong></p>

            <div style={styles.docPaperSimulator}>
              <div style={styles.docWatermark}>UÁRI HOMOLOGADO</div>
              <pre style={styles.docTextContent}>{viewingDoc.documentMockText}</pre>
            </div>

            <div style={styles.docViewerActions}>
              <button 
                type="button" 
                onClick={() => {
                  approveDocument(viewingDoc.id);
                  setViewingDoc(null);
                }} 
                style={styles.greenDocBtn}
              >
                Aprovar Documento
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  rejectDocument(viewingDoc.id);
                  setViewingDoc(null);
                }} 
                style={styles.redDocBtn}
              >
                Recusar Documento
              </button>

              <button 
                type="button" 
                onClick={() => setViewingDoc(null)} 
                style={styles.cancelDocBtn}
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detalhes do Lojista */}
      {selectedLojista && (
        <div style={styles.modalOverlay}>
          <div style={styles.detailsModalCard}>
            <div style={styles.detailsModalHeader}>
              <h3 style={styles.detailsModalTitle}>Informações da Loja</h3>
              <span className="material-symbols-outlined" style={styles.closeModalIcon} onClick={() => setSelectedLojista(null)}>close</span>
            </div>

            <div style={styles.detailsStoreHero}>
              {renderLogo(selectedLojista.logoSvg)}
              <div>
                <h4 style={styles.detailsStoreName}>{selectedLojista.name}</h4>
                <span style={styles.detailsStoreCnpj}>CNPJ: {selectedLojista.cnpj}</span>
              </div>
            </div>

            <div style={styles.detailsInfoGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Proprietário</span>
                <span style={styles.detailValue}>{selectedLojista.owner}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Plano Atual</span>
                <span style={styles.detailValue}>{selectedLojista.plan}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Contato WhatsApp</span>
                <span style={styles.detailValue}>{selectedLojista.phone}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Faturamento (GMV)</span>
                <span style={{ ...styles.detailValue, color: 'var(--tertiary)', fontWeight: '800' }}>{selectedLojista.gmv}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Produtos Inseridos</span>
                <span style={styles.detailValue}>{selectedLojista.productsCount} itens</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Membro Desde</span>
                <span style={styles.detailValue}>{selectedLojista.joinDate}</span>
              </div>
            </div>

            {/* Actions for the specific lojista */}
            <div style={styles.detailsStoreStatusControl}>
              <span style={{ fontWeight: '750', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Alterar Status Operacional:</span>
              <div style={styles.statusButtonsRow}>
                <button 
                  type="button" 
                  onClick={() => changeLojistaStatus(selectedLojista.id, 'Ativo')}
                  style={{
                    ...styles.statusRowBtn,
                    backgroundColor: selectedLojista.status === 'Ativo' ? 'var(--tertiary)' : 'var(--surface-container-high)',
                    color: selectedLojista.status === 'Ativo' ? '#ffffff' : 'var(--on-surface)'
                  }}
                >
                  Ativo
                </button>
                <button 
                  type="button" 
                  onClick={() => changeLojistaStatus(selectedLojista.id, 'Pendente')}
                  style={{
                    ...styles.statusRowBtn,
                    backgroundColor: selectedLojista.status === 'Pendente' ? '#fe6b00' : 'var(--surface-container-high)',
                    color: selectedLojista.status === 'Pendente' ? '#ffffff' : 'var(--on-surface)'
                  }}
                >
                  Pendente
                </button>
                <button 
                  type="button" 
                  onClick={() => changeLojistaStatus(selectedLojista.id, 'Suspenso')}
                  style={{
                    ...styles.statusRowBtn,
                    backgroundColor: selectedLojista.status === 'Suspenso' ? 'var(--error)' : 'var(--surface-container-high)',
                    color: selectedLojista.status === 'Suspenso' ? '#ffffff' : 'var(--on-surface)'
                  }}
                >
                  Suspenso
                </button>
              </div>
            </div>

            <div style={styles.detailsModalActions}>
              <button type="button" onClick={() => setSelectedLojista(null)} style={styles.detailsModalCloseBtn}>
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Convidar Novo Lojista */}
      {showInviteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.inviteModalCard}>
            <div style={styles.inviteHeader}>
              <h3 style={styles.inviteTitle}>Convidar Lojista</h3>
              <span className="material-symbols-outlined" style={styles.closeModalIcon} onClick={() => setShowInviteModal(false)}>close</span>
            </div>
            
            <p style={styles.inviteDesc}>Insira o e-mail do lojista de Tefé para enviar o convite de adesão ao marketplace.</p>

            <form onSubmit={handleSendInvite} style={styles.inviteForm}>
              <div style={styles.formGroup}>
                <label style={styles.inviteFormLabel}>E-mail do Proprietário</label>
                <input 
                  type="email" 
                  placeholder="exemplo@lojista.com"
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  style={styles.inviteInput}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inviteFormLabel}>Plano Comercial Recomendado</label>
                <div style={styles.invitePlansOptions}>
                  <button 
                    type="button" 
                    onClick={() => setInvitePlan('Ouro')}
                    style={{
                      ...styles.invitePlanBtn,
                      border: invitePlan === 'Ouro' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                      backgroundColor: invitePlan === 'Ouro' ? 'rgba(110, 0, 193, 0.04)' : 'transparent',
                    }}
                  >
                    Ouro
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setInvitePlan('Prata')}
                    style={{
                      ...styles.invitePlanBtn,
                      border: invitePlan === 'Prata' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                      backgroundColor: invitePlan === 'Prata' ? 'rgba(110, 0, 193, 0.04)' : 'transparent',
                    }}
                  >
                    Prata
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setInvitePlan('Bronze')}
                    style={{
                      ...styles.invitePlanBtn,
                      border: invitePlan === 'Bronze' ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                      backgroundColor: invitePlan === 'Bronze' ? 'rgba(110, 0, 193, 0.04)' : 'transparent',
                    }}
                  >
                    Bronze
                  </button>
                </div>
              </div>

              <div style={styles.inviteModalActions}>
                <button type="button" onClick={() => setShowInviteModal(false)} style={styles.inviteCancelBtn}>
                  Cancelar
                </button>
                <button type="submit" style={styles.inviteSubmitBtn} disabled={sendingInvite}>
                  {sendingInvite ? 'Enviando...' : 'Enviar Convite Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Estilos UÁRI Admin Lojistas (Pixel-Perfect Figma matching)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '8px',
  },
  toast: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    padding: '14px 24px',
    color: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 99999,
    fontSize: '13px',
    fontWeight: '750',
    animation: 'slideIn 0.3s ease-out',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--outline)',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  outlineBtn: {
    background: 'none',
    border: '1px solid var(--outline-variant)',
    borderRadius: '9999px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  primaryBtn: {
    backgroundColor: '#6e00c1', // Roxo UÁRI
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '750',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(110, 0, 193, 0.15)',
    transition: 'all 0.2s',
  },
  filtersPanel: {
    backgroundColor: 'var(--surface-container-lowest)',
    border: '1px solid var(--surface-container-highest)',
    borderRadius: '12px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '20px',
    flexWrap: 'wrap',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.01)',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '180px',
    flex: '1',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  filterInput: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
  },
  filterSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  clearFiltersBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--error)',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2.1fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.015)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  verTodosLink: {
    fontSize: '13px',
    fontWeight: '750',
    color: 'var(--primary)',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
    margin: '0 -24px',
    padding: '0 24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  th: {
    padding: '12px 8px 12px 0',
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--outline)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  trRow: {
    borderBottom: '1px solid var(--surface-container-highest)',
    transition: 'background-color 0.15s',
    cursor: 'default',
  },
  td: {
    padding: '16px 8px 16px 0',
    fontSize: '13.5px',
    color: 'var(--on-surface)',
    verticalAlign: 'middle',
  },
  tdStore: {
    padding: '16px 8px 16px 0',
    verticalAlign: 'middle',
    minWidth: '220px',
  },
  storeInfoCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  storeLogo: {
    borderRadius: '8px',
    flexShrink: '0',
  },
  storeNameText: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  storeCnpjText: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--outline)',
    marginTop: '2px',
  },
  responsibleCell: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: 'var(--on-surface)',
    lineHeight: '16px',
  },
  planBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11.5px',
    fontWeight: '750',
    textAlign: 'center',
  },
  planGold: {
    backgroundColor: '#fffdf0',
    color: '#b29000',
    border: '1px solid #ffe8aa',
  },
  planSilver: {
    backgroundColor: '#f5f5f5',
    color: '#5e5e5e',
    border: '1px solid #e0e0e0',
  },
  planBronze: {
    backgroundColor: '#fdf6f0',
    color: '#8d5b38',
    border: '1px solid #f3dac2',
  },
  starsWrapper: {
    color: '#fe6b00', // Laranja vibrante
    fontSize: '15px',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '750',
    textTransform: 'capitalize',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  statusAtivo: {
    backgroundColor: 'rgba(26, 115, 18, 0.06)',
    color: '#1a7312',
  },
  statusPendente: {
    backgroundColor: 'rgba(254, 107, 0, 0.06)',
    color: '#fe6b00',
  },
  statusSuspenso: {
    backgroundColor: 'rgba(186, 26, 26, 0.06)',
    color: '#ba1a1a',
  },
  detailsBtn: {
    border: 'none',
    backgroundColor: '#f2ecf9',
    color: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardHeaderSimple: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  finHeaderIconBg: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(110, 0, 193, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleNoMargin: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: 'var(--outline)',
    margin: '2px 0 0 0',
    fontWeight: '550',
  },
  commissionForm: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  commissionLabel: {
    fontSize: '12px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    marginBottom: '6px',
    display: 'block',
  },
  commissionInputBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f2f2ef',
    borderRadius: '12px',
    padding: '6px 16px',
    width: '160px',
    border: '1px solid transparent',
    transition: 'border 0.2s',
  },
  commissionInput: {
    border: 'none',
    background: 'none',
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    width: '100%',
    outline: 'none',
    textAlign: 'left',
    fontFamily: 'Plus Jakarta Sans',
  },
  commissionSuffix: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--outline)',
  },
  commissionActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  orangeBtn: {
    backgroundColor: '#fe6b00', // Laranja UÁRI
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '12px 32px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(254, 107, 0, 0.15)',
    transition: 'all 0.2s',
    fontFamily: 'Plus Jakarta Sans',
  },
  historyLink: {
    fontSize: '12px',
    color: 'var(--outline)',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '600',
  },
  finHelpText: {
    fontSize: '11px',
    color: 'var(--outline)',
    display: 'block',
    marginTop: '12px',
    fontWeight: '550',
  },
  kycHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  kycPendingBadge: {
    backgroundColor: '#ba1a1a', // Vermelho
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
  },
  kycList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  emptyKycBox: {
    padding: '32px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '12px',
    border: '1px dashed var(--outline-variant)',
  },
  kycCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--outline-variant)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.01)',
  },
  kycCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  docTypeName: {
    fontSize: '13.5px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  urgentTag: {
    backgroundColor: '#ffdad6',
    color: '#ba1a1a',
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.2px',
  },
  docStoreName: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--outline)',
    marginBottom: '14px',
    fontWeight: '550',
  },
  kycCardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDocBtn: {
    backgroundColor: '#f1f1ee',
    border: 'none',
    borderRadius: '9999px',
    padding: '6px 14px',
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  kycDecisionButtons: {
    display: 'flex',
    gap: '8px',
  },
  approveDocSquareBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#1a7312',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(26,115,18,0.15)',
  },
  rejectDocSquareBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#ba1a1a',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(186,26,26,0.15)',
  },
  approvedSection: {
    borderTop: '1px solid var(--surface-container-highest)',
    paddingTop: '20px',
  },
  approvedSectionTitle: {
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--outline)',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  approvedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  approvedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  approvedIconBg: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'var(--surface-container-high)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
  },
  approvedDocName: {
    fontSize: '12px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  approvedSubtext: {
    fontSize: '10px',
    color: 'var(--outline)',
    marginTop: '1px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
  },
  documentViewerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '550px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  docViewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  closeModalIcon: {
    cursor: 'pointer',
    color: 'var(--outline)',
    fontSize: '22px',
  },
  docViewerStoreName: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
    margin: 0,
  },
  docPaperSimulator: {
    backgroundColor: '#FAF9F6',
    border: '1px solid var(--outline-variant)',
    borderRadius: '8px',
    padding: '20px',
    height: '240px',
    overflowY: 'auto',
    position: 'relative',
  },
  docWatermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-25deg)',
    fontSize: '24px',
    fontWeight: '900',
    color: 'rgba(110, 0, 193, 0.05)',
    letterSpacing: '2px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  docTextContent: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '18px',
    color: '#2d2d2d',
    whiteSpace: 'pre-wrap',
  },
  docViewerActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  greenDocBtn: {
    backgroundColor: '#1a7312',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    flex: '1',
  },
  redDocBtn: {
    backgroundColor: '#ba1a1a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    flex: '1',
  },
  cancelDocBtn: {
    backgroundColor: '#f1f1ee',
    color: 'var(--on-surface-variant)',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  detailsModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailsModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  detailsModalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    margin: 0,
  },
  detailsStoreHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'var(--surface-container-low)',
    padding: '16px',
    borderRadius: '12px',
  },
  detailsStoreName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    margin: 0,
  },
  detailsStoreCnpj: {
    fontSize: '12px',
    color: 'var(--outline)',
    display: 'block',
    marginTop: '2px',
  },
  detailsInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--on-surface)',
  },
  detailsStoreStatusControl: {
    borderTop: '1px solid var(--surface-container-highest)',
    paddingTop: '16px',
    marginTop: '8px',
  },
  statusButtonsRow: {
    display: 'flex',
    gap: '10px',
  },
  statusRowBtn: {
    flex: '1',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailsModalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  detailsModalCloseBtn: {
    backgroundColor: '#f1f1ee',
    color: 'var(--on-surface-variant)',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  inviteModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    width: '90%',
    maxWidth: '440px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inviteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  inviteTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    margin: 0,
  },
  inviteDesc: {
    fontSize: '13px',
    color: 'var(--outline)',
    margin: 0,
    lineHeight: '18px',
  },
  inviteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inviteFormLabel: {
    fontSize: '12px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    marginBottom: '6px',
    display: 'block',
  },
  inviteInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
  },
  invitePlansOptions: {
    display: 'flex',
    gap: '12px',
  },
  invitePlanBtn: {
    flex: '1',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    transition: 'all 0.2s',
  },
  inviteModalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: '1px solid var(--surface-container-highest)',
    paddingTop: '16px',
    marginTop: '8px',
  },
  inviteCancelBtn: {
    backgroundColor: '#f1f1ee',
    color: 'var(--on-surface-variant)',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  inviteSubmitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(110, 0, 193, 0.15)',
  }
};
