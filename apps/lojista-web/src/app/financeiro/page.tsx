'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLojista } from '../layout-client';
import { lojistaService, DBWallet, DBOrder, DBProduct } from '../../services/lojista';

// Mock do Fluxo de Caixa Detalhado conforme imagem do Figma
const INITIAL_TRANSACTIONS = [
  { date: '24 Out, 2023', orderId: '#UA-9482', client: 'Ana Paula Silva', gross: 450.00, fee: 45.00, net: 405.00 },
  { date: '24 Out, 2023', orderId: '#UA-9480', client: 'Carlos Mendes', gross: 120.00, fee: 12.00, net: 108.00 },
  { date: '23 Out, 2023', orderId: '#UA-9475', client: 'Maria das Graças', gross: 2400.00, fee: 240.00, net: 2160.00 },
  { date: '22 Out, 2023', orderId: '#UA-9470', client: 'Rodrigo Amazonas', gross: 89.90, fee: 8.99, net: 80.91 }
];

// Mock de Histórico de Saques
const WITHDRAWAL_HISTORY = [
  { amount: 5000.00, date: '15 Out, 2023', status: 'completed' },
  { amount: 1200.00, date: '12 Out, 2023', status: 'pending' }
];

// Planos Disponíveis para o Lojista
const PLANS = [
  {
    id: 'basic',
    name: 'UÁRI Inicial (Básico)',
    price: 0,
    limit: 5,
    benefits: ['Exposição standard na vitrine', 'Suporte básico via Chat', 'Pix direto offline']
  },
  {
    id: 'professional',
    name: 'UÁRI Impulso (Profissional)',
    price: 49.90,
    limit: 15,
    benefits: ['Selo "Vendedor Recomendado"', 'Prioridade média em buscas de Tefé', 'Suporte prioritário', 'Estatísticas básicas de vendas']
  },
  {
    id: 'premium',
    name: 'UÁRI Premium (Prêmio)',
    price: 99.90,
    limit: 30,
    benefits: ['Selo "Tefé\'s Choice"', 'Destaque no topo da Vitrine', 'Painel de Conciliação Automática', '0% de taxas de intermediação simulada']
  }
];

// Mock inicial de Custos/Gastos Operacionais
const INITIAL_EXPENSES = [
  { id: 1, category: 'Embalagem', description: 'Sacolas kraft personalizadas', value: 35.00 },
  { id: 2, category: 'Transporte', description: 'Combustível da lancha p/ entrega', value: 60.00 }
];

