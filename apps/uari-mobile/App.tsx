import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// 🌰 Paleta de Cores Oficial UÁRI
const COLORS = {
  marromPremium: '#3E2723',
  roxoDigital: '#6A1B9A',
  verdeEsmeralda: '#2E7D32',
  laranjaAcao: '#FF6D00',
  offWhite: '#F5F5F5',
  pureWhite: '#FFFFFF',
  grayText: '#757575',
  border: '#E0E0E0'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'role_select' | 'user_home' | 'lojista_dashboard'>('splash');
  const [cartCount, setCartCount] = useState(0);

  // Mocks de produtos para a Vitrine
  const products = [
    { id: 1, title: 'Smartwatch Series 9 Pro', price: '85,00', original: '120,00', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Tablet Ultra Tab X 256GB', price: '85,00', original: '130,00', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Fone Wireless Bass', price: '85,00', original: '110,00', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Lente Profissional 50mm', price: '85,00', original: '140,00', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60' }
  ];

  // 1. TELA DE SPLASH (TELA DE ABERTURA)
  const renderSplash = () => (
    <SafeAreaView style={styles.splashContainer}>
      <View style={styles.splashContent}>
        {/* Logo Importada */}
        <Image 
          source={require('./assets/logo.png')} 
          style={styles.splashLogo}
          resizeMode="contain"
        />

        <Text style={styles.splashSlogan}>"Quebra essa castanha."</Text>

        <Text style={styles.splashTitle}>
          As melhores ofertas de Tefé em um só lugar.
        </Text>
        
        <Text style={styles.splashSubtitle}>
          Conectamos você aos produtos e lojistas locais com facilidade, segurança e rapidez.
        </Text>

        {/* Botão de Compra/Ação Principal */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setCurrentScreen('role_select')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Começar agora</Text>
        </TouchableOpacity>

        {/* Botão de Entrada Secundário (Google) */}
        <TouchableOpacity style={styles.googleButton} onPress={() => setCurrentScreen('role_select')}>
          <Text style={styles.googleButtonText}>Entrar com o Google</Text>
        </TouchableOpacity>

        <Text style={styles.splashUrl}>uari.com</Text>
      </View>
    </SafeAreaView>
  );

  // 2. TELA DE SELEÇÃO DE PERFIL
  const renderRoleSelect = () => (
    <SafeAreaView style={styles.roleContainer}>
      <View style={styles.roleContent}>
        <Text style={styles.roleTitle}>Como você deseja entrar?</Text>
        <Text style={styles.roleSubtitle}>Escolha seu portal de acesso no UÁRI Marketplace.</Text>

        {/* Card Consumidor */}
        <TouchableOpacity 
          style={[styles.roleCard, { borderColor: COLORS.roxoDigital }]}
          onPress={() => setCurrentScreen('user_home')}
          activeOpacity={0.9}
        >
          <View style={styles.roleBadgeContainer}>
            <Text style={[styles.roleBadge, { backgroundColor: COLORS.roxoDigital }]}>CLIENTE</Text>
          </View>
          <Text style={styles.roleCardTitle}>Quero Comprar</Text>
          <Text style={styles.roleCardDesc}>Ver ofertas de Tefé, coletar cupons e acumular Pontos Castanha.</Text>
        </TouchableOpacity>

        {/* Card Lojista */}
        <TouchableOpacity 
          style={[styles.roleCard, { borderColor: COLORS.marromPremium }]}
          onPress={() => setCurrentScreen('lojista_dashboard')}
          activeOpacity={0.9}
        >
          <View style={styles.roleBadgeContainer}>
            <Text style={[styles.roleBadge, { backgroundColor: COLORS.marromPremium }]}>LOJISTA</Text>
          </View>
          <Text style={styles.roleCardTitle}>Quero Vender</Text>
          <Text style={styles.roleCardDesc}>Gerenciar vendas, enviar fotos de estoque e ler QR Codes de entrega.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => setCurrentScreen('splash')}>
          <Text style={styles.backLinkText}>Voltar para a abertura</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 3. TELA HOME DO CONSUMIDOR (VITRINE)
  const renderUserHome = () => (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.deliveryLabel}>Entregar em Tefé-AM 📍</Text>
          <Text style={styles.userName}>Olá, Ana Clara</Text>
        </View>
        <TouchableOpacity style={styles.pointsBadge}>
          <Text style={styles.pointsText}>🌰 120 Pontos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchBar}>
          <TextInput 
            placeholder="O que você está procurando em Tefé?" 
            placeholderTextColor={COLORS.grayText}
            style={styles.searchInput}
          />
        </View>

        {/* Banner Promocional */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoLabel}>OFERTAS TECH</Text>
          <Text style={styles.promoTitle}>Semana da Eletrônica</Text>
          <Text style={styles.promoSub}>Até 40% de desconto real</Text>
        </View>

        {/* Categorias Rápidas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {['Moda', 'Beleza', 'Celulares', 'Mercado', 'Artesanato'].map((cat, i) => (
            <TouchableOpacity key={i} style={styles.categoryItem}>
              <Text style={styles.categoryEmoji}>{['👕', '💄', '📱', '🍎', '🏹'][i]}</Text>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Vitrine: Castanhas do Dia */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Castanhas do Dia 🌰</Text>
          <Text style={styles.seeAll}>Ver tudo</Text>
        </View>

        <View style={styles.productsGrid}>
          {products.map((prod) => (
            <View key={prod.id} style={styles.productCard}>
              <Image source={{ uri: prod.image }} style={styles.productImage} />
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>30% OFF</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{prod.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>R$ {prod.original}</Text>
                  <Text style={styles.currentPrice}>R$ {prod.price}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.buyButton} 
                  onPress={() => setCartCount(c => c + 1)}
                >
                  <Text style={styles.buyButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Banner Frete Grátis */}
        <View style={styles.shippingBanner}>
          <Text style={styles.shippingTitle}>Frete Grátis em Tefé 🚚</Text>
          <Text style={styles.shippingSub}>Válido para pedidos acima de R$ 50,00</Text>
        </View>
      </ScrollView>

      {/* Barra de Navegação Mockada */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: COLORS.roxoDigital }]}>🏠</Text>
          <Text style={[styles.navText, { color: COLORS.roxoDigital }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Busca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => alert(`Carrinho com ${cartCount} itens!`)}>
          <View>
            <Text style={styles.navIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Carrinho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('role_select')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // 4. TELA DASHBOARD DO LOJISTA
  const renderLojistaDashboard = () => (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo Lojista */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.deliveryLabel}>Bom dia, Castanha & Cia! 🌰</Text>
          <Text style={styles.userName}>Painel do Lojista</Text>
        </View>
        <View style={[styles.pointsBadge, { backgroundColor: COLORS.verdeEsmeralda }]}>
          <Text style={styles.pointsText}>✓ Verificado</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Resumo Financeiro */}
        <View style={styles.performanceCard}>
          <Text style={styles.perfLabel}>SALDO DISPONÍVEL (PIX)</Text>
          <Text style={styles.perfValue}>R$ 2.450,80</Text>
          <Text style={styles.perfEscrow}>🔒 R$ 412,00 retido em garantia (Escrow)</Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { width: '100%', marginTop: 16, backgroundColor: COLORS.marromPremium }]}
            onPress={() => alert('Transferência Pix solicitada com sucesso!')}
          >
            <Text style={styles.primaryButtonText}>Transferir para conta Pix</Text>
          </TouchableOpacity>
        </View>

        {/* Central de Operações */}
        <Text style={styles.sectionTitleLojista}>Operações Rápidas</Text>
        
        <View style={styles.opsGrid}>
          {/* Scanner QR Code */}
          <TouchableOpacity 
            style={styles.opsCard}
            onPress={() => alert('Abrindo Câmera para confirmar entrega...')}
          >
            <Text style={styles.opsIcon}>📷</Text>
            <Text style={styles.opsTitle}>Scanner QR Code</Text>
            <Text style={styles.opsDesc}>Liberar dinheiro na hora da entrega física.</Text>
          </TouchableOpacity>

          {/* Enviar Foto/Rascunho */}
          <TouchableOpacity 
            style={styles.opsCard}
            onPress={() => alert('Selecione uma foto da sua galeria para enviar ao Admin.')}
          >
            <Text style={styles.opsIcon}>📦</Text>
            <Text style={styles.opsTitle}>Draft de Produto</Text>
            <Text style={styles.opsDesc}>Enviar foto bruta para curadoria do Admin.</Text>
          </TouchableOpacity>
        </View>

        {/* Pedidos Recentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aguardando Entrega (QR Code)</Text>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Pedido #4852</Text>
            <Text style={styles.orderNet}>Líquido: R$ 97,20</Text>
          </View>
          <Text style={styles.orderClient}>Cliente: João Pereira</Text>
          <Text style={styles.orderItemDetails}>2x Castanha do Pará (500g)</Text>
          <TouchableOpacity 
            style={[styles.buyButton, { backgroundColor: COLORS.verdeEsmeralda, marginTop: 12 }]}
            onPress={() => alert('Mostre este QR ao entregador ou use o scanner!')}
          >
            <Text style={styles.buyButtonText}>Gerar QR Code de Entrega</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegação Mockada Lojista */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: COLORS.marromPremium }]}>📊</Text>
          <Text style={[styles.navText, { color: COLORS.marromPremium }]}>Painel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => alert('Seu catálogo de produtos validados.')}>
          <Text style={styles.navIcon}>🛍️</Text>
          <Text style={styles.navText}>Catálogo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('role_select')}>
          <Text style={styles.navIcon}>🔄</Text>
          <Text style={styles.navText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Router de telas simples
  switch (currentScreen) {
    case 'role_select':
      return renderRoleSelect();
    case 'user_home':
      return renderUserHome();
    case 'lojista_dashboard':
      return renderLojistaDashboard();
    case 'splash':
    default:
      return renderSplash();
  }
}

