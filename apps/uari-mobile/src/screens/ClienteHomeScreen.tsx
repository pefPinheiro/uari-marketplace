import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useApp } from '../context/AppContext';
import { dbService, DBProduct, DBOrder } from '../services/database';

// Importando as abas modulares do cliente
import ClienteTabHome from './client/ClienteTabHome';
import ClienteTabSearch from './client/ClienteTabSearch';
import ClienteTabProfile from './client/ClienteTabProfile';

// Vitrine fallback caso o banco esteja vazio
const PRESET_PRODUCTS = [
  { id: 'preset-1', title: 'Smartwatch Series 9 Pro', current_price: 85.00, original_price: 100.00, images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60'], category: 'Celulares', store_id: 'store-1', store: { name: 'Loja Tech Tefé' } },
  { id: 'preset-2', title: 'Tablet Ultra Tab X 256GB', current_price: 85.00, original_price: 100.00, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60'], category: 'Celulares', store_id: 'store-1', store: { name: 'Eletro Amazonas' } },
  { id: 'preset-3', title: 'Fone Wireless Bass Boost', current_price: 85.00, original_price: 100.00, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'], category: 'Celulares', store_id: 'store-2', store: { name: 'Som da Selva' } },
  { id: 'preset-4', title: 'Lente Profissional...', current_price: 85.00, original_price: 100.00, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60'], category: 'Moda', store_id: 'store-3', store: { name: 'Foto Tefé' } }
];

export default function ClienteHomeScreen() {
  const { user, profile } = useAuth();
  const { navigate } = useNavigation();
  const { setActiveOrder } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'busca' | 'pedidos' | 'perfil'>('home');
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [points, setPoints] = useState(120);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Carregar produtos para a Home e Busca
      if (products.length === 0) {
        const fetchedProducts = await dbService.fetchPublishedProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(PRESET_PRODUCTS as any);
        }
      }

      // 2. Carregar pontos reais do Supabase
      if (user.id !== 'demo-user-id') {
        const fetchedPoints = await dbService.fetchPointsBalance(user.id);
        setPoints(fetchedPoints);
      }

      // 3. Carregar pedidos se estiver na aba de Pedidos
      if (activeTab === 'pedidos') {
        if (user.id === 'demo-user-id') {
          setOrders([
            {
              id: 'order-demo-123',
              user_id: user.id,
              store_id: 'store-1',
              subtotal: 89.90,
              discount: 0,
              platform_fee: 8.99,
              store_net: 80.91,
              total: 94.90,
              status: 'ready_for_pickup',
              payment_method: 'pix',
              handshake_qr_code: 'UARI-DEMO-25',
              created_at: new Date().toISOString(),
              store: { name: 'Castanha & Cia 🌰' }
            } as any
          ]);
        } else {
          const userOrders = await dbService.fetchUserOrders(user.id);
          setOrders(userOrders);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do ClienteHome:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = (order: DBOrder) => {
    setActiveOrder(order);
    navigate('order_status');
  };

  // Renderizador do Conteúdo da Aba Ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'busca':
        return <ClienteTabSearch products={products} />;
      case 'pedidos':
        return renderPedidosTab();
      case 'perfil':
        return <ClienteTabProfile points={points} onSelectTab={setActiveTab} />;
      case 'home':
      default:
        return (
          <ClienteTabHome 
            products={products} 
            points={points} 
            userName={profile?.full_name || 'Ana Clara'} 
            onSelectTab={setActiveTab}
          />
        );
    }
  };

  // Renderizador específico da Aba Pedidos (Screen 8 & Timeline) Figma
  const renderPedidosTab = () => (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <View style={{ width: 28 }} />
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COLORS.roxoDigital} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyText}>Você ainda não realizou compras.</Text>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                activeOpacity={0.9}
                onPress={() => handleOrderPress(order)}
              >
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderId}>Pedido #{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={[
                    styles.orderStatusBadge,
                    order.status === 'completed' ? styles.statusCompleted : styles.statusPending
                  ]}>
                    {order.status === 'completed' ? 'Concluído' : 'Aguardando Retirada'}
                  </Text>
                </View>
                
                <Text style={styles.orderStore}>Loja: {order.store?.name || 'Castanha & Cia 🌰'}</Text>
                <Text style={styles.orderTotal}>Total: R$ {Number(order.total).toFixed(2)}</Text>
                
                <View style={styles.orderCardFooter}>
                  <Text style={styles.orderDate}>
                    Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.viewDetailsText}>Ver QR Code →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Corpo da Aba */}
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>

      {/* Barra de Navegação Premium Figma (Com Pílula Roxa Ativa) */}
      <View style={styles.navBar}>
        {/* Item Home */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('home')}
        >
          <View style={[styles.pillContainer, activeTab === 'home' && styles.activePill]}>
            <Text style={[styles.navIcon, activeTab === 'home' && styles.activeNavIcon]}>🏠</Text>
            {activeTab === 'home' && <Text style={styles.activeNavText}>Home</Text>}
          </View>
        </TouchableOpacity>

        {/* Item Busca */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('busca')}
        >
          <View style={[styles.pillContainer, activeTab === 'busca' && styles.activePill]}>
            <Text style={[styles.navIcon, activeTab === 'busca' && styles.activeNavIcon]}>🔍</Text>
            {activeTab === 'busca' && <Text style={styles.activeNavText}>Busca</Text>}
          </View>
        </TouchableOpacity>

        {/* Item Pedidos */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('pedidos')}
        >
          <View style={[styles.pillContainer, activeTab === 'pedidos' && styles.activePill]}>
            <Text style={[styles.navIcon, activeTab === 'pedidos' && styles.activeNavIcon]}>🛍️</Text>
            {activeTab === 'pedidos' && <Text style={styles.activeNavText}>Pedidos</Text>}
          </View>
        </TouchableOpacity>

        {/* Item Perfil */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('perfil')}
        >
          <View style={[styles.pillContainer, activeTab === 'perfil' && styles.activePill]}>
            <Text style={[styles.navIcon, activeTab === 'perfil' && styles.activeNavIcon]}>👤</Text>
            {activeTab === 'perfil' && <Text style={styles.activeNavText}>Perfil</Text>}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  tabContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  refreshBtn: {
    padding: 6,
  },
  refreshIcon: {
    fontSize: 16,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  orderStatusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusPending: {
    backgroundColor: '#EDE7F6',
    color: '#673AB7',
  },
  orderStore: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.marromPremium,
    marginTop: 10,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.laranjaAcao,
    marginTop: 4,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.grayText,
    fontWeight: '600',
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.roxoDigital,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayText,
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activePill: {
    backgroundColor: '#EDE7F6', // Pílula de destaque roxa ativa do figma
  },
  navIcon: {
    fontSize: 18,
    color: COLORS.grayText,
  },
  activeNavIcon: {
    color: COLORS.roxoDigital,
  },
  activeNavText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.roxoDigital,
    marginLeft: 6,
  },
});
