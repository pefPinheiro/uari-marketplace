'use client';

import React, { useState } from 'react';

// Interfaces
interface ProductRequest {
  id: string;
  suggestedTitle: string;
  storeName: string;
  suggestedPrice: number;
  suggestedCategory: string;
  submittedAt: string;
  lojistaComment?: string;
  // Campos a serem enriquecidos pelo admin
  enrichedTitle: string;
  enrichedPrice: number;
  enrichedCategory: string;
  enrichedDescription: string;
  selectedImageId: string;
}

interface ImageAsset {
  id: string;
  name: string;
  svgType: 'copaiba' | 'acai' | 'basket' | 'nuts' | 'soap';
}

export default function CuradoriaProdutosPage() {
  // Banco de imagens UÁRI pré-carregadas (SVGs de alta fidelidade)
  const imageAssets: ImageAsset[] = [
    { id: 'img-copaiba', name: 'Óleo de Copaíba Garrafa Premium', svgType: 'copaiba' },
    { id: 'img-acai', name: 'Tigela de Açaí com Bananas', svgType: 'acai' },
    { id: 'img-basket', name: 'Cesto Tucumã Tradicional G', svgType: 'basket' },
    { id: 'img-nuts', name: 'Castanhas Selecionadas Tigela', svgType: 'nuts' },
    { id: 'img-soap', name: 'Sabonete de Argila e Andiroba', svgType: 'soap' }
  ];

  // Solicitações pendentes enviadas pelos lojistas de Tefé
  const [requests, setRequests] = useState<ProductRequest[]>([
    {
      id: 'req-1',
      storeName: 'Empório do Norte',
      suggestedTitle: 'Óleo de Copaíba Puro 100ml',
      suggestedPrice: 35.00,
      suggestedCategory: 'Regional',
      submittedAt: 'Hoje, 09:30',
      lojistaComment: 'Extraído de forma 100% sustentável no Médio Solimões. Excelente cicatrizante.',
      enrichedTitle: 'Óleo de Copaíba Puro da Amazônia 100ml',
      enrichedPrice: 35.00,
      enrichedCategory: 'Regional',
      enrichedDescription: 'Óleo de copaíba 100% puro e natural, extraído artesanalmente nas florestas do município de Tefé, Amazonas. Fiel aliado para cuidados terapêuticos e hidratação profunda da pele, com propriedades cicatrizantes e anti-inflamatórias comprovadas pelas tradições ribeirinhas.',
      selectedImageId: 'img-copaiba'
    },
    {
      id: 'req-2',
      storeName: 'Açaí de Tefé',
      suggestedTitle: 'Polpa de Açaí Especial Fina 5L',
      suggestedPrice: 110.00,
      suggestedCategory: 'Alimentos',
      submittedAt: 'Ontem, 16:45',
      lojistaComment: 'Batido na hora, sem conservantes, direto da feira de Tefé.',
      enrichedTitle: 'Polpa de Açaí Especial Orgânico - Galão 5 Litros',
      enrichedPrice: 110.00,
      enrichedCategory: 'Alimentos',
      enrichedDescription: 'Verdadeiro açaí puríssimo de Tefé, extraído de frutos colhidos de forma agroecológica e batido sob rigorosos padrões de qualidade local. Textura extremamente cremosa, rica em antioxidantes, ideal para revenda, bufês ou consumo familiar vigoroso.',
      selectedImageId: 'img-acai'
    },
    {
      id: 'req-3',
      storeName: 'Artesanato Tefé',
      suggestedTitle: 'Cesto Trançado de Tucumã',
      suggestedPrice: 89.00,
      suggestedCategory: 'Artesanato',
      submittedAt: '25 Mai, 11:20',
      lojistaComment: 'Trabalho feito à mão pela comunidade ribeirinha do lago de Tefé.',
      enrichedTitle: 'Cesto Organizador de Fibra de Tucumã Tecido à Mão',
      enrichedPrice: 89.00,
      enrichedCategory: 'Artesanato',
      enrichedDescription: 'Peça exclusiva de artesanato tefeense, tecida à mão por artesãs tradicionais utilizando a nobre fibra extraída da palmeira de Tucumã. Possui tingimento natural com padrões ancestrais geométricos, servindo como elemento decorativo de luxo ou organizador rústico.',
      selectedImageId: 'img-basket'
    }
  ]);

  // Lista de produtos já homologados e publicados na vitrine
  const [approvedProducts, setApprovedProducts] = useState<any[]>([
    {
      id: 'pub-1',
      title: 'Castanha do Pará Desidratada Inteira 500g',
      storeName: 'Empório do Norte',
      price: 45.00,
      category: 'Regional',
      approvedAt: 'Ontem às 14:10',
      imageId: 'img-nuts'
    }
  ]);

  // Estado do produto atualmente selecionado para edição
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('req-1');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Formulário ativo
  const activeRequest = requests.find(r => r.id === selectedRequestId);

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Atualizar campos do formulário ativo
  const updateActiveField = (field: keyof ProductRequest, value: any) => {
    if (!selectedRequestId) return;
    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequestId) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  // Aprovar e homologar o produto
  const handleApproveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    // Remove das pendências
    setRequests(prev => prev.filter(r => r.id !== activeRequest.id));

    // Adiciona na lista de publicados na vitrine
    const newPublished = {
      id: `pub-${Date.now()}`,
      title: activeRequest.enrichedTitle,
      storeName: activeRequest.storeName,
      price: activeRequest.enrichedPrice,
      category: activeRequest.enrichedCategory,
      approvedAt: 'Agora mesmo',
      imageId: activeRequest.selectedImageId
    };
    setApprovedProducts(prev => [newPublished, ...prev]);
    showNotification(`🎉 Produto "${activeRequest.enrichedTitle}" aprovado e publicado com sucesso na vitrine UÁRI!`);

    // Seleciona a próxima solicitação se houver
    const remaining = requests.filter(r => r.id !== activeRequest.id);
    if (remaining.length > 0) {
      setSelectedRequestId(remaining[0].id);
    } else {
      setSelectedRequestId(null);
    }
  };

  // Rejeitar proposta / Solicitar ajustes
  const handleRejectRequest = () => {
    if (!activeRequest) return;
    const comment = prompt(`Informe as correções que o lojista "${activeRequest.storeName}" precisa fazer em "${activeRequest.suggestedTitle}":`, 'Melhorar o preço sugerido ou revisar o lote disponível.');
    if (comment === null) return; // cancelado pelo admin

    setRequests(prev => prev.filter(r => r.id !== activeRequest.id));
    showNotification(`Rejeição enviada! O lojista da loja "${activeRequest.storeName}" foi notificado para corrigir o produto.`, 'info');

    // Seleciona a próxima
    const remaining = requests.filter(r => r.id !== activeRequest.id);
    setSelectedRequestId(remaining.length > 0 ? remaining[0].id : null);
  };

  // Renderizador das ilustrações vetoriais em SVG
  const renderProductIllustration = (svgType: string, width = 110, height = 110, style = {}) => {
    if (svgType === 'copaiba') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ ...styles.illustrationSvg, ...style }}>
          <rect width="100" height="100" rx="12" fill="#E8F5E9" />
          {/* Garrafa */}
          <path d="M42 35H58V80H42V35Z" fill="#795548" />
          <path d="M45 35V25H55V35H45Z" fill="#3E2723" />
          {/* Conta-gotas */}
          <path d="M50 15V25" stroke="#212121" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 15H54" stroke="#212121" strokeWidth="2" />
          <circle cx="50" cy="11" r="3" fill="#D32F2F" />
          {/* Rótulo */}
          <rect x="44" y="45" width="12" height="24" rx="1" fill="#FFF9C4" />
          <line x1="46" y1="50" x2="54" y2="50" stroke="#8D6E63" strokeWidth="2" />
          <line x1="46" y1="56" x2="54" y2="56" stroke="#8D6E63" strokeWidth="1" />
          {/* Folha */}
          <path d="M62 45C66 45 68 49 68 53C68 57 64 61 62 61C60 61 56 57 56 53C56 49 58 45 62 45Z" fill="#4CAF50" />
          <path d="M62 45V61" stroke="#2E7D32" strokeWidth="1" />
        </svg>
      );
    }
    if (svgType === 'acai') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ ...styles.illustrationSvg, ...style }}>
          <rect width="100" height="100" rx="12" fill="#F3E5F5" />
          {/* Tigela */}
          <path d="M20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50H20Z" fill="#4A148C" />
          {/* Açaí */}
          <ellipse cx="50" cy="50" rx="30" ry="12" fill="#311B92" />
          {/* Banana Slices */}
          <circle cx="36" cy="46" r="5" fill="#FFF59D" />
          <circle cx="36" cy="46" r="2" fill="#FFFDE7" />
          <circle cx="48" cy="48" r="5" fill="#FFF59D" />
          <circle cx="48" cy="48" r="2" fill="#FFFDE7" />
          {/* Granola */}
          <circle cx="62" cy="47" r="1.5" fill="#FFB74D" />
          <circle cx="58" cy="52" r="1.5" fill="#FFB74D" />
          <circle cx="66" cy="51" r="1.5" fill="#FFB74D" />
          {/* Colher */}
          <path d="M72 32L62 45L66 49L76 36L72 32Z" fill="#B0BEC5" />
          <circle cx="76" cy="32" r="4" fill="#CFD8DC" />
        </svg>
      );
    }
    if (svgType === 'basket') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ ...styles.illustrationSvg, ...style }}>
          <rect width="100" height="100" rx="12" fill="#EFEBE9" />
          {/* Cesto */}
          <path d="M25 45L30 75C30.5 78 33 80 36 80H64C67 80 69.5 78 70 75L75 45H25Z" fill="#D7CCC8" />
          <path d="M22 45C22 42.2386 24.2386 40 27 40H73C75.7614 40 78 42.2386 78 45H22Z" fill="#A1887F" />
          {/* Padrões geométricos ribeirinhos */}
          <path d="M32 50L38 60L44 50L50 60L56 50L62 60L68 50" stroke="#FF5722" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 65L40 73L46 65L52 73L58 65L64 73" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Alças */}
          <path d="M30 40C30 32 36 28 42 28" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 40C70 32 64 28 58 28" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }
    if (svgType === 'nuts') {
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ ...styles.illustrationSvg, ...style }}>
          <rect width="100" height="100" rx="12" fill="#FFF3E0" />
          {/* Tigela de Madeira */}
          <ellipse cx="50" cy="65" rx="35" ry="18" fill="#8D6E63" />
          <ellipse cx="50" cy="60" rx="32" ry="14" fill="#A1887F" />
          {/* Castanhas */}
          <path d="M38 56C34 56 31 52 35 46C39 40 45 42 45 48C45 54 42 56 38 56Z" fill="#D7CCC8" />
          <path d="M38 56C36 56 35 55 36 52C37 49 39 47 41 48" stroke="#5D4037" strokeWidth="1" />

          <path d="M52 52C48 52 45 47 49 42C53 37 59 39 59 44C59 49 56 52 52 52Z" fill="#D7CCC8" />
          <path d="M52 52C50 52 49 51 50 48C51 45 53 43 55 44" stroke="#5D4037" strokeWidth="1" />

          <path d="M64 58C60 58 58 53 62 48C66 43 72 45 72 50C72 55 68 58 64 58Z" fill="#E0D7D3" />
        </svg>
      );
    }
    // Soap
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ ...styles.illustrationSvg, ...style }}>
        <rect width="100" height="100" rx="12" fill="#ECEFF1" />
        {/* Barra de sabonete */}
        <path d="M25 40L35 30H70L60 40H25Z" fill="#90A4AE" />
        <rect x="25" y="40" width="35" height="25" rx="2" fill="#78909C" />
        <path d="M60 40L70 30V55L60 65V40Z" fill="#546E7A" />
        {/* Detalhes de argila / marca */}
        <ellipse cx="42" cy="52" rx="8" ry="4" fill="#CFD8DC" opacity="0.3" />
        <path d="M38 52H46" stroke="#ffffff" strokeWidth="1.5" />
        {/* Bolhas */}
        <circle cx="72" cy="24" r="4" fill="#ffffff" fillOpacity="0.4" stroke="#B0BEC5" strokeWidth="1" />
        <circle cx="78" cy="34" r="2.5" fill="#ffffff" fillOpacity="0.4" stroke="#B0BEC5" strokeWidth="1" />
        <circle cx="66" cy="38" r="1.5" fill="#ffffff" fillOpacity="0.4" stroke="#B0BEC5" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          ...styles.toast,
          backgroundColor: notification.type === 'success' ? 'var(--tertiary)' : 'var(--primary)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {notification.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <section style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Curadoria de Produtos da Vitrine</h1>
          <p style={styles.pageSubtitle}>Homologação e enriquecimento de produtos solicitados pelos lojistas de Tefé-AM.</p>
        </div>
      </section>

      {/* Bento Grid KPIs */}
      <section style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Fila de Curadoria</span>
          <div style={{ ...styles.metricValue, color: 'var(--secondary)' }}>
            {requests.length.toString().padStart(2, '0')} Pendentes
          </div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Produtos Aprovados & Ativos</span>
          <div style={{ ...styles.metricValue, color: 'var(--tertiary)' }}>
            {(1240 + approvedProducts.length).toString()} Itens
          </div>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Padrão de Qualidade UÁRI</span>
          <div style={{ ...styles.metricValue, color: 'var(--primary)' }}>
            100% Homologado
          </div>
        </div>
      </section>

      {/* Main Layout Grid: Fila de Solicitações e Área de Enriquecimento */}
      <div style={styles.mainWorkspaceGrid}>
        
        {/* Lado Esquerdo: Fila de Solicitações */}
        <div style={styles.leftQueueColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardSectionTitle}>Fila de Solicitações</h2>
            <p style={styles.cardSectionDesc}>Produtos propostos por parceiros para revisão e liberação.</p>

            <div style={styles.queueList}>
              {requests.length === 0 ? (
                <div style={styles.emptyQueueState}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--tertiary)' }}>done_all</span>
                  <span style={{ fontWeight: '750', fontSize: '13px' }}>Fila limpa!</span>
                  <span style={{ fontSize: '11px', color: 'var(--outline)', textAlign: 'center' }}>Todos os produtos propostos foram analisados.</span>
                </div>
              ) : (
                requests.map(req => {
                  const isActive = req.id === selectedRequestId;
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => setSelectedRequestId(req.id)}
                      style={{
                        ...styles.queueItemCard,
                        borderColor: isActive ? 'var(--primary)' : 'var(--outline-variant)',
                        backgroundColor: isActive ? 'rgba(110, 0, 193, 0.02)' : '#ffffff',
                        boxShadow: isActive ? '0px 4px 12px rgba(110,0,193,0.06)' : 'none'
                      }}
                    >
                      <div style={styles.queueItemHeader}>
                        <span style={styles.queueStoreName}>{req.storeName}</span>
                        <span style={styles.queueTime}>{req.submittedAt}</span>
                      </div>

                      <h3 style={styles.queueProductTitle}>{req.suggestedTitle}</h3>

                      <div style={styles.queueItemFooter}>
                        <span style={styles.queueCategoryTag}>{req.suggestedCategory}</span>
                        <span style={styles.queuePriceText}>
                          R$ {req.suggestedPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {req.lojistaComment && (
                        <div style={styles.queueLojistaCommentBox}>
                          <span style={styles.commentLabel}>Lojista:</span>
                          <span style={styles.commentContent}>"{req.lojistaComment}"</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Lado Direito: Editor de Enriquecimento de Dados */}
        <div style={styles.rightEditorColumn}>
          {activeRequest ? (
            <form onSubmit={handleApproveProduct} style={styles.card}>
              
              {/* Header do Editor */}
              <div style={styles.editorHeaderRow}>
                <div>
                  <span style={styles.editorPreTitle}>ESPAÇO DE CURADORIA & HOMOLOGAÇÃO</span>
                  <h2 style={styles.editorMainTitle}>Enriquecimento de Dados</h2>
                </div>
                <span style={styles.editorStoreTag}>{activeRequest.storeName}</span>
              </div>

              {/* Informações Básicas do Produto */}
              <div style={styles.editorSection}>
                <h3 style={styles.editorSectionTitle}>1. Informações da Vitrine</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Nome Oficial do Produto (Enriquecido)</label>
                  <input 
                    type="text" 
                    value={activeRequest.enrichedTitle}
                    onChange={(e) => updateActiveField('enrichedTitle', e.target.value)}
                    style={styles.fieldInput}
                    required
                  />
                  <span style={styles.fieldHelp}>Escreva um título comercial atraente e claro para o comprador virtual.</span>
                </div>

                <div style={styles.rowFormFields}>
                  <div style={{ ...styles.formGroup, flex: '1.2' }}>
                    <label style={styles.fieldLabel}>Categoria na Vitrine</label>
                    <select 
                      value={activeRequest.enrichedCategory}
                      onChange={(e) => updateActiveField('enrichedCategory', e.target.value)}
                      style={styles.fieldSelect}
                    >
                      <option value="Regional">Regional</option>
                      <option value="Alimentos">Alimentos & Bebidas</option>
                      <option value="Artesanato">Artesanato</option>
                      <option value="Cosméticos">Cosméticos & Saúde</option>
                      <option value="Moda">Moda Regional</option>
                    </select>
                  </div>

                  <div style={{ ...styles.formGroup, flex: '1' }}>
                    <label style={styles.fieldLabel}>Preço Homologado (R$)</label>
                    <div style={styles.priceInputBox}>
                      <span style={styles.pricePrefix}>R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={activeRequest.enrichedPrice}
                        onChange={(e) => updateActiveField('enrichedPrice', parseFloat(e.target.value) || 0)}
                        style={styles.priceInputField}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Descrição Comercial Detalhada</label>
                  <textarea 
                    value={activeRequest.enrichedDescription}
                    onChange={(e) => updateActiveField('enrichedDescription', e.target.value)}
                    style={styles.fieldTextarea}
                    rows={4}
                    required
                  />
                  <span style={styles.fieldHelp}>Forneça dados ricos sobre origem, benefícios, dimensões ou modo de consumo.</span>
                </div>
              </div>

              {/* Seleção de Imagens Oficiais */}
              <div style={styles.editorSection}>
                <div style={styles.imageSectionHeader}>
                  <div>
                    <h3 style={styles.editorSectionTitle}>2. Imagem Oficial do Produto</h3>
                    <p style={styles.imageSectionDesc}>Vincule uma imagem premium do banco de ativos UÁRI ao catálogo virtual.</p>
                  </div>
                  {activeRequest.selectedImageId && (
                    <span style={styles.imageLinkedStatus}>✓ Imagem Vinculada</span>
                  )}
                </div>

                {/* Grid da Galeria de Ativos do Produto */}
                <div style={styles.imageAssetsGrid}>
                  {imageAssets.map(img => {
                    const isSelected = img.id === activeRequest.selectedImageId;
                    return (
                      <div 
                        key={img.id}
                        onClick={() => updateActiveField('selectedImageId', img.id)}
                        style={{
                          ...styles.imageAssetCard,
                          borderColor: isSelected ? 'var(--primary)' : 'var(--outline-variant)',
                          backgroundColor: isSelected ? 'rgba(110,0,193,0.02)' : 'transparent',
                        }}
                      >
                        {renderProductIllustration(img.svgType, 72, 72, { margin: '0 auto' })}
                        <span style={{
                          ...styles.imageAssetLabel,
                          color: isSelected ? 'var(--primary)' : 'var(--on-surface-variant)',
                          fontWeight: isSelected ? '800' : '600'
                        }}>
                          {img.name.split(' ')[0]}
                        </span>
                        {isSelected && (
                          <div style={styles.assetCheckedCircle}>
                            <span className="material-symbols-outlined" style={{ fontSize: '11px', color: '#ffffff' }}>check</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={styles.editorActionsRow}>
                <button 
                  type="button" 
                  onClick={handleRejectRequest} 
                  style={styles.requestChangesBtn}
                >
                  Solicitar Ajustes
                </button>

                <button 
                  type="submit" 
                  style={styles.approveSubmitBtn}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>publish</span>
                  <span>Aprovar & Publicar na Vitrine</span>
                </button>
              </div>

            </form>
          ) : (
            <div style={styles.emptyEditorCard}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)' }}>inventory_2</span>
              <h3 style={{ fontWeight: '800', fontSize: '16px', margin: '8px 0 4px 0' }}>Selecione um Produto</h3>
              <p style={{ fontSize: '13px', color: 'var(--outline)', margin: 0, textAlign: 'center', maxWidth: '300px' }}>
                Clique em uma proposta da fila ao lado para iniciar a homologação e enriquecimento de dados comerciais e fotos.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Seção Inferior: Recentemente Homologados e Publicados na Vitrine */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Recentemente Publicados na Vitrine</h2>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Foto</th>
                <th style={styles.th}>Nome do Produto</th>
                <th style={styles.th}>Lojista</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Preço de Venda</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Data Homologado</th>
              </tr>
            </thead>
            <tbody>
              {approvedProducts.map(prod => {
                const asset = imageAssets.find(a => a.id === prod.imageId) || imageAssets[0];
                return (
                  <tr key={prod.id} style={styles.trRow}>
                    
                    {/* Imagem */}
                    <td style={{ ...styles.td, padding: '12px 16px 12px 0' }}>
                      {renderProductIllustration(asset.svgType, 40, 40, { borderRadius: '6px' })}
                    </td>

                    {/* Título */}
                    <td style={{ ...styles.td, fontWeight: '750' }}>{prod.title}</td>
                    
                    {/* Lojista */}
                    <td style={styles.td}>{prod.storeName}</td>

                    {/* Categoria */}
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{prod.category}</span>
                    </td>

                    {/* Preço */}
                    <td style={{ ...styles.td, fontWeight: '800', color: 'var(--tertiary)' }}>
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      <span style={styles.liveVitrineBadge}>
                        <span style={styles.liveVitrineDot} />
                        Ativo na Vitrine
                      </span>
                    </td>

                    {/* Data */}
                    <td style={{ ...styles.td, textAlign: 'right', color: 'var(--outline)' }}>
                      {prod.approvedAt}
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

// Estilos Premium UÁRI Admin
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
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--outline)',
    fontWeight: '550',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    padding: '20px 24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.01)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--outline)',
    fontWeight: '750',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: '850',
    color: 'var(--on-surface)',
  },
  mainWorkspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftQueueColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightEditorColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--surface-container-highest)',
    boxShadow: '0px 4px 24px rgba(0,0,0,0.015)',
  },
  cardSectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    margin: 0,
  },
  cardSectionDesc: {
    fontSize: '12.5px',
    color: 'var(--outline)',
    margin: '4px 0 20px 0',
    fontWeight: '550',
  },
  queueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  emptyQueueState: {
    padding: '48px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--surface-container-low)',
    border: '1px dashed var(--outline-variant)',
    borderRadius: '12px',
  },
  queueItemCard: {
    border: '1px solid',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  queueItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  queueStoreName: {
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  queueTime: {
    fontSize: '10.5px',
    color: 'var(--outline)',
    fontWeight: '550',
  },
  queueProductTitle: {
    fontSize: '14px',
    fontWeight: '750',
    color: 'var(--on-surface)',
    margin: '0 0 12px 0',
    lineHeight: '18px',
  },
  queueItemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueCategoryTag: {
    fontSize: '10.5px',
    fontWeight: '750',
    backgroundColor: 'var(--surface-container-high)',
    color: 'var(--on-surface-variant)',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  queuePriceText: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--tertiary)',
  },
  queueLojistaCommentBox: {
    marginTop: '12px',
    borderTop: '1px dashed var(--outline-variant)',
    paddingTop: '10px',
    fontSize: '11px',
    lineHeight: '14px',
  },
  commentLabel: {
    fontWeight: '850',
    color: 'var(--on-surface)',
    marginRight: '4px',
  },
  commentContent: {
    color: 'var(--outline)',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  editorHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  editorPreTitle: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--primary)',
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  editorMainTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    fontFamily: 'Plus Jakarta Sans',
    margin: 0,
  },
  editorStoreTag: {
    backgroundColor: 'rgba(110,0,193,0.06)',
    color: 'var(--primary)',
    fontSize: '11px',
    fontWeight: '800',
    padding: '4px 12px',
    borderRadius: '9999px',
  },
  editorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '1px solid var(--surface-container-highest)',
    paddingBottom: '20px',
  },
  editorSectionTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--on-surface)',
    margin: 0,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '750',
    color: 'var(--on-surface)',
  },
  fieldInput: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
  },
  rowFormFields: {
    display: 'flex',
    gap: '16px',
  },
  fieldSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    width: '100%',
  },
  priceInputBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  pricePrefix: {
    position: 'absolute',
    left: '12px',
    fontWeight: '750',
    color: 'var(--outline)',
    fontSize: '13px',
    pointerEvents: 'none',
  },
  priceInputField: {
    width: '100%',
    padding: '10px 14px 10px 34px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
    fontWeight: '750',
  },
  fieldTextarea: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Plus Jakarta Sans',
    color: 'var(--on-surface)',
    backgroundColor: '#ffffff',
    resize: 'vertical',
    lineHeight: '18px',
  },
  fieldHelp: {
    fontSize: '10.5px',
    color: 'var(--outline)',
    fontWeight: '550',
  },
  imageSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  imageSectionDesc: {
    fontSize: '11px',
    color: 'var(--outline)',
    margin: '2px 0 0 0',
    fontWeight: '550',
  },
  imageLinkedStatus: {
    backgroundColor: 'rgba(26, 115, 18, 0.08)',
    color: '#1a7312',
    fontSize: '10.5px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  imageAssetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
  },
  imageAssetCard: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '10px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  imageAssetLabel: {
    fontSize: '10px',
    textAlign: 'center',
    display: 'block',
    textTransform: 'capitalize',
  },
  assetCheckedCircle: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  editorActionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  requestChangesBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--error)',
    fontSize: '13.5px',
    fontWeight: '750',
    cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans',
  },
  approveSubmitBtn: {
    backgroundColor: '#6e00c1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(110, 0, 193, 0.15)',
    transition: 'all 0.2s',
    fontFamily: 'Plus Jakarta Sans',
  },
  emptyEditorCard: {
    backgroundColor: 'var(--surface-container-lowest)',
    borderRadius: '16px',
    padding: '64px 32px',
    border: '1px solid var(--surface-container-highest)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    boxShadow: '0px 4px 24px rgba(0,0,0,0.01)',
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
    padding: '12px 8px 12px 0',
    fontSize: '11px',
    fontWeight: '750',
    color: 'var(--outline)',
    textTransform: 'uppercase',
  },
  trRow: {
    borderBottom: '1px solid var(--surface-container-highest)',
  },
  td: {
    padding: '16px 8px 16px 0',
    fontSize: '13.5px',
    color: 'var(--on-surface)',
    verticalAlign: 'middle',
  },
  categoryBadge: {
    fontSize: '11px',
    fontWeight: '750',
    backgroundColor: 'var(--surface-container-high)',
    color: 'var(--on-surface-variant)',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  liveVitrineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '750',
    backgroundColor: 'rgba(26, 115, 18, 0.06)',
    color: '#1a7312',
  },
  liveVitrineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1a7312',
  },
  illustrationSvg: {
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  }
};