// 💅 Estilos Premium e Minimalistas (Custom CSS Equivalente)
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  splashContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: width * 0.65,
    height: 180,
    marginBottom: 16,
  },
  splashSlogan: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
    color: COLORS.roxoDigital,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.marromPremium,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  splashSubtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.laranjaAcao,
    width: '90%',
    paddingVertical: 16,
    borderRadius: COLORS.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.marromPremium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: COLORS.pureWhite,
    width: '90%',
    paddingVertical: 16,
    borderRadius: COLORS.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  googleButtonText: {
    color: COLORS.marromPremium,
    fontSize: 15,
    fontWeight: '600',
  },
  splashUrl: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 16,
  },
  // Seleção de Perfil
  roleContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  roleContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleSubtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    marginBottom: 32,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusMd,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roleBadge: {
    color: COLORS.pureWhite,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.marromPremium,
    marginBottom: 8,
  },
  roleCardDesc: {
    fontSize: 13,
    color: COLORS.grayText,
    lineHeight: 18,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLinkText: {
    color: COLORS.roxoDigital,
    fontSize: 14,
    fontWeight: '600',
  },
  // Sistema Comum (Home / Dashboard)
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deliveryLabel: {
    fontSize: 11,
    color: COLORS.grayText,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: COLORS.roxoDigital,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: COLORS.radiusSm,
  },
  pointsText: {
    color: COLORS.pureWhite,
    fontWeight: '700',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchBar: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    fontSize: 14,
    color: COLORS.marromPremium,
  },
  promoBanner: {
    backgroundColor: COLORS.roxoDigital,
    borderRadius: COLORS.radiusMd,
    padding: 20,
    marginTop: 16,
  },
  promoLabel: {
    color: COLORS.laranjaAcao,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  promoTitle: {
    color: COLORS.pureWhite,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  promoSub: {
    color: COLORS.offWhite,
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  sectionTitleLojista: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 24,
    marginBottom: 12,
  },
  seeAll: {
    color: COLORS.roxoDigital,
    fontSize: 13,
    fontWeight: '700',
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryItem: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.marromPremium,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: COLORS.pureWhite,
    width: '48%',
    borderRadius: COLORS.radiusSm,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.offWhite,
  },
  discountTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.laranjaAcao,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.pureWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.marromPremium,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.grayText,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  buyButton: {
    backgroundColor: COLORS.roxoDigital,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: COLORS.pureWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  shippingBanner: {
    backgroundColor: COLORS.marromPremium,
    borderRadius: COLORS.radiusSm,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  shippingTitle: {
    color: COLORS.pureWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  shippingSub: {
    color: COLORS.offWhite,
    fontSize: 11,
    marginTop: 2,
  },
  // Barra de Navegação
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: COLORS.grayText,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.grayText,
    marginTop: 2,
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: COLORS.laranjaAcao,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: COLORS.pureWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  // Lojista Específico
  performanceCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusMd,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  perfLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.grayText,
    letterSpacing: 1,
  },
  perfValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.verdeEsmeralda,
    marginTop: 4,
  },
  perfEscrow: {
    fontSize: 12,
    color: COLORS.marromPremium,
    marginTop: 4,
    fontWeight: '600',
  },
  opsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  opsCard: {
    backgroundColor: COLORS.pureWhite,
    width: '48%',
    borderRadius: COLORS.radiusSm,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  opsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  opsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.marromPremium,
    marginBottom: 4,
  },
  opsDesc: {
    fontSize: 11,
    color: COLORS.grayText,
    lineHeight: 14,
  },
  orderCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  orderNet: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.verdeEsmeralda,
  },
  orderClient: {
    fontSize: 13,
    color: COLORS.marromPremium,
    fontWeight: '600',
  },
  orderItemDetails: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  }
});

