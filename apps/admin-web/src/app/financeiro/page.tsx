'use client';

import React, { useState } from 'react';

interface WithdrawalRequest {
  id: string;
  storeName: string;
  date: string;
  pixKey: string;
  grossAmount: number;
  feePercentage: number;
  status: 'pending' | 'completed';
}

export default function FinanceiroPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([
    { id: 'w1', storeName: 'Moda Regional Tefé', date: '26 Mai, 2026', pixKey: 'financeiro@modatefe.com', grossAmount: 2450.00, feePercentage: 10, status: 'pending' },
    { id: 'w2', storeName: 'Empório do Norte', date: '25 Mai, 2026', pixKey: 'emporio@tefe.am.br', grossAmount: 5000.00, feePercentage: 10, status: 'completed' },
    { id: 'w3', storeName: 'Artesanato Tefé', date: '22 Mai, 2026', pixKey: 'artes@tefe.am.gov.br', grossAmount: 1200.00, feePercentage: 12, status: 'completed' },
    { id: 'w4', storeName: 'Loja Amazônia Viva', date: '21 Mai, 2026', pixKey: 'sac@amazoniaviva.com', grossAmount: 3400.00, feePercentage: 10, status: 'completed' },
    { id: 'w5', storeName: 'Empório do Norte', date: '20 Mai, 2026', pixKey: 'emporio@tefe.am.br', grossAmount: 900.00, feePercentage: 10, status: 'completed' }
  ]);

  const handlePayout = (id: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    
    if (confirm(`Deseja efetuar a liberação Pix de R$ ${(req.grossAmount * (1 - req.feePercentage / 100)).toFixed(2)} para ${req.storeName}?`)) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
      alert('⚡ Pix enviado com sucesso! Solicitação finalizada.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Contadores
  const totalCommissionBilling = 67530.00; // Simula faturamento da comissão
  const completedWithdrawalsSum = requests.filter(r => r.status === 'completed').reduce((acc, r) => acc + (r.grossAmount * (1 - r.feePercentage / 100)), 0);
  const pendingRequestsSum = requests.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.grossAmount, 0);

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Central Financeira Master</h1>
          <p style={styles.pageSubtitle}>Acompanhe o faturamento de comissões, gerencie repasses Pix pendentes e audite a carteira global.</p>
        </div>
      </section>

      {/* Bento Grid KPIs */}
      <section style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Faturamento com Comissões</span>
          <div style={{ ...styles.metricValue, color: 'var(--tertiary)' }}>{formatCurrency(totalCommissionBilling)}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de Repasses Pagos</span>
          <div style={{ ...styles.metricValue, color: 'var(--primary)' }}>{formatCurrency(completedWithdrawalsSum)}</div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Aguardando Liberação</span>
          <div style={{ ...styles.metricValue, color: 'var(--secondary)' }}>{formatCurrency(pendingRequestsSum)}</div>
        </div>
      </section>

      {/* Withdrawal Requests Card */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Solicitações de Resgates Pix</h3>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Lojista Solicitante</th>
                <th style={styles.th}>Data de Solicitação</th>
                <th style={styles.th}>Chave Pix</th>
                <th style={styles.th}>Valor Bruto</th>
                <th style={styles.th}>Taxa Plataforma</th>
                <th style={styles.th}>Valor Líquido</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const isPending = r.status === 'pending';
                const netAmount = r.grossAmount * (1 - r.feePercentage / 100);
                const platformFee = r.grossAmount * (r.feePercentage / 100);
                
                return (
                  <tr key={r.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{r.storeName}</td>
                    <td style={styles.td}>{r.date}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>{r.pixKey}</td>
                    <td style={styles.td}>{formatCurrency(r.grossAmount)}</td>
                    <td style={{ ...styles.td, color: 'var(--error)', fontWeight: '600' }}>
                      -{formatCurrency(platformFee)} ({r.feePercentage}%)
                    </td>
                    <td style={{ ...styles.td, fontWeight: '750', color: 'var(--tertiary)' }}>{formatCurrency(netAmount)}</td>

                    {/* Status Badge */}
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: !isPending 
                          ? 'rgba(26, 115, 18, 0.08)' 
                          : 'rgba(254, 107, 0, 0.08)',
                        color: !isPending ? 'var(--tertiary)' : 'var(--secondary)'
                      }}>
                        {isPending ? 'Aguardando Aprovação' : 'Pago via Pix'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {isPending ? (
                        <button 
                          onClick={() => handlePayout(r.id)}
                          style={styles.payoutBtn}
                        >
                          Confirmar Repasse Pix ⚡
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--tertiary)', fontWeight: '800' }}>Aprovado ✓</span>
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
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  payoutBtn: {
    padding: '6px 14px',
    backgroundColor: 'var(--secondary-container)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(254, 107, 0, 0.1)',
    transition: 'all 0.2s',
  }
};
