import { supabase } from '../../lib/supabase';

export interface DBProduct {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  original_price: number;
  current_price: number;
  images: string[];
  category: string;
  status: 'draft' | 'published' | 'rejected';
  stock: number;
  is_featured: boolean;
  created_at: string;
  store?: {
    name: string;
  };
}

export interface DBOrder {
  id: string;
  user_id: string;
  store_id: string;
  subtotal: number;
  discount: number;
  platform_fee: number;
  store_net: number;
  total: number;
  status: 'pending_payment' | 'paid' | 'ready_for_pickup' | 'completed' | 'disputed' | 'refunded';
  payment_method: 'pix' | 'credit_card';
  handshake_qr_code: string;
  created_at: string;
  client?: {
    full_name: string;
  };
  store?: {
    name: string;
  };
}

export const dbService = {
  /**
   * Busca todos os produtos publicados, juntando com as informações da loja
   */
  async fetchPublishedProducts(): Promise<DBProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, store:stores(name)')
        .eq('status', 'published');

      if (error) throw error;
      return data as DBProduct[];
    } catch (err) {
      console.error('Erro ao buscar produtos publicados:', err);
      return [];
    }
  },

  /**
   * Busca o saldo de pontos (Castanhas) do consumidor
   */
  async fetchPointsBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('gamification_points')
        .select('points_balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não existe ainda, vamos criá-lo
          await supabase.from('gamification_points').insert({ user_id: userId, points_balance: 0 });
          return 0;
        }
        throw error;
      }
      return data?.points_balance ?? 0;
    } catch (err) {
      console.error('Erro ao buscar saldo de pontos:', err);
      return 0;
    }
  },

  /**
   * Cria um pedido na tabela `orders` e insere seus itens na `order_items`
   */
  async createOrder(
    userId: string,
    storeId: string,
    subtotal: number,
    discount: number,
    paymentMethod: 'pix' | 'credit_card',
    items: { productId: string; price: number; quantity: number }[]
  ): Promise<DBOrder | null> {
    try {
      const platformFee = Number((subtotal * 0.10).toFixed(2));
      const storeNet = Number((subtotal - platformFee).toFixed(2));
      const total = Number((subtotal - discount).toFixed(2));
      const handshakeQrCode = `UARI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // 1. Inserir Pedido principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          store_id: storeId,
          subtotal,
          discount,
          platform_fee: platformFee,
          store_net: storeNet,
          total,
          status: 'pending_payment',
          payment_method: paymentMethod,
          handshake_qr_code: handshakeQrCode
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Inserir os itens do pedido
      const itemsToInsert = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return order as DBOrder;
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      return null;
    }
  },

  /**
   * Busca a loja associada a um proprietário
   */
  async fetchLojistaStore(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Loja não cadastrada ainda para o usuário
          return null;
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Erro ao buscar loja do lojista:', err);
      return null;
    }
  },

  /**
   * Cria uma loja padrão para teste/lojista novato se não existir
   */
  async createDemoStore(userId: string, storeName: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          owner_id: userId,
          name: storeName,
          description: 'Loja UÁRI criada em modo de demonstração/inicialização',
          is_verified: true,
          address: { city: 'Tefé', state: 'AM' }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao criar loja demonstrativa:', err);
      return null;
    }
  },

  /**
   * Busca a carteira de uma loja (saldo disponível e escrow retido)
   */
  async fetchWallet(storeId: string): Promise<{ available_balance: number; escrow_balance: number } | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('available_balance, escrow_balance')
        .eq('store_id', storeId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao consultar carteira da loja:', err);
      return null;
    }
  },

  /**
   * Solicita um saque Pix (débito instantâneo no disponível conforme trigger RLS)
   */
  async requestWithdrawal(storeId: string, amount: number, pixKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          store_id: storeId,
          amount,
          pix_key: pixKey,
          status: 'requested'
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao solicitar saque:', err);
      return false;
    }
  },

  /**
   * Busca os pedidos da loja que necessitam de ação (Pagos e Prontos para retirada)
   */
  async fetchPendingOrders(storeId: string): Promise<DBOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, client:profiles(full_name)')
        .eq('store_id', storeId)
        .in('status', ['paid', 'ready_for_pickup', 'pending_payment']);

      if (error) throw error;
      return data as DBOrder[];
    } catch (err) {
      console.error('Erro ao buscar pedidos da loja:', err);
      return [];
    }
  },

  /**
   * Completa o Handshake (QR Code).
   * Altera o status do pedido para 'completed'. O banco de dados se encarrega
   * de transferir o saldo do escrow para o disponível do lojista e adicionar
   * pontos castanha ao cliente.
   */
  async completeHandshake(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao realizar handshake do pedido:', err);
      return false;
    }
  },

  /**
   * Cria um rascunho de produto pelo lojista
   */
  async createProductDraft(storeId: string, title: string, price: number, category: string, imageUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          store_id: storeId,
          title,
          description: 'Enviado via aplicativo móvel UÁRI Lojista para curadoria.',
          original_price: price * 1.2, // Mock de markup original
          current_price: price,
          images: [imageUrl],
          category,
          status: 'draft',
          stock: 10
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao enviar draft de produto:', err);
      return false;
    }
  },

  /**
   * Busca os pedidos realizados por um determinado usuário/cliente
   */
  async fetchUserOrders(userId: string): Promise<DBOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, store:stores(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DBOrder[];
    } catch (err) {
      console.error('Erro ao buscar pedidos do usuário:', err);
      return [];
    }
  },

  /**
   * Busca cupons de desconto ativos
   */
  async fetchActiveCoupons(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar cupons:', err);
      return [];
    }
  },

  /**
   * Busca os produtos específicos de uma loja
   */
  async fetchProductsByStore(storeId: string): Promise<DBProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);

      if (error) throw error;
      return data as DBProduct[];
    } catch (err) {
      console.error('Erro ao buscar produtos da loja:', err);
      return [];
    }
  }
};
