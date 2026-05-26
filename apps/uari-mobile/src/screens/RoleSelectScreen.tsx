import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useNavigation } from '../context/NavigationContext';

export default function RoleSelectScreen() {
  const { navigate } = useNavigation();

  return (
    <SafeAreaView style={styles.roleContainer}>
      <View style={styles.roleContent}>
        <Text style={styles.roleTitle}>Como você deseja entrar?</Text>
        <Text style={styles.roleSubtitle}>Escolha seu portal de acesso no UÁRI Marketplace.</Text>

        {/* Card Consumidor */}
        <TouchableOpacity 
          style={[styles.roleCard, { borderColor: COLORS.roxoDigital }]}
          onPress={() => navigate('user_home')}
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
          onPress={() => navigate('lojista_dashboard')}
          activeOpacity={0.9}
        >
          <View style={styles.roleBadgeContainer}>
            <Text style={[styles.roleBadge, { backgroundColor: COLORS.marromPremium }]}>LOJISTA</Text>
          </View>
          <Text style={styles.roleCardTitle}>Quero Vender</Text>
          <Text style={styles.roleCardDesc}>Gerenciar vendas, enviar fotos de estoque e ler QR Codes de entrega.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => navigate('splash')}>
          <Text style={styles.backLinkText}>Voltar para a abertura</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
