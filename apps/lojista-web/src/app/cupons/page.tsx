'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService, DBCoupon, DBProduct } from '../../services/lojista';

// Mock de Cupons padrão do Figma
const DEMO_COUPONS = [
  { code: 'TEFE10', discount: '10% de desconto', maxUses: 100, usesCount: 45, status: 'active' },
  { code: 'BEMVINDO5', discount: '5% de desconto', maxUses: 50, usesCount: 12, status: 'active' },
  { code: 'NATAL23', discount: '15% de desconto', maxUses: 100, usesCount: 100, status: 'expired' }
];

// Mock de produtos para o Gestor de Ofertas
const OFFER_PRODUCTS_DEMO = [
  {
    id: 'demo-1',
    title: 'Castanha-do-Pará (500g)',
    category: 'Alimentos',
    stock: 42,
    price: 45.00,
    img: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'demo-2',
    title: 'Tigela em Madeira Nobre',
    category: 'Artesanato',
    stock: 12,
    price: 120.00,
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'demo-3',
    title: 'Polpa de Açaí Especial (1L)',
    category: 'Bebidas',
    stock: 85,
    price: 22.00,
    img: 'https://images.unsplash.com/photo-1563865436874-9aef32095ffd?auto=format&fit=crop&q=80&w=300'
  }
];

