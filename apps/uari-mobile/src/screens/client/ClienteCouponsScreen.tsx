import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  Alert 
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';

export default function ClienteCouponsScreen() {
  const { goBack } = useNavigation();
  const [activeSubTab, setActiveSubTab] = useState<'disponiveis' | 'meus' | 'expirados'>('disponiveis');
  const [collectedIds, setCollectedIds] = useState<string[]>(['c-2']); // O cupom 2 ja vem como salvo

  const handleCollect = (id: string, code: string) => {
    setCollectedIds((prev) => [...prev, id]);
    Alert.alert(
      'Cupom Coletado! 🎟️',
      `O cupom "${code}" foi salvo na sua conta e será aplicado no seu próximo checkout.`,
      [{ text: 'Maravilha!' }]
    );
  };

  const presetCoupons = [
    { id: 'c-1', value: 'R$ 20', title: 'Vale compras na Loja do Zé', expiry: 'Expira em 2 dias', code: 'LOJADOZE20' },
    { id: 'c-2', value: '15%', title: 'Desconto em Castanhas', expiry: 'Expira em 5 dias', code: 'CASTANHA15' },
    { id: 'c-3', value: 'R$ 10', title: 'Padaria do Porto', expiry: 'Acaba hoje!', code: 'PADARIA10' }
  ];

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
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Meus Descontos</Text>

        {/* Sub-abas de cupons Figma */}
        <View style={styles.subTabsContainer}>
          <TouchableOpacity 
            style={[
              styles.subTabPill,
              activeSubTab === 'disponiveis' && { backgroundColor: COLORS.roxoDigital }
            ]}
            onPress={() => setActiveSubTab('disponiveis')}
          >
            <Text style={[
              styles.subTabText,
              activeSubTab === 'disponiveis' && { color: COLORS.pureWhite }
            ]}>Disponíveis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.subTabPill,
              activeSubTab === 'meus' && { backgroundColor: COLORS.roxoDigital }
            ]}
            onPress={() => setActiveSubTab('meus')}
          >
            <Text style={[
              styles.subTabText,
              activeSubTab === 'meus' && { color: COLORS.pureWhite }
            ]}>Meus Cupons</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.subTabPill,
              activeSubTab === 'expirados' && { backgroundColor: COLORS.roxoDigital }
            ]}
            onPress={() => setActiveSubTab('expirados')}
          >
            <Text style={[
              styles.subTabText,
              activeSubTab === 'expirados' && { color: COLORS.pureWhite }
            ]}>Expirados</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Cupons Picotados Figma */}
        <View style={styles.couponsList}>
          {presetCoupons.map((cup) => {
            const isSaved = collectedIds.includes(cup.id);

            return (
              <View key={cup.id} style={styles.couponCard}>
                {/* Lado Esquerdo: Valor do Desconto */}
                <View style={styles.cardLeft}>
                  <Text style={styles.couponValue}>{cup.value}</Text>
                  <Text style={styles.offLabel}>OFF</Text>
                </View>

                {/* Linha Picotada Dotted Figma */}
                <View style={styles.dottedSeparatorContainer}>
                  <View style={styles.topNotch} />
                  <View style={styles.dottedLine} />
                  <View style={styles.bottomNotch} />
                </View>

                {/* Lado Direito: Informações e Ação */}
                <View style={styles.cardRight}>
                  <Text style={styles.couponTitle} numberOfLines={1}>{cup.title}</Text>
                  <Text style={styles.couponExpiry}>⏳ {cup.expiry}</Text>
                  
                  {isSaved ? (
                    <View style={styles.savedBadge}>
                      <Text style={styles.savedText}>✓ Salvo</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.collectBtn}
                      onPress={() => handleCollect(cup.id, cup.code)}
                    >
                      <Text style={styles.collectBtnText}>Coletar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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
  backBtn: {
    padding: 6,
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
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF1',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  subTabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  couponsList: {
    marginTop: 10,
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    height: 100,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    overflow: 'hidden',
  },
  cardLeft: {
    width: '30%',
    backgroundColor: '#FAF5FF', // Roxo super leve
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.roxoDigital,
  },
  offLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.roxoDigital,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  dottedSeparatorContainer: {
    width: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pureWhite,
    position: 'relative',
  },
  topNotch: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    left: -5,
  },
  bottomNotch: {
    position: 'absolute',
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    left: -5,
  },
  dottedLine: {
    flex: 1,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  cardRight: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.marromPremium,
  },
  couponExpiry: {
    fontSize: 11,
    color: COLORS.grayText,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  collectBtn: {
    backgroundColor: COLORS.laranjaAcao,
    borderRadius: 14,
    paddingVertical: 6,
    alignItems: 'center',
    width: 80,
  },
  collectBtnText: {
    color: COLORS.pureWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  savedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 6,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savedText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '800',
  },
  brandingText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 20,
  },
});