export default function FinanceiroPage() {
  const { store } = useLojista();
  const [wallet, setWallet] = useState<DBWallet | null>(null);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Planos
  const [currentPlanId, setCurrentPlanId] = useState<'basic' | 'professional' | 'premium'>('professional');

  // Estados de Custos/Gastos
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [expenseCat, setExpenseCat] = useState('Embalagem');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseVal, setExpenseVal] = useState('');

  // Estados de Solicitação de Inclusão de Produto
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('Alimentos');
  const [reqPrice, setReqPrice] = useState('');
  const [showInclusionFeedback, setShowInclusionFeedback] = useState(false);

  // Estados de Visibilidade/Ativação de Produtos do Catálogo (Gerenciamento de Vendas & Vitrine)
  const [catalogItems, setCatalogItems] = useState<Array<{ id: string; title: string; active: boolean; category: string; price: number; unitsSold: number; revenue: number }>>([
    { id: '1', title: 'Polpa de Açaí Especial 1L', active: true, category: 'Alimentos', price: 25.90, unitsSold: 42, revenue: 1087.80 },
    { id: '2', title: 'Cesto de Palha Tucumã G', active: true, category: 'Artesanato', price: 89.00, unitsSold: 18, revenue: 1602.00 },
    { id: '3', title: 'Castanha do Pará Inteira 500g', active: false, category: 'Regional', price: 42.00, unitsSold: 25, revenue: 1050.00 }
  ]);

  const loadFinancialData = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const walletData = await lojistaService.fetchStoreWallet(store.id);
      setWallet(walletData);

      const pendingOrders = await lojistaService.fetchPendingOrders(store.id);
      setOrders(pendingOrders);

      // Sincroniza catálogo de produtos se houver dados reais no banco
      const prods = await lojistaService.fetchStoreProducts(store.id);
      if (prods && prods.length > 0) {
        setCatalogItems(prods.map((p, idx) => ({
          id: p.id,
          title: p.title,
          active: p.status === 'published',
          category: p.category || 'Regional',
          price: p.current_price,
          unitsSold: idx === 0 ? 42 : idx === 1 ? 18 : 5,
          revenue: (idx === 0 ? 42 : idx === 1 ? 18 : 5) * p.current_price
        })));
      }
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Função para adicionar gasto operacional
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(expenseVal);
    if (!expenseDesc.trim() || isNaN(val) || val <= 0) return;

    const newExp = {
      id: Date.now(),
      category: expenseCat,
      description: expenseDesc,
      value: val
    };

    setExpenses(prev => [...prev, newExp]);
    setExpenseDesc('');
    setExpenseVal('');
  };

  // Função para remover gasto operacional
  const handleRemoveExpense = (id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Solicitação de Inclusão de Produto/Serviço
  const handleRequestInclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqPrice) return;

    const priceNum = parseFloat(reqPrice) || 0.00;

    // Envia proposta de produto para o banco se conectado
    if (store?.id) {
      await lojistaService.createProductDraft(store.id, reqTitle, priceNum, reqCategory, '');
    }

    // Adiciona o produto solicitado temporariamente na lista do catálogo local
    const newProd = {
      id: String(Date.now()),
      title: reqTitle,
      active: false, // Inicializa como inativo aguardando curadoria/homologação
      category: reqCategory,
      price: priceNum,
      unitsSold: 0,
      revenue: 0.00
    };
    setCatalogItems(prev => [...prev, newProd]);

    setShowInclusionFeedback(true);
    setReqTitle('');
    setReqPrice('');
    
    setTimeout(() => {
      setShowInclusionFeedback(false);
    }, 4000);
  };

  // Alterna visibilidade do produto (Desativar/Ativar)
  const toggleProductActive = (id: string) => {
    setCatalogItems(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading && !wallet) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={styles.skeletonText}>Buscando relatórios financeiros...</p>
      </div>
    );
  }

  // Estatísticas e Valores Financeiros Reais ou Fallbacks Fidegnos
  const faturamentoValor = wallet && wallet.available_balance > 0 ? wallet.available_balance : 4250.00;
  const aReceberValor = wallet && wallet.escrow_balance > 0 ? wallet.escrow_balance : 1840.50;
  const totalVendasValor = 12400.00;

  // Cálculos de Margem e Custos Operacionais
  const totalGastos = expenses.reduce((acc, exp) => acc + exp.value, 0);
  const lucroLiquidoReal = faturamentoValor - (faturamentoValor * 0.10) - totalGastos; // Subtrai taxa UARI (10%) e gastos

  const totalRegisteredProducts = catalogItems.length;
  const currentPlan = PLANS.find(p => p.id === currentPlanId) || PLANS[1];

  return (
    <div style={styles.container}>
      
      {/* Top Title Section */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Financeiro e Conciliação</h1>
          <p style={styles.pageSubtitle}>Acompanhe seus rendimentos e gerencie suas transferências com segurança.</p>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.exportPdfBtn} onClick={() => alert('PDF do relatório financeiro exportado com sucesso!')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
            <span>Exportar PDF</span>
          </button>
          <button style={styles.exportExcelBtn} onClick={() => alert('Planilha XLS exportada com sucesso!')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffffff' }}>grid_on</span>
            <span>Exportar Excel</span>
          </button>
        </div>
      </section>

      {/* Grid de 3 Cards Principais */}
      <section style={styles.metricsGrid}>
        
        {/* Card 1: Saldo Disponível */}
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Saldo Disponível</span>
          <div style={{ ...styles.metricValue, color: 'var(--tertiary)' }}>{formatCurrency(faturamentoValor)}</div>
          <span style={styles.growthBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--tertiary)' }}>trending_up</span>
            <span>+12% que o mês anterior</span>
          </span>
        </div>

        {/* Card 2: A Receber */}
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>A Receber</span>
          <div style={{ ...styles.metricValue, color: 'var(--primary-container)' }}>{formatCurrency(aReceberValor)}</div>
          <span style={styles.metricHelper}>Próximo pagamento em 48h</span>
        </div>

        {/* Card 3: Total de Vendas */}
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de Vendas (Mês)</span>
          <div style={{ ...styles.metricValue, color: 'var(--secondary)' }}>{formatCurrency(totalVendasValor)}</div>
          <div style={styles.progressBarWrapper}>
            <div style={styles.progressBarFill} />
          </div>
          <span style={styles.metricHelper}>75% da meta mensal atingida</span>
        </div>

      </section>

      {/* Middle Section: Cashflow & Withdrawals */}
      <div style={styles.middleGrid}>
        
        {/* Left Column: Fluxo de Caixa Detalhado */}
        <section style={styles.leftCard}>
          <div style={styles.cardHeaderRow}>
            <h2 style={styles.cardTitle}>Fluxo de Caixa Detalhado</h2>
            <span style={styles.verifiedTag}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--tertiary)' }}>verified</span>
              <span>Verificado</span>
            </span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>ID Pedido</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Valor Bruto</th>
                  <th style={styles.th}>Taxa UÁRI</th>
                  <th style={styles.th}>Valor Líquido</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_TRANSACTIONS.map((t, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>{t.date}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>{t.orderId}</td>
                    <td style={styles.td}>{t.client}</td>
                    <td style={styles.td}>{formatCurrency(t.gross)}</td>
                    <td style={{ ...styles.td, color: 'var(--error)', fontWeight: '600' }}>-{formatCurrency(t.fee)}</td>
                    <td style={{ ...styles.td, color: 'var(--tertiary)', fontWeight: '700' }}>{formatCurrency(t.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Solicitar Saque & Histórico */}
        <div style={styles.rightColumn}>
          
          {/* Saque Card (Purple Figma style) */}
          <section style={styles.saqueCard}>
            <h2 style={styles.saqueTitle}>Solicitar Saque</h2>
            <p style={styles.saqueDesc}>Transfira seus lucros para sua conta bancária cadastrada com segurança.</p>
            
            <div style={styles.saqueValueBox}>
              <span style={styles.saqueValueLabel}>VALOR DO SAQUE</span>
              <span style={styles.saqueValueAmount}>{formatCurrency(faturamentoValor)}</span>
            </div>

            <button 
              onClick={() => alert(`Transferência de ${formatCurrency(faturamentoValor)} solicitada p/ chave Pix cadastrada.`)}
              style={styles.saqueBtn}
            >
              Confirmar Transferência
            </button>
            <span style={styles.saqueSubText}>Prazo de 1 a 3 dias úteis para compensação.</span>
          </section>

          {/* Histórico de Saques */}
          <section style={styles.rightInfoCard}>
            <h2 style={styles.cardTitle}>Histórico de Saques</h2>
            <div style={styles.saqueHistoryList}>
              {WITHDRAWAL_HISTORY.map((h, idx) => (
                <div key={idx} style={styles.saqueHistoryItem}>
                  <div style={styles.saqueHistoryLeft}>
                    {h.status === 'completed' ? (
                      <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '20px' }}>check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>pending</span>
                    )}
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>{formatCurrency(h.amount)}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--on-surface-variant)' }}>{h.date}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: h.status === 'completed' ? 'var(--tertiary)' : 'var(--secondary)'
                  }}>
                    {h.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>

      {/* Operacional Section: Gerenciamento de Planos e Limites */}
      <section style={styles.leftCard}>
        <div style={styles.cardHeaderRow}>
          <div>
            <h2 style={styles.cardTitle}>Plano e Limite do Catálogo</h2>
            <p style={styles.cardSubtitle}>Confira os benefícios do seu plano e a ocupação do seu catálogo de vitrine.</p>
          </div>
          <div style={styles.planBadgeContainer}>
            <span style={styles.planBadgeActive}>{currentPlan.name}</span>
          </div>
        </div>

        {/* Barra de Progresso de Limite de Produtos */}
        <div style={styles.planUsageWrapper}>
          <div style={styles.planUsageText}>
            <span>Ocupação do Catálogo: <strong>{totalRegisteredProducts}</strong> de <strong>{currentPlan.limit}</strong> produtos cadastrados</span>
            <span>{Math.round((totalRegisteredProducts / currentPlan.limit) * 100)}%</span>
          </div>
          <div style={styles.planProgressBarBg}>
            <div style={{
              ...styles.planProgressBarFill,
              width: `${Math.min((totalRegisteredProducts / currentPlan.limit) * 100, 100)}%`
            }} />
          </div>
        </div>

        {/* Escolha e Tabela de Planos */}
        <div style={styles.plansGrid}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div 
                key={plan.id} 
                onClick={() => setCurrentPlanId(plan.id as any)}
                style={{
                  ...styles.planCard,
                  borderColor: isCurrent ? 'var(--primary)' : 'var(--outline-variant)',
                  borderWidth: isCurrent ? '2px' : '1px'
                }}
              >
                <div style={styles.planCardHeader}>
                  <span style={styles.planCardName}>{plan.name}</span>
                  <span style={styles.planCardPrice}>
                    {plan.price === 0 ? 'Grátis' : `${formatCurrency(plan.price)}/mês`}
                  </span>
                </div>
                <p style={styles.planCardLimit}>Até {plan.limit} produtos expostos</p>
                <ul style={styles.planCardBenefits}>
                  {plan.benefits.map((b, i) => (
                    <li key={i} style={styles.benefitItem}>✓ {b}</li>
                  ))}
                </ul>
                <button 
                  style={{
                    ...styles.planCardBtn,
                    backgroundColor: isCurrent ? 'var(--primary)' : 'transparent',
                    color: isCurrent ? '#ffffff' : 'var(--primary)',
                    border: isCurrent ? 'none' : '1px solid var(--primary)'
                  }}
                >
                  {isCurrent ? 'Plano Ativo' : 'Mudar de Plano'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operacional Section: Adicionar Gastos & Controle de Visibilidade */}
      <div style={styles.middleGrid}>
        
        {/* Lado Esquerdo: Controle de Visibilidade e Inclusão */}
        <div style={styles.leftColumnCol}>
          
          {/* Desativar/Ativar Produtos & Gerenciamento de Vendas */}
          <section style={styles.leftCard}>
            <h2 style={styles.cardTitle}>Gerenciamento de Vendas e Visibilidade do Catálogo</h2>
            <p style={styles.cardSubtitle}>Monitore o desempenho de vendas individuais e desative produtos para torná-los invisíveis aos consumidores na vitrine de Tefé.</p>
            
            <div style={{ ...styles.tableWrapper, marginTop: '20px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>Produto</th>
                    <th style={styles.th}>Categoria</th>
                    <th style={styles.th}>Preço</th>
                    <th style={styles.th}>Vendas</th>
                    <th style={styles.th}>Receita</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogItems.map((prod) => (
                    <tr key={prod.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '700', padding: '12px' }}>{prod.title}</td>
                      <td style={{ ...styles.td, padding: '12px' }}>
                        <span style={styles.expenseCatTag}>{prod.category}</span>
                      </td>
                      <td style={{ ...styles.td, padding: '12px' }}>{formatCurrency(prod.price)}</td>
                      <td style={{ ...styles.td, fontWeight: '600', padding: '12px' }}>{prod.unitsSold} un</td>
                      <td style={{ ...styles.td, color: 'var(--tertiary)', fontWeight: '700', padding: '12px' }}>{formatCurrency(prod.revenue)}</td>
                      <td style={{ ...styles.td, padding: '12px' }}>
                        <span style={{
                          ...styles.statusDotLabel,
                          color: prod.active ? 'var(--tertiary)' : 'var(--error)',
                          backgroundColor: prod.active ? 'rgba(26, 115, 18, 0.08)' : 'rgba(186, 26, 26, 0.08)',
                          padding: '2px 8px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ marginRight: '4px' }}>●</span>
                          {prod.active ? 'Visível' : 'Oculto'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', padding: '12px' }}>
                        <button 
                          onClick={() => toggleProductActive(prod.id)}
                          style={{
                            ...styles.toggleVisBtn,
                            backgroundColor: prod.active ? 'rgba(186, 26, 26, 0.08)' : 'rgba(26, 115, 18, 0.08)',
                            color: prod.active ? 'var(--error)' : 'var(--tertiary)'
                          }}
                        >
                          {prod.active ? 'Desativar' : 'Reativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Solicitar Inclusão de Produto/Serviço */}
          <section style={{ ...styles.leftCard, marginTop: '16px' }}>
            <h2 style={styles.cardTitle}>Solicitar Inclusão de Produto / Serviço</h2>
            <p style={styles.cardSubtitle}>Envie uma proposta de novo produto para a curadoria aprovar no catálogo.</p>
            
            {showInclusionFeedback && (
              <div style={styles.feedbackInclusion}>
                ✓ Proposta enviada com sucesso! O item foi pré-inserido no gerenciador de visibilidade acima como inativo e aguarda homologação estética da curadoria.
              </div>
            )}

            <form onSubmit={handleRequestInclusion} style={styles.inclusionForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nome do Produto/Serviço</label>
                <input 
                  type="text" 
                  placeholder="Ex: Óleo de Copaíba Puro 100ml" 
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  style={styles.formInput}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>Categoria</label>
                  <select 
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value)}
                    style={styles.formSelect}
                  >
                    <option value="Alimentos">Alimentos</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Artesanato">Artesanato</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>Preço Sugerido (Custo)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="R$ 0,00" 
                    value={reqPrice}
                    onChange={(e) => setReqPrice(e.target.value)}
                    style={styles.formInput}
                    required
                  />
                </div>
              </div>
              <button type="submit" style={styles.inclusionBtn}>
                Enviar Proposta p/ Curadoria
              </button>
            </form>
          </section>

        </div>

        {/* Lado Direito: Adicionar Gastos & Custos Operacionais */}
        <section style={styles.leftCard}>
          <h2 style={styles.cardTitle}>Controle de Custos e Gastos</h2>
          <p style={styles.cardSubtitle}>Registre gastos reais operacionais de sua loja (transporte, sacolas) para acompanhar sua margem real de lucro.</p>
          
          <form onSubmit={handleAddExpense} style={styles.expenseForm}>
            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>Categoria Gasto</label>
                <select 
                  value={expenseCat} 
                  onChange={(e) => setExpenseCat(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="Embalagem">Embalagem</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Energia">Energia</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>Valor Gasto</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="R$ 0,00" 
                  value={expenseVal}
                  onChange={(e) => setExpenseVal(e.target.value)}
                  style={styles.formInput}
                  required
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Descrição do Gasto</label>
              <input 
                type="text" 
                placeholder="Ex: Compra de 50 sacolas kraft" 
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                style={styles.formInput}
                required
              />
            </div>
            <button type="submit" style={styles.expenseBtn}>
              Registrar Gasto
            </button>
          </form>

          {/* Listagem de Gastos Cadastrados */}
          <div style={styles.expenseList}>
            {expenses.map((exp) => (
              <div key={exp.id} style={styles.expenseItem}>
                <div>
                  <span style={styles.expenseCatTag}>{exp.category}</span>
                  <span style={styles.expenseDescText}>{exp.description}</span>
                </div>
                <div style={styles.expenseRight}>
                  <span style={styles.expenseValText}>-{formatCurrency(exp.value)}</span>
                  <button onClick={() => handleRemoveExpense(exp.id)} style={styles.deleteExpenseBtn}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Caixa de Lucro Líquido Real */}
          <div style={styles.profitCalculationCard}>
            <span style={styles.profitLabel}>LUCRO LÍQUIDO REAL ESTIMADO</span>
            <div style={styles.profitValue}>{formatCurrency(lucroLiquidoReal)}</div>
            <span style={styles.profitSubtext}>Deduções: 10% Taxa UÁRI + {formatCurrency(totalGastos)} gastos</span>
          </div>

        </section>

      </div>

    </div>
  );
}

// Estilos premium inline baseados no UÁRI Design System e no mockup
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '8px',
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
  headerBtns: {
    display: 'flex',
    gap: '12px',
  },
  exportPdfBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '1px solid var(--primary)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--primary)',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  exportExcelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'var(--secondary-container)', // #fe6b00
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  metricLabel: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    marginTop: '6px',
    marginBottom: '6px',
  },
  growthBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--tertiary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metricHelper: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
  },
  progressBarWrapper: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--surface-container)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '6px',
    marginBottom: '6px',
  },
  progressBarFill: {
    width: '75%',
    height: '100%',
    backgroundColor: 'var(--secondary)', // laranja escuro/marrom
  },
  middleGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    alignItems: 'start',
  },
  leftCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
  },
  cardHeaderRow: {
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
  verifiedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(26, 115, 18, 0.08)',
    color: 'var(--tertiary)',
    fontSize: '12px',
    fontWeight: '700',
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
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '15px',
    color: 'var(--on-surface)',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  saqueCard: {
    backgroundColor: 'var(--primary)',
    borderRadius: '8px',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  saqueTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
  },
  saqueDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '20px',
    marginTop: '8px',
  },
  saqueValueBox: {
    backgroundColor: 'var(--primary-container)', // Roxo claro
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  saqueValueLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#eed9ff',
    letterSpacing: '0.05em',
  },
  saqueValueAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
  },
  saqueBtn: {
    backgroundColor: 'var(--secondary-container)', // Laranja #fe6b00
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    marginTop: '20px',
    transition: 'all 0.2s',
  },
  saqueSubText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: '12px',
  },
  rightInfoCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '8px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(110, 0, 193, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  saqueHistoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  saqueHistoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--surface-container-low)',
  },
  saqueHistoryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  planBadgeContainer: {
    alignSelf: 'flex-start',
  },
  planBadgeActive: {
    padding: '6px 16px',
    backgroundColor: 'rgba(110, 0, 193, 0.1)',
    color: 'var(--primary)',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
  },
  planUsageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
    marginBottom: '24px',
  },
  planUsageText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
  },
  planProgressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--surface-container)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  planProgressBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary)',
    borderRadius: '4px',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  planCard: {
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid var(--outline-variant)',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  planCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  planCardName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--on-surface)',
    maxWidth: '60%',
  },
  planCardPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  planCardLimit: {
    fontSize: '13px',
    color: 'var(--on-surface-variant)',
    fontWeight: '600',
    marginBottom: '16px',
  },
  planCardBenefits: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  benefitItem: {
    fontSize: '12px',
    color: 'var(--on-surface-variant)',
    lineHeight: '16px',
  },
  planCardBtn: {
    marginTop: 'auto',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  leftColumnCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  catalogControlList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  catalogControlItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid var(--surface-container-highest)',
    borderRadius: '8px',
  },
  catalogControlRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statusDotLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '700',
  },
  toggleVisBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  inclusionForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
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
  },
  formSelect: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: 'var(--on-surface)',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  inclusionBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '750',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  feedbackInclusion: {
    padding: '12px',
    backgroundColor: 'rgba(26, 115, 18, 0.08)',
    color: 'var(--tertiary)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  expenseForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  expenseBtn: {
    backgroundColor: 'var(--secondary)', // Marrom/Laranja a04100
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '8px',
  },
  expenseCatTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--surface-container-highest)',
    color: 'var(--on-surface-variant)',
    fontSize: '10px',
    fontWeight: '700',
    marginRight: '8px',
  },
  expenseDescText: {
    fontSize: '13px',
    color: 'var(--on-surface)',
    fontWeight: '600',
  },
  expenseRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  expenseValText: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--error)',
  },
  deleteExpenseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--outline)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  profitCalculationCard: {
    backgroundColor: 'rgba(26, 115, 18, 0.05)',
    border: '1px dashed var(--tertiary)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profitLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--tertiary)',
    letterSpacing: '0.05em',
  },
  profitValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--tertiary)',
  },
  profitSubtext: {
    fontSize: '12px',
    color: 'var(--on-surface-variant)',
  }
};
