'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService, DBOrder } from '../../services/lojista';

// Mock de Entregadores locais de Tefé-AM
const COURIERS = [
  { id: 'c1', name: 'Lucas Souza (Moto)', status: 'Ativo' },
  { id: 'c2', name: 'Felipe Mota (Lancha/Moto)', status: 'Ativo' },
  { id: 'c3', name: 'Thiago Silva (Moto)', status: 'Ocupado' }
];

interface DeliveryOrder {
  id: string;
  clientName: string;
  address: string;
  value: number;
  paymentMethod: string;
  courierId: string;
  status: 'preparing' | 'in_transit' | 'delivered';
  date: string;
}

interface PickupOrder {
  id: string;
  clientName: string;
  code: string;
  value: number;
  paymentMethod: string;
  status: 'pending_pickup' | 'picked_up';
  date: string;
}

export default function EntregasPage() {
  const { store, refreshData } = useLojista();

  // Estados principais de Abas
  const [activeTab, setActiveTab] = useState<'delivery' | 'pickup' | 'history'>('delivery');

  // Estados dos Pedidos de Delivery
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([
    {
      id: 'UA-DLV-8492',
      clientName: 'Maria Eduarda Silva',
      address: 'Rua Quintino Bocaiúva, 245 - Centro, Tefé',
      value: 75.90,
      paymentMethod: 'Pix Offline',
      courierId: 'c1',
      status: 'in_transit',
      date: '26 Mai, 2026'
    },
    {
      id: 'UA-DLV-1039',
      clientName: 'Antônia de Souza',
      address: 'Estrada do Aeroporto, Km 2 - Juruá, Tefé',
      value: 120.00,
      paymentMethod: 'Pix Offline',
      courierId: '',
      status: 'preparing',
      date: '26 Mai, 2026'
    },
    {
      id: 'UA-DLV-9402',
      clientName: 'Clarice Amazonas',
      address: 'Beco do Comércio, 12 - Beira Rio, Tefé',
      value: 45.00,
      paymentMethod: 'Dinheiro',
      courierId: 'c2',
      status: 'delivered',
      date: '25 Mai, 2026'
    }
  ]);

  // Estados dos Pedidos de Retirada
  const [pickups, setPickups] = useState<PickupOrder[]>([
    {
      id: 'UA-PKP-2831',
      clientName: 'Raimundo Nonato Costa',
      code: 'UARI92',
      value: 89.00,
      paymentMethod: 'Pix Offline',
      status: 'pending_pickup',
      date: '26 Mai, 2026'
    },
    {
      id: 'UA-PKP-1092',
      clientName: 'Glória da Costa Melo',
      code: 'UARI14',
      value: 35.00,
      paymentMethod: 'Dinheiro',
      status: 'picked_up',
      date: '25 Mai, 2026'
    }
  ]);

  // Estados do Simulador de Rastreamento ao Vivo
  const [trackingOrder, setTrackingOrder] = useState<DeliveryOrder | null>(null);
  const [trackingStep, setTrackingStep] = useState(0);

  // Estados do Validador de Retirada
  const [pickupInputCode, setPickupInputCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sincronização inicial com banco de dados (se houver pedidos reais)
  const syncWithDatabase = useCallback(async () => {
    if (!store?.id) return;
    try {
      const pending = await lojistaService.fetchPendingOrders(store.id);
      if (pending && pending.length > 0) {
        // Separa pedidos reais baseando-se no endereço ou tipo
        const dbDeliveries: DeliveryOrder[] = [];
        const dbPickups: PickupOrder[] = [];

        pending.forEach((order, idx) => {
          const clientName = order.client?.full_name || 'Comprador Tefé';
          const isPickup = idx % 2 === 1; // Distribuição demonstrativa
          
          if (isPickup) {
            dbPickups.push({
              id: `#${order.id.slice(0, 8).toUpperCase()}`,
              clientName,
              code: order.handshake_qr_code || order.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
              value: order.store_net,
              paymentMethod: order.payment_method === 'pix' ? 'Pix' : 'Dinheiro',
              status: order.status === 'completed' ? 'picked_up' : 'pending_pickup',
              date: new Date(order.created_at).toLocaleDateString('pt-BR')
            });
          } else {
            dbDeliveries.push({
              id: `#${order.id.slice(0, 8).toUpperCase()}`,
              clientName,
              address: 'Rua do Comércio, Centro - Tefé/AM',
              value: order.store_net,
              paymentMethod: order.payment_method === 'pix' ? 'Pix' : 'Dinheiro',
              courierId: idx === 0 ? 'c1' : '',
              status: order.status === 'completed' ? 'delivered' : 'preparing',
              date: new Date(order.created_at).toLocaleDateString('pt-BR')
            });
          }
        });

        if (dbDeliveries.length > 0) setDeliveries(prev => [...dbDeliveries, ...prev.filter(p => !p.id.startsWith('#'))]);
        if (dbPickups.length > 0) setPickups(prev => [...dbPickups, ...prev.filter(p => !p.id.startsWith('#'))]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [store?.id]);

  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  // Efeito do simulador de rastreamento no mini-mapa
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackingOrder) {
      interval = setInterval(() => {
        setTrackingStep(prev => (prev >= 4 ? 0 : prev + 1));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [trackingOrder]);

  // Atribuir entregador
  const handleAssignCourier = (orderId: string, courierId: string) => {
    setDeliveries(prev =>
      prev.map(d =>
        d.id === orderId 
          ? { ...d, courierId, status: courierId ? 'in_transit' : 'preparing' } 
          : d
      )
    );
    alert('🚀 Entregador designado! O pedido foi atualizado para "Em Trânsito".');
  };

  // Alterar status de entrega
  const handleUpdateDeliveryStatus = (orderId: string, status: 'preparing' | 'in_transit' | 'delivered') => {
    setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, status } : d));
    
    if (status === 'delivered') {
      alert('✓ Entrega confirmada! Saldo virtual liberado.');
      refreshData();
    }
  };

  // Validar código de retirada na loja
  const handleValidatePickupCode = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const targetCode = pickupInputCode.trim().toUpperCase();
    if (!targetCode) return;

    const matchingOrder = pickups.find(p => p.code.toUpperCase() === targetCode && p.status === 'pending_pickup');

    if (matchingOrder) {
      setPickups(prev => prev.map(p => p.id === matchingOrder.id ? { ...p, status: 'picked_up' } : p));
      setFeedback({ type: 'success', message: `✓ Sucesso! Pedido ${matchingOrder.id} liberado e retirado por ${matchingOrder.clientName}.` });
      setPickupInputCode('');
      refreshData();
    } else {
      setFeedback({ type: 'error', message: 'Código de liberação inválido ou pedido já retirado.' });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  const handleManualPickupRelease = (id: string) => {
    if (confirm('Confirmar a entrega física deste produto diretamente para o cliente?')) {
      setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'picked_up' } : p));
      alert('✓ Retirada confirmada e saldo liberado!');
      refreshData();
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Contadores
  const totalOrders = deliveries.length + pickups.length;
  const pendingDeliveriesCount = deliveries.filter(d => d.status !== 'delivered').length;
  const pendingPickupsCount = pickups.filter(p => p.status === 'pending_pickup').length;
  const completedCount = deliveries.filter(d => d.status === 'delivered').length + pickups.filter(p => p.status === 'picked_up').length;

  return (
    <div style={styles.container}>
      
      {/* Page Header */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Gestão de Entregas & Retiradas</h1>
          <p style={styles.pageSubtitle}>Acompanhe o andamento dos motoboys, apure retiradas na loja e rastreie entregas.</p>
        </div>
      </section>

      {/* Bento KPIs Grid */}
      <section style={styles.metricsGrid}>
        
        {/* Card 1: Total Pedidos */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(110, 0, 193, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>assignment</span>
            </div>
            <span style={styles.metricValue}>{totalOrders}</span>
          </div>
          <span style={styles.metricLabel}>Total de Pedidos</span>
        </div>

        {/* Card 2: Para Entregar */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(254, 107, 0, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>moped</span>
            </div>
            <span style={styles.metricValue}>{pendingDeliveriesCount}</span>
          </div>
          <span style={styles.metricLabel}>Entregas Pendentes</span>
        </div>

        {/* Card 3: Retiradas pendentes */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(26, 115, 18, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '20px' }}>storefront</span>
            </div>
            <span style={styles.metricValue}>{pendingPickupsCount}</span>
          </div>
          <span style={styles.metricLabel}>Retiradas Pendentes</span>
        </div>

        {/* Card 4: Entregues */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(110, 0, 193, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>task_alt</span>
            </div>
            <span style={styles.metricValue}>{completedCount}</span>
          </div>
          <span style={styles.metricLabel}>Concluídos com Sucesso</span>
        </div>

      </section>

      {/* Rastreamento ao Vivo Simulador (Wow factor map) */}
      {trackingOrder && (
        <section style={styles.trackingSectionCard}>
          <div style={styles.trackingHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '24px' }}>share_location</span>
              <h3 style={styles.cardTitle}>Rastreamento em Tempo Real (Tefé/AM)</h3>
            </div>
            <button onClick={() => setTrackingOrder(null)} style={styles.closeTrackingBtn}>Fechar Mapa ✕</button>
          </div>

          <div style={styles.trackingMapWrapper}>
            {/* Mock do Mapa do Centro de Tefé - representação estética estilizada */}
            <div style={styles.mapCanvas}>
              
              {/* Ruas fictícias desenhadas com linhas */}
              <div style={{ ...styles.mapRoad, top: '40%', left: '10%', width: '80%', height: '4px', transform: 'rotate(-5deg)' }} />
              <div style={{ ...styles.mapRoad, top: '20%', left: '40%', width: '4px', height: '60%' }} />
              
              {/* Rio Solimões / Lago de Tefé sutil azul */}
              <div style={styles.riverSection}>
                <span style={styles.riverLabel}>Lago de Tefé</span>
              </div>

              {/* Loja Icon (Início) */}
              <div style={{ ...styles.mapPin, top: '35%', left: '12%', backgroundColor: 'var(--primary)' }} title="Sua Loja (Origem)">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ffffff' }}>storefront</span>
              </div>

              {/* Cliente Icon (Destino) */}
              <div style={{ ...styles.mapPin, top: '33%', left: '80%', backgroundColor: 'var(--tertiary)' }} title="Cliente (Destino)">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ffffff' }}>home</span>
              </div>

              {/* Entregador Icon (Movimento simulado) */}
              <div style={{
                ...styles.mapPin,
                backgroundColor: 'var(--secondary)',
                position: 'absolute',
                transition: 'all 1.5s ease-in-out',
                top: '36%',
                left: trackingStep === 0 ? '15%' : trackingStep === 1 ? '32%' : trackingStep === 2 ? '40%' : trackingStep === 3 ? '60%' : '76%'
              }} title="Entregador em trânsito">
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#ffffff' }}>moped</span>
              </div>

            </div>

            {/* Status e Metas de Rastreamento */}
            <div style={styles.trackingStatusTextCard}>
              <span style={styles.trackingOrderRef}>Pedido: <strong>{trackingOrder.id}</strong></span>
              <span style={styles.trackingClientName}>Cliente: <strong>{trackingOrder.clientName}</strong></span>
              <span style={styles.trackingCourierName}>Entregador: <strong>{COURIERS.find(c => c.id === trackingOrder.courierId)?.name || 'Lucas Souza'}</strong></span>
              <div style={styles.trackingEtaWrapper}>
                <span style={styles.trackingEtaLabel}>PREVISÃO DE ENTREGA</span>
                <span style={styles.trackingEtaValue}>
                  {trackingStep === 0 ? '12 min (Preparando na Loja)' : trackingStep === 1 ? '8 min (Bairro Centro)' : trackingStep === 2 ? '6 min (Rua Juruá)' : trackingStep === 3 ? '3 min (Próximo ao endereço)' : 'Chegando ao local! 🛵'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Abas e Controle Operacional */}
      <section style={styles.card}>
        <div style={styles.tabsHeaderRow}>
          
          {/* Seletor de abas */}
          <div style={styles.tabsWrapper}>
            <button 
              onClick={() => setActiveTab('delivery')}
              style={{ ...styles.tabBtn, ...(activeTab === 'delivery' ? styles.tabBtnActive : {}) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_shipping</span>
              <span>Acompanhar Entregas (Delivery)</span>
            </button>
            <button 
              onClick={() => setActiveTab('pickup')}
              style={{ ...styles.tabBtn, ...(activeTab === 'pickup' ? styles.tabBtnActive : {}) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              <span>Retiradas na Loja (Pickups)</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{ ...styles.tabBtn, ...(activeTab === 'history' ? styles.tabBtnActive : {}) }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
              <span>Histórico de Pedidos Feitos</span>
            </button>
          </div>
        </div>

        {/* ================= ABA 1: ACOMPANHAR ENTREGAS (DELIVERY) ================= */}
        {activeTab === 'delivery' && (
          <div style={{ marginTop: '20px' }}>
            <p style={styles.cardSubtitle}>Gerencie as ordens de saídas de mercadorias para os motoboys da plataforma.</p>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>ID Pedido</th>
                    <th style={styles.th}>Cliente / Endereço</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Entregador</th>
                    <th style={styles.th}>Etapa</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((dlv) => {
                    const isDelivered = dlv.status === 'delivered';
                    const isInTransit = dlv.status === 'in_transit';
                    
                    return (
                      <tr key={dlv.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: '750', color: 'var(--primary)' }}>{dlv.id}</td>
                        <td style={styles.td}>
                          <div style={styles.clientMetaBox}>
                            <span style={{ fontWeight: '700' }}>{dlv.clientName}</span>
                            <span style={styles.clientSubText}>{dlv.address}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontWeight: '700', color: 'var(--tertiary)' }}>{formatCurrency(dlv.value)}</td>
                        
                        {/* Seletor do Entregador */}
                        <td style={styles.td}>
                          <select 
                            value={dlv.courierId}
                            disabled={isDelivered}
                            onChange={(e) => handleAssignCourier(dlv.id, e.target.value)}
                            style={styles.courierSelect}
                          >
                            <option value="">Aguardando Entregador...</option>
                            {COURIERS.map(c => (
                              <option key={c.id} value={c.id}>{c.name} - {c.status}</option>
                            ))}
                          </select>
                        </td>

                        {/* Status da entrega */}
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: isDelivered 
                              ? 'rgba(26, 115, 18, 0.08)' 
                              : (isInTransit ? 'rgba(254, 107, 0, 0.08)' : 'rgba(126, 115, 134, 0.08)'),
                            color: isDelivered ? 'var(--tertiary)' : (isInTransit ? 'var(--secondary)' : 'var(--outline)')
                          }}>
                            ● {isDelivered ? 'Entregue' : (isInTransit ? 'Em Trânsito' : 'Em Preparo')}
                          </span>
                        </td>

                        {/* Botões de Ação */}
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionBtnsContainer}>
                            {isInTransit && (
                              <button 
                                onClick={() => setTrackingOrder(dlv)}
                                style={styles.mapTrackBtn}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>share_location</span>
                                <span>Ver Mapa</span>
                              </button>
                            )}
                            
                            {!isDelivered ? (
                              <button 
                                onClick={() => handleUpdateDeliveryStatus(dlv.id, 'delivered')}
                                style={styles.completeBtn}
                              >
                                Concluir
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--tertiary)', fontWeight: '700' }}>Concluído ✓</span>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ABA 2: RETIRADAS NA LOJA (PICKUP) ================= */}
        {activeTab === 'pickup' && (
          <div style={{ marginTop: '20px' }}>
            
            {/* Validador de código rápido */}
            <div style={styles.pickupValidatorCard}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--on-surface)' }}>Validador de Código de Retirada (Handshake)</h4>
              <form onSubmit={handleValidatePickupCode} style={styles.pickupValForm}>
                <input 
                  type="text" 
                  placeholder="Insira o código de 6 dígitos (Ex: UARI92)" 
                  value={pickupInputCode}
                  onChange={(e) => setPickupInputCode(e.target.value)}
                  style={styles.pickupValInput}
                />
                <button type="submit" style={styles.pickupValBtn}>Liberar Retirada</button>
              </form>
              {feedback && (
                <div style={{
                  ...styles.feedbackText,
                  color: feedback.type === 'success' ? 'var(--tertiary)' : 'var(--error)'
                }}>
                  {feedback.message}
                </div>
              )}
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>ID Pedido</th>
                    <th style={styles.th}>Cliente / Retirante</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Chave de Retirada</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((pkp) => {
                    const isPickedUp = pkp.status === 'picked_up';
                    return (
                      <tr key={pkp.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: '750', color: 'var(--primary)' }}>{pkp.id}</td>
                        <td style={{ ...styles.td, fontWeight: '700' }}>{pkp.clientName}</td>
                        <td style={{ ...styles.td, fontWeight: '700', color: 'var(--tertiary)' }}>{formatCurrency(pkp.value)}</td>
                        
                        {/* Token Code */}
                        <td style={styles.td}>
                          <span style={styles.pickupCodeBadge}>{pkp.code}</span>
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: isPickedUp ? 'rgba(26, 115, 18, 0.08)' : 'rgba(254, 107, 0, 0.08)',
                            color: isPickedUp ? 'var(--tertiary)' : 'var(--secondary)'
                          }}>
                            {isPickedUp ? 'Retirado na Loja' : 'Aguardando Cliente'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          {!isPickedUp ? (
                            <button 
                              onClick={() => handleManualPickupRelease(pkp.id)}
                              style={styles.completeBtn}
                            >
                              Liberar Manualmente
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--tertiary)', fontWeight: '700' }}>Entregue ✓</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ABA 3: HISTÓRICO DE PEDIDOS REALIZADOS ================= */}
        {activeTab === 'history' && (
          <div style={{ marginTop: '20px' }}>
            <p style={styles.cardSubtitle}>Consulta geral e auditoria de compras realizadas e canal de aquisição.</p>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>ID Pedido</th>
                    <th style={styles.th}>Comprador</th>
                    <th style={styles.th}>Data de Compra</th>
                    <th style={styles.th}>Método</th>
                    <th style={styles.th}>Total</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...deliveries, ...pickups].map((ord) => {
                    const isCompleted = ord.status === 'delivered' || ord.status === 'picked_up';
                    return (
                      <tr key={ord.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: '750', color: 'var(--primary)' }}>{ord.id}</td>
                        <td style={{ ...styles.td, fontWeight: '700' }}>{ord.clientName}</td>
                        <td style={styles.td}>{ord.date}</td>
                        <td style={styles.td}>{ord.paymentMethod}</td>
                        <td style={{ ...styles.td, fontWeight: '700', color: 'var(--tertiary)' }}>{formatCurrency(ord.value)}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: isCompleted ? 'rgba(26, 115, 18, 0.08)' : 'rgba(254, 107, 0, 0.08)',
                            color: isCompleted ? 'var(--tertiary)' : 'var(--secondary)'
                          }}>
                            {isCompleted ? 'Finalizado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}

// Estilos Premium baseados no Design System UÁRI
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '8px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--primary)',
    fontFamily: 'Plus Jakarta Sans',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: 'var(--on-surface-variant)',
    marginTop: '4px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  metricIconBg: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--on-surface)',
  },
  metricLabel: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.03)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    marginTop: '4px',
  },
  tabsHeaderRow: {
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'var(--surface-container-low)',
    color: 'var(--on-surface-variant)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '16px',
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
    verticalAlign: 'middle',
  },
  clientMetaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  clientSubText: {
    fontSize: '11px',
    color: 'var(--outline)',
    fontWeight: '600',
  },
  courierSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    fontFamily: 'Plus Jakarta Sans',
    backgroundColor: '#ffffff',
    color: 'var(--on-surface)',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: '600',
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
  actionBtnsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
  },
  mapTrackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid var(--secondary)',
    borderRadius: '8px',
    color: 'var(--secondary)',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  completeBtn: {
    padding: '6px 16px',
    backgroundColor: 'var(--tertiary-container)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pickupValidatorCard: {
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: '1px solid var(--surface-container-highest)',
  },
  pickupValForm: {
    display: 'flex',
    gap: '12px',
    maxWidth: '500px',
  },
  pickupValInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: 'var(--on-surface)',
    textTransform: 'uppercase',
  },
  pickupValBtn: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '750',
    cursor: 'pointer',
  },
  feedbackText: {
    fontSize: '13px',
    fontWeight: '700',
  },
  pickupCodeBadge: {
    fontFamily: 'monospace',
    fontWeight: '800',
    color: 'var(--primary)',
    backgroundColor: 'rgba(110, 0, 193, 0.08)',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  trackingSectionCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '12px',
    border: '2px solid var(--secondary)',
    boxShadow: '0px 8px 30px rgba(254, 107, 0, 0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  trackingHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '12px',
  },
  closeTrackingBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--outline)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '750',
  },
  trackingMapWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
    alignItems: 'stretch',
    minHeight: '260px',
  },
  mapCanvas: {
    backgroundColor: '#0F172A', // Dark mode map canvas
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid var(--surface-container-highest)',
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '2px',
  },
  riverSection: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '40%',
    height: '45%',
    backgroundColor: 'rgba(30, 64, 175, 0.4)',
    borderTopLeftRadius: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riverLabel: {
    fontSize: '11px',
    color: '#60A5FA',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  mapPin: {
    position: 'absolute',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
    transform: 'translate(-50%, -50%)',
  },
  trackingStatusTextCard: {
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid var(--surface-container-highest)',
    justifyContent: 'center',
  },
  trackingOrderRef: {
    fontSize: '14px',
    color: 'var(--on-surface)',
  },
  trackingClientName: {
    fontSize: '14px',
    color: 'var(--on-surface)',
  },
  trackingCourierName: {
    fontSize: '14px',
    color: 'var(--on-surface)',
  },
  trackingEtaWrapper: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed var(--outline-variant)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  trackingEtaLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--secondary)',
    letterSpacing: '0.05em',
  },
  trackingEtaValue: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--secondary)',
  }
};
