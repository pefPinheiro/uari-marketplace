import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Animated
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useNavigation } from '../context/NavigationContext';

export default function SplashScreen() {
  const { navigate } = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.splashContainer}>
      <ScrollView contentContainerStyle={styles.splashScrollContent} showsVerticalScrollIndicator={false}>
        {/* Card do Logo Arredondado */}
        <Animated.View style={[styles.logoCardContainer, { opacity: fadeAnim }]}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.modelSplashLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Slogan em Itálico Roxo */}
        <Text style={styles.modelSplashSlogan}>Quebra essa castanha</Text>

        {/* Ilustração Central do Mercado de Tefé (Bordas Arredondadas) */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80' }} 
          style={styles.marketIllustration}
          resizeMode="cover"
        />

        {/* Indicador de Bolinhas (Dots) */}
        <View style={styles.dotsContainer}>
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        {/* Título Principal */}
        <Text style={styles.modelSplashTitle}>
          As melhores ofertas de Tefé em um só lugar.
        </Text>
        
        {/* Descrição Curta */}
        <Text style={styles.modelSplashSubtitle}>
          Conectamos você aos produtores e lojas locais com facilidade e rapidez.
        </Text>

        {/* Botão de Ação Laranja Premium */}
        <TouchableOpacity 
          style={styles.modelPrimaryButton}
          onPress={() => navigate('login')}
          activeOpacity={0.8}
        >
          <Text style={styles.modelPrimaryButtonText}>Começar agora</Text>
        </TouchableOpacity>

        {/* Divisor "OU ENTRE COM" */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU ENTRE COM</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botão Google Minimalista */}
        <TouchableOpacity style={styles.modelGoogleButton} onPress={() => navigate('login')}>
          <View style={styles.googleBtnContent}>
            <Text style={styles.googleIconEmoji}>🌐</Text>
            <Text style={styles.modelGoogleButtonText}>Google</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  splashScrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  logoCardContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 24,
    padding: 16,
    marginTop: 50,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  modelSplashLogo: {
    width: '100%',
    height: '100%',
  },
  modelSplashSlogan: {
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '800',
    color: COLORS.roxoDigital,
    marginBottom: 24,
    textAlign: 'center',
  },
  marketIllustration: {
    width: '100%',
    height: 190,
    borderRadius: 45,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.roxoDigital,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1C4E9',
    marginHorizontal: 4,
  },
  modelSplashTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  modelSplashSubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  modelPrimaryButton: {
    backgroundColor: COLORS.laranjaAcao,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.laranjaAcao,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modelPrimaryButtonText: {
    color: COLORS.pureWhite,
    fontSize: 17,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.grayText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelGoogleButton: {
    backgroundColor: '#E5E5E5',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconEmoji: {
    marginRight: 8,
    fontSize: 16,
  },
  modelGoogleButtonText: {
    color: '#333333',
    fontSize: 15.5,
    fontWeight: '700',
  },
});
