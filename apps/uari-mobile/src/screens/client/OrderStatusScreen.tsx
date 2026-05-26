import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { dbService } from '../../services/database';

export default function OrderStatusScreen() {
  const { activeOrder, setActiveOrder } = useApp();
  const { goBack, reset } = useNavigation();
  const [loading, setLoading] = useState(false);

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Nenhum pedido ativo encontrado!</Text>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleConfirmReceipt = async () => {
    setLoading(true);
    try {
      if (activeOrder.id.startsWith('order-demo')) {
        // Fluxo demonstração
        Alert.alert(
          'Entrega Confirmada! 🎉',
          'Sua confirmação de recebimento liberou o saldo escrow local para o lojista e adicionou Pontos Castanha na sua conta!',
          [{ text: 'Ver Extrato', onPress: () => reset('user_home') }]
        );
        return;
      }

      // Fluxo Supabase real
      const success = await dbService.completeHandshake(activeOrder.id);
      if (success) {
        Alert.alert(
          'Pedido Concluído! 🌰',
          'Recebimento confirmado! O saldo de escrow foi liberado para o lojista e seus Pontos Castanha foram creditados!',
          [{ text: 'Maravilha!', onPress: () => reset('user_home') }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível confirmar o recebimento do pedido.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Ocorreu um erro ao processar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar Figma */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.supportBtn} onPress={() => Alert.alert('Suporte', 'Fale com o suporte UÁRI no WhatsApp: (97) 99999-9999')}>
          <Text style={styles.supportIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Status do Pedido</Text>

        {/* Informações Básicas do Pedido Figma */}
        <View style={styles.orderSummaryCard}>
          <Text style={styles.orderIdText}>Pedido #{activeOrder.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.storeNameText}>Loja: {activeOrder.store?.name || 'Castanha & Cia 🌰'}</Text>
        </View>

        {/* Timeline Timeline Figma */}
        <Text style={styles.sectionHeading}>Acompanhamento</Text>
        <View style={styles.timelineBox}>
          
          {/* Linha vertical decorativa */}
          <View style={styles.timelineVerticalLine} />

          {/* Passo 1 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.activeDot]}>
              <Text style={styles.checkChar}>✓</Text>
            </View>
            <View style={styles.timelineTextContainer}>
              <Text style={styles.timelineTitle}>Pedido Recebido</Text>
              <Text style={styles.timelineTime}>Hoje 10:30</Text>
            </View>
          </View>

          {/* Passo 2 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.activeDot]}>
              <Text style={styles.checkChar}>✓</Text>
            </View>
            <View style={styles.timelineTextContainer}>
              <Text style={styles.timelineTitle}>Pagamento Aprovado</Text>
              <Text style={styles.timelineTime}>Hoje 10:32</Text>
            </View>
          </View>

          {/* Passo 3 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.pendingDot]}>
              <Text style={styles.checkChar}>⚡</Text>
            </View>
            <View style={styles.timelineTextContainer}>
              <Text style={[styles.timelineTitle, { color: COLORS.roxoDigital }]}>Pronto para Retirada</Text>
              <Text style={styles.timelineTime}>Aguardando retirada física</Text>
            </View>
          </View>
        </View>

        {/* QR Code de Handshake Figma */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCard}>
            {/* Desenha um mockup gráfico elegante do QR Code */}
            <View style={styles.qrGraphicsContainer}>
              <View style={styles.qrCornerTopLeft} />
              <View style={styles.qrCornerTopRight} />
              <View style={styles.qrCornerBottomLeft} />
              <View style={styles.qrCornerBottomRight} />
              
              {/* Centro de scan */}
              <Text style={styles.qrIconEmoji}>🌰</Text>
              <Text style={styles.qrCodeValue}>{activeOrder.handshake_qr_code}</Text>
            </View>
          </View>
          <Text style={styles.qrHelperText}>
            Mostre este código ou passe a senha ao lojista para validar sua retirada.
          </Text>
        </View>

        {/* Botão Confirmar Recebimento Figma */}
        <TouchableOpacity 
          style={[styles.confirmBtn, loading && { opacity: 0.8 }]}
          disabled={loading}
          onPress={handleConfirmReceipt}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.pureWhite} />
          ) : (
            <Text style={styles.confirmBtnText}>CONFIRMAR RECEBIMENTO</Text>
          )}
        </TouchableOpacity>

        {/* Selo Pagamento Seguro Figma */}
        <View style={styles.secureFooter}>
          <Text style={styles.secureFooterText}>🛡️ Pagamento seguro e garantido</Text>
        </View>

        <Text style={styles.brandingText}>Quebra essa castanha</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.marromPremium,
    fontWeight: '700',
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    color: COLORS.pureWhite,
    fontWeight: '700',
  },
  topBar: {
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
  backArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  logo: {
    width: 60,
    height: 30,
  },
  supportBtn: {
    padding: 6,
  },
  supportIcon: {
    fontSize: 18,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 20,
    marginBottom: 16,
  },
  orderSummaryCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 20,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  storeNameText: {
    fontSize: 13,
    color: COLORS.grayText,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginBottom: 12,
  },
  timelineBox: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    padding: 20,
    position: 'relative',
    marginBottom: 20,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 31,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginRight: 16,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
  },
  pendingDot: {
    backgroundColor: '#D1C4E9',
  },
  checkChar: {
    color: COLORS.pureWhite,
    fontSize: 11,
    fontWeight: '900',
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  timelineTime: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  qrCard: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: COLORS.pureWhite,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  qrGraphicsContainer: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: COLORS.marromPremium,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: COLORS.marromPremium,
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: COLORS.marromPremium,
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: COLORS.marromPremium,
  },
  qrCornerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: COLORS.marromPremium,
  },
  qrIconEmoji: {
    fontSize: 28,
  },
  qrCodeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  qrHelperText: {
    fontSize: 12,
    color: COLORS.grayText,
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 24,
    marginTop: 12,
    lineHeight: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.laranjaAcao,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: COLORS.laranjaAcao,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  confirmBtnText: {
    color: COLORS.pureWhite,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secureFooter: {
    alignItems: 'center',
    marginTop: 16,
  },
  secureFooterText: {
    color: '#2E7D32',
    fontWeight: '800',
    fontSize: 12,
  },
  brandingText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 24,
  },
});
