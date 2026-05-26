'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService, DBProduct } from '../../services/lojista';

// Dados reais e mockup do inventário de produtos do Figma
const CATALOG_DEMO = [
  {
    id: '#4492-TEF',
    title: 'Polpa de Açaí Especial 1L',
    category: 'Alimentos',
    price: '25,90',
    stock: 45,
    status: 'active',
    img: 'https://images.unsplash.com/photo-1563865436874-9aef32095ffd?auto=format&fit=crop&q=80&w=300',
    realId: 'demo-1'
  },
  {
    id: '#8821-ART',
    title: 'Cesto de Palha Tucumã G',
    category: 'Artesanato',
    price: '89,00',
    stock: 12,
    status: 'active',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300',
    realId: 'demo-2'
  },
  {
    id: '#1032-REG',
    title: 'Castanha do Pará Inteira 500g',
    category: 'Regional',
    price: '42,00',
    stock: 0,
    status: 'inactive',
    img: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=300',
    realId: 'demo-3'
  }
];

export default function CatalogPage() {
  const { store } = useLojista();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados locais para controlar alterações de preços e estoque em tempo real
  const [editedPrices, setEditedPrices] = useState<{ [key: string]: string }>({});
  const [editedStock, setEditedStock] = useState<{ [key: string]: number }>({});
  const [itemStatus, setItemStatus] = useState<{ [key: string]: string }>({});

  const loadProducts = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const prodList = await lojistaService.fetchStoreProducts(store.id);
      setProducts(prodList);

      // Inicia os estados locais com dados reais do banco
      const pricesInit: { [key: string]: string } = {};
      const stockInit: { [key: string]: number } = {};
      const statusInit: { [key: string]: string } = {};

      prodList.forEach(p => {
        pricesInit[p.id] = p.current_price.toFixed(2).replace('.', ',');
        stockInit[p.id] = p.stock;
        statusInit[p.id] = p.status === 'published' ? 'active' : 'inactive';
      });

      setEditedPrices(pricesInit);
      setEditedStock(stockInit);
      setItemStatus(statusInit);
    } catch (err) {
      console.error('Erro ao buscar catálogo de produtos:', err);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleStatus = (id: string) => {
    setItemStatus(prev => ({
      ...prev,
      [id]: prev[id] === 'active' ? 'inactive' : 'active'
    }));
  };

  const handlePriceChange = (id: string, val: string) => {
    setEditedPrices(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleStockChange = (id: string, val: number) => {
    setEditedStock(prev => ({
      ...prev,
      [id]: isNaN(val) ? 0 : val
    }));
  };

  // Filtragem de itens do Catálogo
  const isDemoMode = products.length === 0;
  
  const displayItems = isDemoMode
    ? CATALOG_DEMO
    : products.map(p => ({
        id: `#${p.id.slice(0, 5).toUpperCase()}-TEF`,
        title: p.title,
        category: p.category,
        price: editedPrices[p.id] || p.current_price.toFixed(2).replace('.', ','),
        stock: editedStock[p.id] !== undefined ? editedStock[p.id] : p.stock,
        status: itemStatus[p.id] || (p.status === 'published' ? 'active' : 'inactive'),
        img: p.images?.[0] || 'https://images.unsplash.com/photo-1563865436874-9aef32095ffd?auto=format&fit=crop&q=80&w=300',
        realId: p.id
      }));

  const filteredItems = displayItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* Top Header Row */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Gestão de Catálogo</h1>
          <p style={styles.pageSubtitle}>Controle seu estoque e preços em tempo real</p>
        </div>
      </section>

      {/* Grid de 4 Cards de Métricas Figma */}
      <section style={styles.metricsGrid}>
        
        {/* KPI 1: Total de Produtos */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(110, 0, 193, 0.05)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>folder_open</span>
            </div>
            <span style={styles.metricValue}>128</span>
          </div>
          <span style={styles.metricLabel}>Total de Produtos</span>
        </div>

        {/* KPI 2: Itens Ativos */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(26, 115, 18, 0.08)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '20px' }}>check_circle</span>
            </div>
            <span style={styles.metricValue}>114</span>
          </div>
          <span style={styles.metricLabel}>Itens Ativos</span>
        </div>

        {/* KPI 3: Estoque Baixo */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(160, 65, 0, 0.08)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>warning</span>
            </div>
            <span style={styles.metricValue}>14</span>
          </div>
          <span style={styles.metricLabel}>Estoque Baixo</span>
        </div>

        {/* KPI 4: Vendas Pausadas */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconBg, backgroundColor: 'rgba(186, 26, 26, 0.08)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: '20px' }}>pause_circle</span>
            </div>
            <span style={styles.metricValue}>6</span>
          </div>
          <span style={styles.metricLabel}>Vendas Pausadas</span>
        </div>

      </section>

      {/* Tabela de Inventário em Cartão Full-Width */}
      <section style={styles.inventoryCard}>
        
        {/* Sub-header de Inventário */}
        <div style={styles.inventoryHeader}>
          <h2 style={styles.inventoryTitle}>Inventário de Produtos</h2>
          <div style={styles.searchWrapper}>
            <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou categoria..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela Principal */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={{ ...styles.th, width: '100px' }}>Foto</th>
                <th style={styles.th}>Produto</th>
                <th style={styles.th}>Categoria</th>
                <th style={{ ...styles.th, width: '160px' }}>Preço Atual (R$)</th>
                <th style={{ ...styles.th, width: '160px' }}>Estoque</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '180px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const isItemActive = item.status === 'active';
                const isOutOfStock = item.stock === 0;
                
                return (
                  <tr key={idx} className="tr-hover" style={styles.tr}>
                    
                    {/* Foto */}
                    <td style={styles.td}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.img} alt={item.title} style={styles.prodImg} />
                    </td>

                    {/* Produto + ID */}
                    <td style={styles.td}>
                      <div style={styles.prodDetails}>
                        <span style={styles.prodTitle}>{item.title}</span>
                        <span style={styles.prodId}>ID: {item.id}</span>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{item.category}</span>
                    </td>

                    {/* Preço (Editável Inline) */}
                    <td style={styles.td}>
                      <div style={styles.inputEditWrapper}>
                        <input 
                          type="text" 
                          value={item.price} 
                          onChange={(e) => handlePriceChange(item.realId || String(idx), e.target.value)}
                          style={styles.priceInput}
                        />
                        <span className="material-symbols-outlined" style={styles.pencilIcon}>edit</span>
                      </div>
                    </td>

                    {/* Estoque (Editável Inline) */}
                    <td style={styles.td}>
                      <div style={styles.stockWrapper}>
                        <input 
                          type="number" 
                          value={item.stock} 
                          onChange={(e) => handleStockChange(item.realId || String(idx), parseInt(e.target.value))}
                          style={{
                            ...styles.stockInput,
                            borderColor: isOutOfStock ? 'var(--error)' : 'var(--outline-variant)'
                          }}
                        />
                        <span style={styles.stockUnit}>unid</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      {isItemActive ? (
                        <span style={styles.statusActive}>
                          <span style={styles.dotGreen}>●</span> Ativo
                        </span>
                      ) : (
                        <span style={styles.statusInactive}>
                          <span style={styles.dotRed}>●</span> Inativo
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {isItemActive ? (
                        <button 
                          onClick={() => toggleStatus(item.realId || String(idx))}
                          style={styles.pauseBtn}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pause_circle</span>
                          <span>Pausar Venda</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleStatus(item.realId || String(idx))}
                          style={styles.activateBtn}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffffff' }}>play_circle</span>
                          <span>Ativar Venda</span>
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação do Inventário */}
        <div style={styles.tableFooter}>
          <span style={styles.paginationText}>Exibindo 3 de 128 produtos</span>
          <div style={styles.paginationBtns}>
            <button style={styles.pageBtnDisabled} disabled>Anterior</button>
            <button style={styles.pageBtnActive} onClick={() => alert('Navegação para a próxima página de catálogo.')}>Próximo</button>
          </div>
        </div>

      </section>

      {/* Footer Inferior */}
      <footer style={styles.bottomFooter}>
        <div style={styles.verifiedRow}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>verified</span>
          <span style={styles.verifiedText}>Vendedor Verificado pela UÁRI em Tefé, Amazonas.</span>
        </div>
        <span style={styles.footerCopyright}>Quebra essa castanha — © 2024 UÁRI Shop Fácil</span>
      </footer>

    </div>
  );
}

// Estilos premium inline baseados fielmente no design e no mockup enviado
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
  pageSubtitle: {
    fontSize: '16px',
    color: 'var(--on-surface-variant)',
    marginTop: '4px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIconBg: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--on-surface)',
  },
  metricLabel: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  inventoryCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    overflow: 'hidden',
  },
  inventoryHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--surface-container-highest)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  inventoryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--on-surface)',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--on-surface-variant)',
    fontSize: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '9999px', // total rounded like screenshot search bar!
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    outline: 'none',
    color: 'var(--on-surface)',
    backgroundColor: 'transparent',
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
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  th: {
    padding: '16px 24px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--outline)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid var(--surface-container-highest)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '20px 24px',
    fontSize: '16px',
    verticalAlign: 'middle',
  },
  prodImg: {
    width: '56px',
    height: '56px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  prodDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  prodTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--on-surface)',
  },
  prodId: {
    fontSize: '12px',
    color: 'var(--on-surface-variant)',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '9999px',
    backgroundColor: 'var(--surface-container)',
    color: 'var(--on-surface-variant)',
    fontSize: '13px',
    fontWeight: '600',
  },
  inputEditWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    width: '100px',
  },
  priceInput: {
    width: '80px',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: 'var(--secondary)',
    outline: 'none',
    textAlign: 'center',
  },
  pencilIcon: {
    fontSize: '16px',
    color: 'var(--outline)',
    cursor: 'pointer',
  },
  stockWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stockInput: {
    width: '64px',
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: 'var(--on-surface)',
    outline: 'none',
    textAlign: 'center',
  },
  stockUnit: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
  },
  statusActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(26, 115, 18, 0.08)',
    color: 'var(--tertiary)',
    fontSize: '13px',
    fontWeight: '700',
  },
  statusInactive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
    color: 'var(--error)',
    fontSize: '13px',
    fontWeight: '700',
  },
  dotGreen: {
    color: 'var(--tertiary)',
    fontSize: '14px',
  },
  dotRed: {
    color: 'var(--error)',
    fontSize: '14px',
  },
  pauseBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--outline-variant)',
    borderRadius: '8px',
    color: 'var(--on-surface)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  activateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--primary-container)', // Solid purple capsule!
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  tableFooter: {
    padding: '20px 24px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--surface-container-highest)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  paginationBtns: {
    display: 'flex',
    gap: '8px',
  },
  pageBtnDisabled: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--surface-container-highest)',
    borderRadius: '8px',
    color: 'var(--surface-dim)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  pageBtnActive: {
    padding: '8px 16px',
    backgroundColor: 'var(--primary-container)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  bottomFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid var(--surface-container-highest)',
  },
  verifiedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  verifiedText: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--on-surface-variant)',
  },
  footerCopyright: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: 'var(--on-surface-variant)',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '350px',
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
  }
};