export default function PromotionsPage() {
  const { store } = useLojista();
  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states de criação
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('10');
  const [maxUses, setMaxUses] = useState('100');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Checkboxes de produtos no Gestor de Ofertas
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: string]: boolean }>({
    'demo-1': true,
    'demo-2': true,
    'demo-3': true
  });

  const loadPromotionsData = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const couponList = await lojistaService.fetchStoreCoupons(store.id);
      setCoupons(couponList);

      const prodList = await lojistaService.fetchStoreProducts(store.id);
      setProducts(prodList);

      // Pré-marca os produtos reais da loja
      const selectMap: { [key: string]: boolean } = {};
      prodList.forEach(p => {
        selectMap[p.id] = true;
      });
      setSelectedProductIds(selectMap);
    } catch (err) {
      console.error('Erro ao buscar dados de promoções:', err);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadPromotionsData();
  }, [loadPromotionsData]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const val = parseFloat(discountValue);
    const uses = parseInt(maxUses);

    if (!code.trim()) {
      setFeedback({ type: 'error', message: 'Digite o código do cupom.' });
      return;
    }
    if (isNaN(val) || val <= 0) {
      setFeedback({ type: 'error', message: 'Defina um desconto válido.' });
      return;
    }

    setSubmitting(true);
    try {
      // Cria o cupom no banco de dados
      const success = await lojistaService.createStoreCoupon(
        store.id,
        code.toUpperCase(),
        val,
        'percent',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        uses
      );

      if (success) {
        setFeedback({
          type: 'success',
          message: `Cupom ${code.toUpperCase()} criado e publicado com sucesso!`
        });
        setCode('');
        setDiscountValue('10');
        await loadPromotionsData();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao cadastrar cupom. O código já existe.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Falha na conexão com o banco de dados.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedCount = Object.values(selectedProductIds).filter(Boolean).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Prepara itens para o Gestor de Ofertas
  const isDemoProducts = products.length === 0;
  const displayProducts = isDemoProducts
    ? OFFER_PRODUCTS_DEMO
    : products.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        stock: p.stock,
        price: p.current_price,
        img: p.images?.[0] || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=300'
      }));

  // Prepara cupons ativos
  const isDemoCoupons = coupons.length === 0;
  const displayCoupons = isDemoCoupons
    ? DEMO_COUPONS
    : coupons.map(c => ({
        code: c.code,
        discount: c.type === 'percent' ? `${c.discount_value}% de desconto` : formatCurrency(c.discount_value),
        maxUses: c.max_uses,
        usesCount: c.uses_count,
        status: new Date(c.expires_at) < new Date() ? 'expired' : 'active'
      }));

  return (
    <div style={styles.container}>
      
      {/* Top Header Row */}
      <section style={styles.headerRow}>
        <h1 style={styles.pageTitle}>Central de Promoções</h1>
        <button 
          onClick={() => alert('Crie uma nova campanha sazonal para promover seus produtos!')}
          style={styles.newCampaignBtn}
        >
          + Nova Campanha
        </button>
      </section>

      {/* Grid Principal (Split de Ofertas e Emissão) */}
      <div style={styles.mainGrid}>
        
        {/* Lado Esquerdo: Gestor de Ofertas */}
        <section style={styles.gestorCard}>
          <div style={styles.gestorHeader}>
            <div>
              <h2 style={styles.cardTitle}>Gestor de Ofertas</h2>
              <p style={styles.cardSubtitle}>Aplique descontos em massa no seu catálogo de Tefé</p>
            </div>
            
            <div style={styles.actionBlock}>
              <span style={styles.selectedCountText}>{selectedCount} itens selecionados</span>
              <button 
                onClick={() => alert(`Aplicado 10% OFF nos ${selectedCount} itens selecionados do catálogo.`)}
                style={styles.applyBtn}
                disabled={selectedCount === 0}
              >
                Aplicar 10% OFF
              </button>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={{ ...styles.th, width: '40px' }} />
                  <th style={styles.th}>Produto</th>
                  <th style={styles.th}>Estoque</th>
                  <th style={styles.th}>Preço Atual</th>
                  <th style={styles.th}>Sugerido (-10%)</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map((prod) => (
                  <tr key={prod.id} style={styles.tr}>
                    <td style={styles.td}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedProductIds[prod.id]} 
                        onChange={() => handleToggleSelectProduct(prod.id)}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.prodInfo}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prod.img} alt={prod.title} style={styles.prodImg} />
                        <div style={styles.prodText}>
                          <span style={styles.prodTitle}>{prod.title}</span>
                          <span style={styles.categoryBadge}>{prod.category}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--on-surface-variant)', fontWeight: '600' }}>
                      {prod.stock} unidades
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--secondary)' }}>
                      {formatCurrency(prod.price * 0.9)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Lado Direito: Gerador de Cupons + Cupons Ativos */}
        <div style={styles.rightColumn}>
          
          {/* Card 1: Gerador de Cupons */}
          <section style={styles.promoRightCard}>
            <h2 style={styles.cardTitle}>Gerador de Cupons</h2>
            
            {feedback && (
              <div style={{
                ...styles.feedbackBox,
                backgroundColor: feedback.type === 'success' ? 'rgba(26, 115, 18, 0.08)' : 'rgba(186, 26, 26, 0.08)',
                color: feedback.type === 'success' ? 'var(--tertiary)' : 'var(--error)'
              }}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Código do Cupom</label>
                <input 
                  type="text" 
                  placeholder="EX: TEFE10" 
                  style={styles.formInput}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>Desconto (%)</label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    style={styles.formInput}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>
                
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>Limite de Uso</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    style={styles.formInput}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" style={styles.createBtn} disabled={submitting}>
                {submitting ? 'Criando...' : 'Criar Cupom'}
              </button>
            </form>
          </section>

          {/* Card 2: Cupons Ativos */}
          <section style={styles.promoRightCard}>
            <h2 style={styles.cardTitle}>Cupons Ativos</h2>
            
            <div style={styles.couponsList}>
              {displayCoupons.map((coupon, idx) => {
                const isActive = coupon.status === 'active';
                return (
                  <div key={idx} style={styles.couponItem}>
                    <div>
                      <span style={styles.couponCode}>{coupon.code}</span>
                      <span style={styles.couponDesc}>{coupon.discount} • {coupon.usesCount}/{coupon.maxUses} usos</span>
                    </div>
                    {isActive ? (
                      <span style={styles.activePill}>ATIVO</span>
                    ) : (
                      <span style={styles.expiredPill}>EXPIRADO</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </div>

      {/* Calendário de Ofertas (Sazonal) */}
      <section style={styles.calendarCard}>
        <div style={styles.calendarHeaderRow}>
          <div>
            <h2 style={styles.cardTitle}>Calendário de Ofertas</h2>
            <p style={styles.cardSubtitle}>Planejamento sazonal para o comércio de Tefé</p>
          </div>
          
          <div style={styles.calendarControls}>
            <button style={styles.calendarNavBtn} onClick={() => alert('Voltar mês.')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            <div style={styles.monthDisplayBox}>Novembro 2024</div>
            <button style={styles.calendarNavBtn} onClick={() => alert('Próximo mês.')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </div>

        {/* Grade do Calendário */}
        <div style={styles.calendarGrid}>
          
          {/* Cabeçalho de Dias da Semana */}
          <div style={styles.calendarWeekdaysRow}>
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d) => (
              <span key={d} style={styles.weekdayLabel}>{d}</span>
            ))}
          </div>

          {/* Células de Dias */}
          <div style={styles.calendarDaysGrid}>
            {/* Dias de Outubro (Desabilitados/Greyed out) */}
            {[27, 28, 29, 30, 31].map((d) => (
              <div key={`prev-${d}`} style={styles.dayCellDisabled}>{d}</div>
            ))}
            
            {/* Dias de Novembro */}
            {[1, 2, 3, 4].map((d) => (
              <div key={`nov-${d}`} style={styles.dayCellActive}>{d}</div>
            ))}
            
            {/* Dia 5 com Campanha Ativa */}
            <div style={styles.dayCellCampaign}>
              <span>5</span>
              <div style={styles.campaignIndicatorDot} />
            </div>

            {/* Dias 6 a 9 de Novembro */}
            {[6, 7, 8, 9].map((d) => (
              <div key={`nov-${d}`} style={styles.dayCellActive}>{d}</div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}

// Estilos premium inline de acordo com o UÁRI Design System
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '8px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--primary)',
    fontFamily: 'Plus Jakarta Sans',
  },
  newCampaignBtn: {
    backgroundColor: 'var(--secondary-container)', // #fe6b00
    color: 'var(--on-secondary-container)', // #572000
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    alignItems: 'start',
  },
  gestorCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
  },
  gestorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--on-surface)',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    marginTop: '4px',
  },
  actionBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  selectedCountText: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: 'var(--primary-container)', // #8a2be2
    color: 'var(--on-primary-container)', // #eed9ff
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
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
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  td: {
    padding: '16px',
    fontSize: '15px',
    verticalAlign: 'middle',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--primary)',
    cursor: 'pointer',
  },
  prodInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  prodImg: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  prodText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  prodTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--on-surface)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--surface-container-low)',
    color: 'var(--on-surface-variant)',
    fontSize: '11px',
    fontWeight: '600',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  promoRightCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  feedbackBox: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--on-surface)',
  },
  formInput: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    outline: 'none',
    color: 'var(--on-surface)',
    backgroundColor: 'transparent',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  createBtn: {
    backgroundColor: 'var(--primary-container)', // #8a2be2
    color: 'var(--on-primary-container)', // #eed9ff
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s',
  },
  couponsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  couponItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid var(--surface-container-highest)',
    borderRadius: '8px',
  },
  couponCode: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--primary)',
    display: 'block',
  },
  couponDesc: {
    fontSize: '12px',
    color: 'var(--on-surface-variant)',
    marginTop: '2px',
    display: 'block',
  },
  activePill: {
    padding: '4px 10px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(26, 115, 18, 0.08)',
    color: 'var(--tertiary)',
    fontSize: '11px',
    fontWeight: '700',
  },
  expiredPill: {
    padding: '4px 10px',
    borderRadius: '9999px',
    backgroundColor: 'var(--surface-container-highest)',
    color: 'var(--on-surface-variant)',
    fontSize: '11px',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
  },
  calendarHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  calendarControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  calendarNavBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--outline-variant)',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--on-surface)',
  },
  monthDisplayBox: {
    padding: '8px 16px',
    border: '1px solid var(--outline-variant)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--on-surface)',
    backgroundColor: 'var(--surface)',
  },
  calendarGrid: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--surface-container-highest)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  calendarWeekdaysRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    backgroundColor: 'var(--surface-container-low)',
    borderBottom: '1px solid var(--surface-container-highest)',
    padding: '12px 0',
    textAlign: 'center',
  },
  weekdayLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--outline)',
    letterSpacing: '0.05em',
  },
  calendarDaysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridAutoRows: '80px',
  },
  dayCellDisabled: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '8px',
    borderRight: '1px solid var(--surface-container-highest)',
    borderBottom: '1px solid var(--surface-container-highest)',
    color: 'var(--surface-dim)',
    backgroundColor: 'var(--surface-container-low)',
    fontSize: '14px',
    fontWeight: '600',
  },
  dayCellActive: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '8px',
    borderRight: '1px solid var(--surface-container-highest)',
    borderBottom: '1px solid var(--surface-container-highest)',
    backgroundColor: '#ffffff',
    color: 'var(--on-surface)',
    fontSize: '14px',
    fontWeight: '600',
  },
  dayCellCampaign: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '8px',
    borderRight: '1px solid var(--surface-container-highest)',
    borderBottom: '1px solid var(--surface-container-highest)',
    backgroundColor: '#ffffff',
    color: 'var(--on-surface)',
    fontSize: '14px',
    fontWeight: '600',
  },
  campaignIndicatorDot: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--primary)',
    borderRadius: '4px',
    marginTop: '12px',
  }
};
