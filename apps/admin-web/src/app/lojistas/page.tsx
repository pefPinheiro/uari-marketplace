'use client';

import React, { useState } from 'react';

interface StorePartner {
  id: string;
  name: string;
  category: string;
  ownerEmail: string;
  commissionRate: number;
  isVerified: boolean;
  status: 'active' | 'suspended';
}

export default function LojistasPage() {
  const [partners, setPartners] = useState<StorePartner[]>([
    { id: 'st1', name: 'Empório do Norte', category: 'Regional', ownerEmail: 'contato@emporiodonorte.com', commissionRate: 10, isVerified: true, status: 'active' },
    { id: 'st2', name: 'Loja Amazônia Viva', category: 'Alimentos', ownerEmail: 'sac@amazoniaviva.com', commissionRate: 12, isVerified: true, status: 'active' },
    { id: 'st3', name: 'Artesanato Tefé', category: 'Artesanato', ownerEmail: 'artes@tefe.am.gov.br', commissionRate: 10, isVerified: true, status: 'active' },
    { id: 'st4', name: 'Moda Regional Tefé', category: 'Moda', ownerEmail: 'financeiro@modatefe.com', commissionRate: 10, isVerified: false, status: 'active' },
    { id: 'st5', name: 'Loja de Ferragens W.', category: 'Casa', ownerEmail: 'walmir@ferragensw.com', commissionRate: 8, isVerified: false, status: 'suspended' }
  ]);

  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [newCommission, setNewCommission] = useState('');
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const toggleStatus = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'suspended' : 'active';
        alert(`Loja "${p.name}" foi ${nextStatus === 'active' ? 'Reativada' : 'Suspensa'} com sucesso!`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleEditCommission = (id: string, current: number) => {
    setActivePartnerId(id);
    setNewCommission(String(current));
    setShowCommissionModal(true);
  };

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newCommission);
    if (isNaN(rate) || rate < 0 || rate > 100 || !activePartnerId) return;

    setPartners(prev => prev.map(p => p.id === activePartnerId ? { ...p, commissionRate: rate } : p));
    setShowCommissionModal(false);
    setActivePartnerId(null);
    alert('Comissão ajustada com sucesso!');
  };

  const toggleVerify = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        const nextVerified = !p.isVerified;
        alert(`Selo "Parceiro Verificado" ${nextVerified ? 'concedido para' : 'removido de'} ${p.name}!`);
        return { ...p, isVerified: nextVerified };
      }
      return p;
    }));
  };

  // Contadores
  const totalPartners = partners.length;
  const activeCount = partners.filter(p => p.status === 'active').length;
  const suspendedCount = partners.filter(p => p.status === 'suspended').length;

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Gestão de Parceiros Lojistas</h1>
          <p style={styles.pageSubtitle}>Monitore as lojas cadastradas, conceda selos de verificação e configure taxas de comissão.</p>
        </div>
      </section>

      {/* KPIs Grid */}
      <section style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de Parceiros</span>
          <div style={styles.metricValue}>{totalPartners}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Lojas Ativas</span>
          <div style={{ ...styles.metricValue, color: 'var(--tertiary)' }}>{activeCount}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Lojas Suspensas</span>
          <div style={{ ...styles.metricValue, color: 'var(--error)' }}>{suspendedCount}</div>
        </div>
      </section>

      {/* Partners Table Card */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Lojas e Marcas Cadastradas</h3>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Nome da Loja</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>E-mail Proprietário</th>
                <th style={styles.th}>Comissão UÁRI</th>
                <th style={styles.th}>Verificação</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => {
                const isActive = p.status === 'active';
                return (
                  <tr key={p.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{p.name}</td>
                    <td style={styles.td}>
                      <span style={styles.categoryTag}>{p.category}</span>
                    </td>
                    <td style={styles.td}>{p.ownerEmail}</td>
                    
                    {/* Comissão editável */}
                    <td style={styles.td}>
                      <div style={styles.commissionWrapper} onClick={() => handleEditCommission(p.id, p.commissionRate)}>
                        <span style={{ fontWeight: '750' }}>{p.commissionRate}%</span>
                        <span className="material-symbols-outlined" style={styles.editIcon}>edit</span>
                      </div>
                    </td>

                    {/* Verificação */}
                    <td style={styles.td}>
                      <button 
                        onClick={() => toggleVerify(p.id)}
                        style={{
                          ...styles.verifyBtn,
                          backgroundColor: p.isVerified ? 'rgba(26, 115, 18, 0.08)' : 'rgba(126, 115, 134, 0.08)',
                          color: p.isVerified ? 'var(--tertiary)' : 'var(--outline)'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified</span>
                        <span>{p.isVerified ? 'Verificado' : 'Conceder'}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: isActive ? 'rgba(26, 115, 18, 0.08)' : 'rgba(186, 26, 26, 0.08)',
                        color: isActive ? 'var(--tertiary)' : 'var(--error)'
                      }}>
                        ● {isActive ? 'Ativa' : 'Suspensa'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleStatus(p.id)}
                        style={{
                          ...styles.statusToggleBtn,
                          backgroundColor: isActive ? 'rgba(186, 26, 26, 0.08)' : 'rgba(26, 115, 18, 0.08)',
                          color: isActive ? 'var(--error)' : 'var(--tertiary)'
                        }}
                      >
                        {isActive ? 'Suspender' : 'Reativar'}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Ajustar Comissão */}
      {showCommissionModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Ajustar Taxa de Comissão</h3>
            <p style={styles.modalDesc}>Defina o percentual de comissão virtual retido da loja nas transações da vitrine.</p>
            
            <form onSubmit={handleSaveCommission} style={styles.modalForm}>
              <div style={styles.inputWrapper}>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.5"
                  value={newCommission} 
                  onChange={(e) => setNewCommission(e.target.value)}
                  style={styles.modalInput} 
                  required
                />
                <span style={styles.percentSymbol}>%</span>
              </div>
              
              <div style={styles.modalActions}>
                <button type="submit" style={styles.saveBtn}>Salvar Taxa</button>
                <button type="button" onClick={() => setShowCommissionModal(false)} style={styles.cancelBtn}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Estilos UÁRI Admin
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'var(--on-surface-variant)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metricLabel: {
    fontSize: '13px',
    color: 'var(--outline)',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '850',
    color: 'var(--on-surface)',
  },
  card: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    marginBottom: '20px',
  },
  tableWrapper: {
    overflowX: 'auto',
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
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--surface-container-highest)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--on-surface)',
  },
  categoryTag: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'var(--surface-container-high)',
    color: 'var(--on-surface-variant)',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  commissionWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: 'var(--primary)',
    fontWeight: '750',
  },
  editIcon: {
    fontSize: '14px',
    color: 'var(--outline)',
  },
  verifyBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusToggleBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(3px)',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  modalDesc: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
    marginTop: '4px',
    marginBottom: '20px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    padding: '12px',
    width: '120px',
    fontSize: '20px',
    fontWeight: '800',
    textAlign: 'center',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    outline: 'none',
    color: 'var(--primary)',
  },
  percentSymbol: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--outline)',
    marginLeft: '8px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: 'var(--surface-container-high)',
    color: 'var(--on-surface-variant)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  }
};
