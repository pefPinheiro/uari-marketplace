'use client';

import React, { useState } from 'react';

interface ProposedProduct {
  id: string;
  title: string;
  storeName: string;
  price: number;
  category: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function CuradoriaPage() {
  const [proposals, setProposals] = useState<ProposedProduct[]>([
    { id: 'prop1', title: 'Óleo de Copaíba Puro 100ml', storeName: 'Empório do Norte', price: 35.00, category: 'Regional', submittedAt: '26 Mai, 2026', status: 'pending' },
    { id: 'prop2', title: 'Polpa de Açaí Especial 10L', storeName: 'Açaí de Tefé', price: 220.00, category: 'Alimentos', submittedAt: '26 Mai, 2026', status: 'pending' },
    { id: 'prop3', title: 'Cesto de Tucumã G', storeName: 'Artesanato Tefé', price: 89.00, category: 'Artesanato', submittedAt: '25 Mai, 2026', status: 'pending' },
    { id: 'prop4', title: 'Castanha do Pará Inteira 1kg', storeName: 'Empório do Norte', price: 78.00, category: 'Regional', submittedAt: '24 Mai, 2026', status: 'approved' },
    { id: 'prop5', title: 'Artesanato de Muirapiranga', storeName: 'Artesanato Tefé', price: 150.00, category: 'Artesanato', submittedAt: '23 Mai, 2026', status: 'rejected' }
  ]);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setProposals(prev => prev.map(p => {
      if (p.id === id) {
        alert(`Produto "${p.title}" foi ${action === 'approved' ? 'Aprovado e Publicado' : 'Rejeitado'} com sucesso!`);
        return { ...p, status: action };
      }
      return p;
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Contadores
  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length + 1239; // Adiciona simulação fidedigna
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length + 13;

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Curadoria de Produtos da Vitrine</h1>
          <p style={styles.pageSubtitle}>Valide a qualidade de fotos, descrições e preços das propostas enviadas pelos lojistas.</p>
        </div>
      </section>

      {/* Bento Grid KPIs */}
      <section style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Fila de Curadoria</span>
          <div style={{ ...styles.metricValue, color: 'var(--secondary)' }}>{pendingCount}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Produtos Aprovados</span>
          <div style={{ ...styles.metricValue, color: 'var(--tertiary)' }}>{approvedCount}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Propostas Rejeitadas</span>
          <div style={{ ...styles.metricValue, color: 'var(--error)' }}>{rejectedCount}</div>
        </div>
      </section>

      {/* Curadoria Table Card */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Propostas de Novos Produtos / Serviços</h3>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Nome do Produto</th>
                <th style={styles.th}>Lojista Parceiro</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Preço Sugerido</th>
                <th style={styles.th}>Data de Envio</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => {
                const isPending = p.status === 'pending';
                const isApproved = p.status === 'approved';
                
                return (
                  <tr key={p.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{p.title}</td>
                    <td style={styles.td}>{p.storeName}</td>
                    <td style={styles.td}>
                      <span style={styles.categoryTag}>{p.category}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '750', color: 'var(--tertiary)' }}>{formatCurrency(p.price)}</td>
                    <td style={styles.td}>{p.submittedAt}</td>

                    {/* Status Badge */}
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: isApproved 
                          ? 'rgba(26, 115, 18, 0.08)' 
                          : (p.status === 'rejected' ? 'rgba(186, 26, 26, 0.08)' : 'rgba(254, 107, 0, 0.08)'),
                        color: isApproved ? 'var(--tertiary)' : (p.status === 'rejected' ? 'var(--error)' : 'var(--secondary)')
                      }}>
                        {isApproved ? 'Aprovado' : (p.status === 'rejected' ? 'Rejeitado' : 'Pendente')}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {isPending ? (
                        <div style={styles.actionGroup}>
                          <button 
                            onClick={() => handleAction(p.id, 'approved')}
                            style={styles.approveBtn}
                          >
                            Aprovar & Publicar
                          </button>
                          <button 
                            onClick={() => handleAction(p.id, 'rejected')}
                            style={styles.rejectBtn}
                          >
                            Rejeitar
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '800',
                          color: isApproved ? 'var(--tertiary)' : 'var(--error)'
                        }}>
                          {isApproved ? 'Publicado ✓' : 'Arquivado ✕'}
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

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
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  approveBtn: {
    padding: '6px 14px',
    backgroundColor: 'var(--tertiary-container)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectBtn: {
    padding: '6px 14px',
    backgroundColor: 'var(--error-container)',
    color: 'var(--on-error-container)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
