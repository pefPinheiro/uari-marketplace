import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { dbService, DBOrder } from '../services/database';

export default function LojistaDashboardScreen() {
  const { navigate } = useNavigation();
  const { profile, user } = useAuth();
  
  const [store, setStore] = useState<any>(null);
  const [wallet, setWallet] = useState<{ available_balance: number; escrow_balance: number }>({
    available_balance: 2450.80, // fallbacks
    escrow_balance: 412.00
  });
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // States para modais rápidos (simulados via interface ou prompt)
  const [showPixInput, setShowPixInput] = useState(false);
  const [pixAmount, setPixAmount] = useState('');
  const [pixKey, setPixKey] = useState('');

  const [showProductDraftInput, setShowProductDraftInput] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [draftCategory, setDraftCategory] = useState('Mercado');

  useEffect(() => {
    loadLojistaData();
  }, [user]);

  const loadLojistaData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.id === 'demo-user-id') {
        // Mock presets para demonstração
        setStore({ name: 'Castanha & Cia 🌰' });
        setWallet({ available_balance: 2450.80, escrow_balance: 412.00 });
        setOrders([
          {
            id: 'order-demo-1',
            user_id: 'client-1',
            store_id: 'store-1',
            subtotal: 97.20,
            discount: 0,
            platform_fee: 9.72,
            store_net: 87.48,
            total: 97.20,
            status: 'paid',
            payment_method: 'pix',
            handshake_qr_code: 'UARI-DEMO-1',
            created_at: new Date().toISOString(),
            client: { full_name: 'João Pereira' }
          }
        ]);
        setLoading(false);
        return;
      }

      // 1. Carregar loja real no Supabase
      let activeStore = await dbService.fetchLojistaStore(user.id);
      if (!activeStore) {
        // Cria uma loja demonstrativa automatizada para não travar o teste do usuário
        activeStore = await dbService.createDemoStore(user.id, `Loja de ${profile?.full_name || 'Lojista Tefé'}`);
      }
      setStore(activeStore);

      if (activeStore) {
        // 2. Carregar carteira financeira real
        const activeWallet = await dbService.fetchWallet(activeStore.id);
        if (activeWallet) {
          setWallet({
            available_balance: Number(activeWallet.available_balance),
            escrow_balance: Number(activeWallet.escrow_balance)
          });
        }

        // 3. Carregar pedidos aguardando ação
        const pendingOrders = await dbService.fetchPendingOrders(activeStore.id);
        setOrders(pendingOrders);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do lojista:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePixWithdrawal = async () => {
    if (!pixAmount || !pixKey) {
      Alert.alert('Erro', 'Preencha o valor do saque e a chave Pix!');
      return;
    }

    const value = parseFloat(pixAmount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Erro', 'Insira um valor válido de saque!');
      return;
    }

    if (value > wallet.available_balance) {
      Alert.alert('Saldo Insuficiente', 'O valor solicitado excede o seu saldo disponível.');
      return;
    }

    if (user?.id === 'demo-user-id') {
      setWallet((prev) => ({
        ...prev,
        available_balance: prev.available_balance - value
      }));
      Alert.alert('Saque Realizado (Demonstração)', `Transferência Pix de R$ ${value.toFixed(2)} enviada com sucesso!`);
      setShowPixInput(false);
      setPixAmount('');
      setPixKey('');
      return;
    }

    setLoading(true);
    try {
      const success = await dbService.requestWithdrawal(store.id, value, pixKey);
      if (success) {
        Alert.alert(
          'Solicitação Enviada! 🚀',
          `Seu saque de R$ ${value.toFixed(2)} foi solicitado e debitado do seu saldo.\n\nEm breve o administrador fará a liberação no banco de dados.`,
          [{ text: 'Maravilha', onPress: () => { setShowPixInput(false); setPixAmount(''); setPixKey(''); loadLojistaData(); } }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível solicitar o saque.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  const handleQrScanner = () => {
    // Simula a leitura de um código QR pedindo para digitar
    Alert.prompt(
      'Scanner de QR Code UÁRI 📷',
      'Digite o código do QR Code de entrega do cliente para liberar o dinheiro retido no Escrow:',
      async (code) => {
        if (!code) return;
        
        // Achar pedido correspondente
        const matchingOrder = orders.find((o) => o.handshake_qr_code === code);
        
        if (!matchingOrder) {
          Alert.alert('QR Code Inválido', 'Este código de entrega não foi encontrado nos pedidos ativos da sua loja.');
          return;
        }

        if (user?.id === 'demo-user-id') {
          setWallet((prev) => ({
            available_balance: prev.available_balance + matchingOrder.store_net,
            escrow_balance: prev.escrow_balance - matchingOrder.store_net
          }));
          setOrders((prev) => prev.filter((o) => o.id !== matchingOrder.id));
          Alert.alert('Sucesso! (Demonstração)', `Entrega confirmada! R$ ${matchingOrder.store_net.toFixed(2)} liberado para o saldo disponível.`);
          return;
        }

        setLoading(true);
        try {
          const success = await dbService.completeHandshake(matchingOrder.id);
          if (success) {
            Alert.alert(
              'Entrega Confirmada! 🎉',
              `O status do pedido #${matchingOrder.id.slice(0, 5).toUpperCase()} foi atualizado para Concluído!\n\nO motor financeiro Supabase já liberou R$ ${matchingOrder.store_net.toFixed(2)} na sua carteira disponível.`,
              [{ text: 'Show!', onPress: loadLojistaData }]
            );
          } else {
            Alert.alert('Erro', 'Não foi possível confirmar a entrega.');
          }
        } catch (err) {
          Alert.alert('Erro', 'Ocorreu um erro.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleProductDraft = async () => {
    if (!draftTitle || !draftPrice) {
      Alert.alert('Erro', 'Preencha o título e o preço do rascunho de produto!');
      return;
    }

    const price = parseFloat(draftPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Insira um preço válido!');
      return;
    }

    const imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';

    if (user?.id === 'demo-user-id') {
      Alert.alert(
        'Rascunho Enviado (Demonstração)',
        `Rascunho de "${draftTitle}" enviado com sucesso!\n\nNo ambiente real, este produto fica em rascunho (status: draft) aguardando curadoria/aprovação do Administrador no painel Admin Web.`
      );
      setShowProductDraftInput(false);
      setDraftTitle('');
      setDraftPrice('');
      return;
    }

    setLoading(true);
    try {
      const success = await dbService.createProductDraft(store.id, draftTitle, price, draftCategory, imageUrl);
      if (success) {
        Alert.alert(
          'Enviado para Curadoria! 📦',
          `Rascunho de "${draftTitle}" enviado ao painel do Administrador!\n\nAssim que for aprovado, seu produto ficará visível na vitrine dos clientes.`,
          [{ text: 'Excelente', onPress: () => { setShowProductDraftInput(false); setDraftTitle(''); setDraftPrice(''); loadLojistaData(); } }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o rascunho.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Lojista */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.deliveryLabel}>Bom dia, {store?.name || 'Lojista UÁRI'}! 🌰</Text>
          <Text style={styles.userName}>Painel do Lojista</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verificado</Text>
        </View>
      </View>

      {loading && !store ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.verdeEsmeralda} />
          <Text style={styles.loadingText}>Carregando painel financeiro...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Resumo Financeiro */}
          <View style={styles.performanceCard}>
            <Text style={styles.perfLabel}>SALDO DISPONÍVEL (PIX)</Text>
            <Text style={styles.perfValue}>R$ {wallet.available_balance.toFixed(2)}</Text>
            <Text style={styles.perfEscrow}>🔒 R$ {wallet.escrow_balance.toFixed(2)} retido em garantia (Escrow)</Text>
            
            {!showPixInput ? (
              <TouchableOpacity 
                style={styles.transferButton}
                onPress={() => setShowPixInput(true)}
              >
                <Text style={styles.transferButtonText}>Transferir para conta Pix</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pixInputContainer}>
                <TextInput 
                  placeholder="Valor do Saque (R$)"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.pixTextInput}
                  keyboardType="numeric"
                  value={pixAmount}
                  onChangeText={setPixAmount}
                />
                <TextInput 
                  placeholder="Chave Pix (CPF, Celular, E-mail)"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.pixTextInput}
                  value={pixKey}
                  onChangeText={setPixKey}
                />
                <View style={styles.pixActions}>
                  <TouchableOpacity 
                    style={[styles.pixBtn, { backgroundColor: COLORS.grayText }]} 
                    onPress={() => setShowPixInput(false)}
                  >
                    <Text style={styles.pixBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pixBtn, { backgroundColor: COLORS.verdeEsmeralda }]} 
                    onPress={handlePixWithdrawal}
                  >
                    <Text style={styles.pixBtnText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Central de Operações */}
          <Text style={styles.sectionTitleLojista}>Operações Rápidas</Text>
          
          <View style={styles.opsGrid}>
            {/* Scanner QR Code */}
            <TouchableOpacity 
              style={styles.opsCard}
              onPress={handleQrScanner}
            >
              <Text style={styles.opsIcon}>📷</Text>
              <Text style={styles.opsTitle}>Confirmar QR Code</Text>
              <Text style={styles.opsDesc}>Liberar dinheiro na hora da entrega física.</Text>
            </TouchableOpacity>

            {/* Enviar Foto/Rascunho */}
            <TouchableOpacity 
              style={styles.opsCard}
              onPress={() => setShowProductDraftInput(true)}
            >
              <Text style={styles.opsIcon}>📦</Text>
              <Text style={styles.opsTitle}>Draft de Produto</Text>
              <Text style={styles.opsDesc}>Enviar foto bruta para curadoria do Admin.</Text>
            </TouchableOpacity>
          </View>

          {/* Seção de Draft inputs */}
          {showProductDraftInput && (
            <View style={styles.draftContainer}>
              <Text style={styles.draftHeading}>📦 Novo Rascunho de Produto</Text>
              <TextInput 
                placeholder="Título do Produto"
                placeholderTextColor={COLORS.grayText}
                style={styles.draftInput}
                value={draftTitle}
                onChangeText={setDraftTitle}
              />
              <TextInput 
                placeholder="Preço (R$)"
                placeholderTextColor={COLORS.grayText}
                style={styles.draftInput}
                keyboardType="numeric"
                value={draftPrice}
                onChangeText={setDraftPrice}
              />
              <TextInput 
                placeholder="Categoria (Ex: Celulares, Mercado, Artesanato)"
                placeholderTextColor={COLORS.grayText}
                style={styles.draftInput}
                value={draftCategory}
                onChangeText={setDraftCategory}
              />
              <View style={styles.pixActions}>
                <TouchableOpacity 
                  style={[styles.pixBtn, { backgroundColor: COLORS.grayText }]} 
                  onPress={() => setShowProductDraftInput(false)}
                >
                  <Text style={styles.pixBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pixBtn, { backgroundColor: COLORS.marromPremium }]} 
                  onPress={handleProductDraft}
                >
                  <Text style={styles.pixBtnText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Pedidos Recentes */}
          <Text style={styles.sectionTitleLojista}>Pedidos Pendentes (Split Escrow)</Text>

          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum pedido aguardando entrega 🌰</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Pedido #{order.id.slice(0, 5).toUpperCase()}</Text>
                  <Text style={styles.orderNet}>Líquido: R$ {Number(order.store_net).toFixed(2)}</Text>
                </View>
                <Text style={styles.orderClient}>Cliente: {order.client?.full_name || 'João Pereira'}</Text>
                <Text style={styles.orderItemDetails}>Status Atual: {order.status.toUpperCase()}</Text>
                <Text style={styles.orderItemDetails}>QR Code de Handshake: {order.handshake_qr_code}</Text>
                <TouchableOpacity 
                  style={styles.confirmDeliveryButton}
                  onPress={async () => {
                    if (user?.id === 'demo-user-id') {
                      setWallet((prev) => ({
                        available_balance: prev.available_balance + order.store_net,
                        escrow_balance: prev.escrow_balance - order.store_net
                      }));
                      setOrders((prev) => prev.filter((o) => o.id !== order.id));
                      Alert.alert('Sucesso! (Demonstração)', `Entrega confirmada! R$ ${order.store_net.toFixed(2)} liberado para o saldo disponível.`);
                      return;
                    }
                    setLoading(true);
                    const success = await dbService.completeHandshake(order.id);
                    if (success) {
                      Alert.alert('Entrega Realizada! 🎉', 'O valor foi liberado na sua carteira.', [{ text: 'Ok', onPress: loadLojistaData }]);
                    } else {
                      Alert.alert('Erro', 'Não foi possível realizar o handshake.');
                      setLoading(false);
                    }
                  }}
                >
                  <Text style={styles.confirmDeliveryText}>Simular Scanner / Liberar Escrow</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Barra de Navegação Mockada Lojista */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: COLORS.marromPremium }]}>📊</Text>
          <Text style={[styles.navText, { color: COLORS.marromPremium }]}>Painel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={loadLojistaData}>
          <Text style={styles.navIcon}>🔄</Text>
          <Text style={styles.navText}>Atualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('role_select')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Sair</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.verdeEsmeralda,
    fontWeight: '600',
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
  verifiedBadge: {
    backgroundColor: COLORS.verdeEsmeralda,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: COLORS.radiusSm,
  },
  verifiedText: {
    color: COLORS.pureWhite,
    fontWeight: '700',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  transferButton: {
    backgroundColor: COLORS.marromPremium,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  transferButtonText: {
    color: COLORS.pureWhite,
    fontSize: 15,
    fontWeight: '800',
  },
  pixInputContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  pixTextInput: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pixActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pixBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  pixBtnText: {
    color: COLORS.pureWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitleLojista: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 24,
    marginBottom: 12,
  },
  opsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  draftContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  draftHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.marromPremium,
    marginBottom: 12,
  },
  draftInput: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
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
  },
  confirmDeliveryButton: {
    backgroundColor: COLORS.verdeEsmeralda,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmDeliveryText: {
    color: COLORS.pureWhite,
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 30,
    backgroundColor: COLORS.pureWhite,
    borderRadius: COLORS.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: COLORS.grayText,
    fontSize: 14,
    fontWeight: '600',
  },
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
});
