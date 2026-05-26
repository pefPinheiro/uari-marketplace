import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';

interface ClienteTabProfileProps {
  points: number;
  onSelectTab: (tab: 'home' | 'busca' | 'pedidos' | 'perfil') => void;
}

export default function ClienteTabProfile({ points, onSelectTab }: ClienteTabProfileProps) {
  const { profile, signOut } = useAuth();
  const { navigate } = useNavigation();

  const handleSignOut = () => {
    Alert.alert(
      'Sair da Conta 🌰',
      'Deseja realmente sair da sua conta UÁRI?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
            navigate('login');
          } 
        }
      ]
    );
  };

  const menuItems = [
    { 
      label: 'Meus Pedidos', 
      icon: '🛍️', 
      onPress: () => onSelectTab('pedidos') 
    },
    { 
      label: 'Cupons & Descontos', 
      icon: '🎟️', 
      onPress: () => navigate('coupons') 
    },
    { 
      label: 'Lojas Seguidas', 
      icon: '❤️', 
      onPress: () => Alert.alert('Lojas Seguidas', 'Você está seguindo a Castanha & Cia!') 
    },
    { 
      label: 'Meus Endereços', 
      icon: '📍', 
      onPress: () => Alert.alert('Meus Endereços', 'Endereço principal: Bairro Japiim, Tefé-AM') 
    },
    { 
      label: 'Ajuda & Suporte', 
      icon: '💬', 
      onPress: () => Alert.alert('Ajuda & Suporte', 'Envie um e-mail para suporte@uari.com.br ou fale no chat.') 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Fixo Figma */}
      <View style={styles.header}>
        <View style={{ width: 28 }} />
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        
        {/* Informações do Usuário Figma */}
        <View style={styles.userInfoContainer}>
          <Image 
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' }} 
            style={styles.avatarImg}
          />
          <Text style={styles.userName}>{profile?.full_name || 'Ana Clara Oliveira'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Cliente Verificado</Text>
          </View>
        </View>

        {/* Card de Saldo de Pontos Premium Figma */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Text style={styles.pointsLabel}>🌰 CASTANHA</Text>
            <TouchableOpacity onPress={() => Alert.alert('Extrato de Castanhas', 'Histórico de pontos acumulados nas compras.')}>
              <Text style={styles.extratoLink}>Ver extrato</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.walletSub}>Saldo UÁRI</Text>
          <Text style={styles.pointsValue}>R$ {(points * 1.21).toFixed(2)}</Text>
          <Text style={styles.pointsText}>🌰 {points} Pontos de Fidelidade</Text>
        </View>

        {/* Lista de Opções do Menu Figma */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.menuItemCard}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.arrowRight}>→</Text>
            </TouchableOpacity>
          ))}

          {/* Botão Sair da Conta */}
          <TouchableOpacity 
            style={styles.logoutCard}
            onPress={handleSignOut}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Sair da conta</Text>
            </View>
            <Text style={[styles.arrowRight, { color: '#E53935' }]}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionBranding}>Quebra essa castanha{"\n"}VERSÃO 1.7.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
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
  logo: {
    width: 60,
    height: 30,
  },
  settingsBtn: {
    padding: 6,
  },
  settingsIcon: {
    fontSize: 20,
    color: COLORS.marromPremium,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.pureWhite,
    backgroundColor: COLORS.border,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.marromPremium,
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  verifiedText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '800',
  },
  pointsCard: {
    backgroundColor: '#FAF5FF', // Roxo super claro
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E1BEE7',
    shadowColor: COLORS.roxoDigital,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.roxoDigital,
    letterSpacing: 1,
  },
  extratoLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.roxoDigital,
    textDecorationLine: 'underline',
  },
  walletSub: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 12,
    fontWeight: '700',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.laranjaAcao,
    marginTop: 2,
  },
  pointsText: {
    fontSize: 13,
    color: COLORS.marromPremium,
    fontWeight: '700',
    marginTop: 6,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.marromPremium,
  },
  arrowRight: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.grayText,
  },
  logoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E53935',
  },
  versionBranding: {
    fontSize: 11,
    color: COLORS.grayText,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 24,
    lineHeight: 16,
  },
});
