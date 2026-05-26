import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const { navigate } = useNavigation();
  const { signInDemo } = useAuth();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email || !senha) {
      setAuthError('Preencha todos os campos!');
      return;
    }
    if (senha.length < 6) {
      setAuthError('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              full_name: nome || 'Cliente Tefé',
            }
          }
        });

        if (error) throw error;
        
        alert('Cadastro realizado com sucesso! Bem-vindo ao UÁRI.');
        navigate('role_select');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (error) throw error;

        alert('Login efetuado com sucesso!');
        navigate('role_select');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    signInDemo();
    navigate('role_select');
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <ScrollView contentContainerStyle={styles.loginScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.loginLogoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.loginLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.loginTitle}>
          {isRegistering ? 'Criar Conta UÁRI' : 'Bem-vindo de volta!'}
        </Text>
        <Text style={styles.loginSubtitle}>
          {isRegistering 
            ? 'Cadastre-se para aproveitar as melhores ofertas de Tefé-AM.' 
            : 'Faça login para gerenciar suas compras, cupons ou vendas.'}
        </Text>

        {authError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {authError}</Text>
          </View>
        ) : null}

        {isRegistering && (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Seu Nome Completo</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Digite seu nome"
              placeholderTextColor={COLORS.grayText}
              value={nome}
              onChangeText={setNome}
            />
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={styles.textInput}
            placeholder="exemplo@uamail.com"
            placeholderTextColor={COLORS.grayText}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={COLORS.grayText}
            secureTextEntry
            autoCapitalize="none"
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity 
          style={[styles.modelPrimaryButton, loading && { opacity: 0.7 }]} 
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.pureWhite} />
          ) : (
            <Text style={styles.modelPrimaryButtonText}>
              {isRegistering ? 'Cadastrar e Entrar' : 'Entrar'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toggleAuthMode} 
          onPress={() => {
            setIsRegistering(!isRegistering);
            setAuthError('');
          }}
        >
          <Text style={styles.toggleAuthText}>
            {isRegistering 
              ? 'Já tem uma conta? Faça login aqui' 
              : 'Não tem conta? Cadastre-se em Tefé'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU TESTE RÁPIDO</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={handleDemo}
        >
          <Text style={styles.demoButtonText}>Entrar sem login (Demonstração)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  loginScrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loginLogoContainer: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 12,
    marginTop: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  loginLogo: {
    width: '100%',
    height: '100%',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.marromPremium,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.marromPremium,
    marginBottom: 6,
    paddingLeft: 4,
  },
  textInput: {
    backgroundColor: COLORS.pureWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#212121',
  },
  toggleAuthMode: {
    marginTop: 8,
    paddingVertical: 8,
  },
  toggleAuthText: {
    color: COLORS.roxoDigital,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    color: '#555555',
    fontSize: 14.5,
    fontWeight: '700',
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
});
