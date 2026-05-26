import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// URL fixa baseada no Project Ref "dyajgalsbkcpfrxbingn"
const supabaseUrl = 'https://dyajgalsbkcpfrxbingn.supabase.co';

// Chave pública de desenvolvimento (o usuário pode colar a chave Anon real aqui)
const supabaseAnonKey = 'SUA_CHAVE_ANON_DO_SUPABASE_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
