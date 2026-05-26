# 🌰 UÁRI Marketplace - Documento de Requisitos do Produto (PRD)

Este documento consolida todas as definições estratégicas, de branding, arquitetura, engenharia financeira, especificações dos módulos e regras de negócio do UÁRI Marketplace. Ele funciona como o guia mestre oficial para o desenvolvimento do ecossistema.

---

## 1. Visão Executiva e Estratégia

*   **Nome do Sistema**: UÁRI Marketplace
*   **Localização Foco**: Tefé-AM (e região do Médio Solimões).
*   **Problema a Resolver**: Ausência de um comércio digital seguro e organizado na cidade; dependência de grupos informais de redes sociais sem garantia de pagamento ou entrega.
*   **A Solução**: Um ecossistema digital que atua como vitrine de luxo para os lojistas locais e um ambiente de compra segura e gamificada para o consumidor.
*   **Slogan**: *"Quebra essa castanha."* (Alusão regional a fechar um bom negócio).
*   **Princípios Basilares**:
    1.  **Rápido**: Interface leve e processos em poucos cliques.
    2.  **Fácil**: Usabilidade intuitiva, acessível para todas as idades.
    3.  **Confiável**: Proteção financeira total para quem compra e quem vende.

---

## 2. Identidade Visual e Branding

A identidade visual segue a tendência "Clean e Minimalista" das grandes empresas de tecnologia (Big Techs).

*   **Conceito do Logo**: Uma "meia castanha" estilizada com traços contínuos que remetem a uma sacola de compras ou um sorriso.
*   **Paleta de Cores Principais**:
    *   `#3E2723` (Marrom Premium): Para textos e estrutura (substitui o preto absoluto).
    *   `#6A1B9A` (Roxo Digital): Cor da marca institucional.
    *   `#2E7D32` (Verde Esmeralda): Confirmações, segurança e selos.
    *   `#FF6D00` (Laranja Ação): Botões de compra, promoções e urgência.
    *   `#F5F5F5` (Off-White): Fundo do aplicativo para descanso visual.

---

## 3. Arquitetura do Sistema

O ecossistema é dividido em três módulos independentes, com permissões e interfaces específicas:

1.  **Módulo User (Consumidor Final)**: App Mobile (iOS/Android) desenvolvido em Expo.
2.  **Módulo Cliente (Lojista/Vendedor)**: App Mobile (Operacional) e Web (Gestão em Next.js).
3.  **Módulo Admin (Dono da Plataforma)**: Painel Web (Controle e Curadoria em Next.js).

---

## 4. Engenharia Financeira (O Fluxo de Confiança)

Para garantir segurança absoluta e consistência transacional, o sistema opera sob o modelo de **Escrow (Pagamento Retido)** e **Split Automatizado**.

*   **Entrada de Valores**: O User paga exclusivamente via Pix ou Cartão de Crédito dentro do App UÁRI.
*   **Retenção (Escrow)**: O dinheiro fica retido em uma conta vinculada à plataforma. O Lojista é notificado para preparar o pedido.
*   **O Handshake (Validação)**: A transação só é dada como concluída quando o Lojista entrega o produto e escaneia o QR Code gerado no celular do User.
*   **Split (Divisão)**: No instante da leitura do QR Code, o sistema divide o dinheiro:
    *   A comissão da plataforma (Ex: 10%) vai para o Admin.
    *   O valor líquido (90%) fica disponível na "Carteira" do Lojista.
*   **Saques**: O Lojista solicita o saque do valor líquido para sua conta bancária oficial via Pix, gerido pelo Admin.

---

## 5. Especificações: Módulo User (Consumidor Final)

Exclusivo Mobile. Foco em consumo, descoberta e fidelização.

### Funcionalidades Chave:
*   **Vitrine Inteligente**: Feed de promoções com filtro por categorias e bairros de Tefé.
*   **Compra em 1 Clique**: Checkout ultra-rápido com Pix.
*   **Carteira de Cupons**: Espaço para coletar e guardar descontos ("Tickets Digitais").
*   **Clube de Vantagens (Gamificação)**: Acúmulo de Pontos Castanha a cada compra concluída.
*   **Sorteios Locais**: Uso dos pontos para gerar "bilhetes da sorte" e concorrer a prêmios dados pela plataforma.
*   **Handshake Card**: Tela dedicada para exibir o QR Code de recebimento de produto de forma brilhante e clara.

---

## 6. Especificações: Módulo Cliente (Lojista/Dono do Negócio)

Web (Para análises e campanhas) e Mobile (Para balcão e entregas).

**Regra de Ouro**: O lojista não cadastra o produto final. Ele envia as fotos brutas para o Admin.

### Funcionalidades Chave:
*   **Draft de Produtos**: Formulário simples para enviar foto de balcão e preço para o Admin.
*   **Central de Promoções (Seu maior poder)**: Aplicar descontos, criar cupons próprios e agendar campanhas em produtos já validados pelo Admin.
*   **Scanner UÁRI**: Leitor de QR Code para confirmar entregas e liberar seu dinheiro.
*   **Inteligência de Mercado**: Visualizar quais produtos têm mais "Corações" (favoritos) na cidade.
*   **Dashboard Financeiro**: Extrato de vendas brutas, descontos, taxas e controle de saques solicitados.

---

## 7. Especificações: Módulo Admin (Gestor da Plataforma)

Exclusivo Web. Foco em curadoria visual, auditoria e fluxo de caixa.

### Funcionalidades Chave:
*   **Studio UÁRI (Curadoria Visual)**: O diferencial da plataforma. O Admin recebe as fotos brutas dos lojistas, trata as imagens, escreve títulos em padrão de luxo (SEO) e publica o anúncio oficial.
*   **Gestão de Lojistas (KYC)**: Aprovação de documentos e CNPJs para liberar novos lojistas na plataforma.
*   **Gestão de Gamificação**: Criar os prêmios da cidade, definir regras de conversão de pontos e realizar os sorteios com auditoria.
*   **Conciliação Financeira**: Painel para monitorar todas as entradas, aprovar saques de lojistas e verificar o lucro de comissões da plataforma.
*   **Central de Disputas**: Ferramenta para estornar o dinheiro ao User ou liberar ao Lojista em caso de problemas na entrega.

---

## 8. Regras de Negócio Sistêmicas (Restrições)

1.  **Impedimento de Contato Direto**: Antes da compra, a comunicação é feita pelo chat interno do app para evitar evasão de taxas. O botão "WhatsApp" pode ser liberado apenas em modelos de assinatura específicos.
2.  **Responsabilidade do Cupom**:
    *   Cupons criados pelo Lojista são descontados do repasse do Lojista.
    *   Cupons criados pelo Admin são descontados da margem de comissão da Plataforma.
3.  **Qualidade Visual Mínima**: Nenhum produto vai ao ar sem a aprovação e edição do módulo Admin. Isso garante que o app UÁRI seja visualmente superior a qualquer grupo de Facebook ou WhatsApp em Tefé.
