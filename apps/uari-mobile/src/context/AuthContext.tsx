import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export type UserRole = 'user' | 'store' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Carregar sessão atual
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsDemo(false); // Reseta demonstração se houver evento real de auth
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (err) {
      console.warn('Erro ao carregar perfil do Supabase, criando perfil padrão:', err);
      // Fallback em caso de falha de conexão ou perfil inexistente
      setProfile({
        id: userId,
        email: user?.email || '',
        full_name: 'Usuário UÁRI',
        avatar_url: null,
        role: 'user',
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signInDemo = () => {
    setIsDemo(true);
    setUser({
      id: 'demo-user-id',
      email: 'demo@uari.com.br',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { full_name: 'Ana Clara (Demonstração)' },
      aud: 'authenticated',
      role: 'authenticated'
    } as User);
    setProfile({
      id: 'demo-user-id',
      email: 'demo@uari.com.br',
      full_name: 'Ana Clara (Demonstração)',
      avatar_url: null,
      role: 'user',
      created_at: new Date().toISOString()
    });
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
      setProfile(null);
      setLoading(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isDemo, signInDemo, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
