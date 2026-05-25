-- ==========================================
-- 🌰 UÁRI MARKETPLACE - SCHEMA DE BANCO DE DADOS
-- ==========================================

-- Habilitar a extensão pgcrypto para geração de UUIDs, caso não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TIPOS ENUM (ESTRUTURA DE DADOS)
-- ==========================================
CREATE TYPE user_role AS ENUM ('user', 'store', 'admin');
CREATE TYPE order_status AS ENUM ('pending_payment', 'paid', 'ready_for_pickup', 'completed', 'disputed', 'refunded');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card');
CREATE TYPE discount_type AS ENUM ('percent', 'value');
CREATE TYPE withdrawal_status AS ENUM ('requested', 'approved', 'rejected');
CREATE TYPE transaction_type AS ENUM ('credit_sale', 'debit_fee', 'withdrawal', 'refund');

-- ==========================================
-- 2. TABELAS DO SISTEMA
-- ==========================================

-- 2.1 Perfis de Usuários (Estendendo Auth.Users do Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexar role para buscas e permissões rápidas
CREATE INDEX idx_profiles_role ON profiles(role);

-- 2.2 Lojas (Módulo Lojista)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    document_cnpj TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00 NOT NULL CHECK (rating >= 0 AND rating <= 5.00),
    address JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_stores_owner ON stores(owner_id);

-- 2.3 Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    original_price NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
    current_price NUMERIC(10,2) NOT NULL CHECK (current_price >= 0),
    images TEXT[] DEFAULT '{}'::text[] NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'rejected')),
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);

-- 2.4 Promoções (Agendamento de Campanhas)
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    promotional_price NUMERIC(10,2) NOT NULL CHECK (promotional_price >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    CHECK (end_date > start_date)
);

CREATE INDEX idx_promotions_product ON promotions(product_id);

-- 2.5 Cupons de Desconto
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL se criado pelo Admin da Plataforma
    code TEXT NOT NULL UNIQUE,
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    type discount_type NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses INTEGER DEFAULT 100 NOT NULL CHECK (max_uses >= 0),
    uses_count INTEGER DEFAULT 0 NOT NULL CHECK (uses_count <= max_uses),
    created_by TEXT DEFAULT 'store' NOT NULL CHECK (created_by IN ('admin', 'store')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- 2.6 Pedidos (Vendas / Fluxo Escrow)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (discount >= 0),
    platform_fee NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (platform_fee >= 0), -- Comissão da Plataforma (ex: 10%)
    store_net NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (store_net >= 0), -- Valor Líquido do Lojista (ex: 90%)
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    status order_status DEFAULT 'pending_payment' NOT NULL,
    payment_method payment_method DEFAULT 'pix' NOT NULL,
    handshake_qr_code TEXT NOT NULL UNIQUE, -- Código QR único gerado para entrega física
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 2.7 Itens do Pedido
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 2.8 Carteiras dos Lojistas (Para Dashboard Financeiro)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
    available_balance NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (available_balance >= 0), -- Saldo disponível para saque imediato
    escrow_balance NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (escrow_balance >= 0), -- Saldo retido (garantia até QR Code Handshake)
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.9 Histórico de Transações Financeiras das Carteiras
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_transactions_wallet ON wallet_transactions(wallet_id);

-- 2.10 Solicitações de Saque de Lojistas
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    pix_key TEXT NOT NULL,
    status withdrawal_status DEFAULT 'requested' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_withdrawals_store ON withdrawals(store_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- 2.11 Sistema de Gamificação (Pontos Castanha)
CREATE TABLE gamification_points (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0 NOT NULL CHECK (points_balance >= 0)
);

-- 2.12 Prêmios da Gamificação
CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    draw_date TIMESTAMPTZ NOT NULL,
    is_drawn BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2.13 Bilhetes de Sorteio gerados com Pontos Castanha
CREATE TABLE raffle_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_tickets_user ON raffle_tickets(user_id);
CREATE INDEX idx_tickets_prize ON raffle_tickets(prize_id);

-- ==========================================
-- 3. TRIGGERS E FUNÇÕES DE BANCO DE DADOS (AUTOMATIZAÇÕES)
-- ==========================================

-- 3.1 Criar Perfil de Usuário Automaticamente no Cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        'user'::user_role
    );
    
    -- Iniciar a carteira de pontos do usuário
    INSERT INTO public.gamification_points (user_id, points_balance)
    VALUES (new.id, 0);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.2 Criar Carteira do Lojista Automaticamente na Criação da Loja
CREATE OR REPLACE FUNCTION public.handle_new_store()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (store_id, available_balance, escrow_balance)
    VALUES (new.id, 0.00, 0.00);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_store_created
    AFTER INSERT ON stores
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_store();

-- 3.3 Motor Financeiro: Gerenciamento Automático de Escrow e Splits
CREATE OR REPLACE FUNCTION public.process_order_financials()
RETURNS TRIGGER AS $$
DECLARE
    v_wallet_id UUID;
    v_points_to_add INT;
BEGIN
    -- Obter a carteira do lojista associado ao pedido
    SELECT id INTO v_wallet_id FROM public.wallets WHERE store_id = new.store_id;

    -- Caso 1: Pedido foi Pago (paid) -> Reter valor líquido no Escrow do lojista
    IF new.status = 'paid' AND (old.status IS NULL OR old.status = 'pending_payment') THEN
        -- Adicionar valor líquido ao escrow_balance
        UPDATE public.wallets
        SET escrow_balance = escrow_balance + new.store_net,
            updated_at = now()
        WHERE id = v_wallet_id;

        -- Registrar transação do tipo venda a crédito (retido no escrow)
        INSERT INTO public.wallet_transactions (wallet_id, order_id, type, amount)
        VALUES (v_wallet_id, new.id, 'credit_sale', new.store_net);

    -- Caso 2: Pedido Concluído (completed - Handshake por QR Code realizado) -> Liberar Escrow para Saldo Disponível
    ELSIF new.status = 'completed' AND old.status = 'paid' THEN
        -- Transferir saldo retido (escrow) para saldo disponível
        UPDATE public.wallets
        SET escrow_balance = escrow_balance - new.store_net,
            available_balance = available_balance + new.store_net,
            updated_at = now()
        WHERE id = v_wallet_id;

        -- Creditar Pontos Castanha ao Consumidor (Gamificação: R$ 10.00 = 1 Ponto)
        v_points_to_add := floor(new.total / 10);
        IF v_points_to_add > 0 THEN
            UPDATE public.gamification_points
            SET points_balance = points_balance + v_points_to_add
            WHERE user_id = new.user_id;
        END IF;

    -- Caso 3: Pedido Estornado (refunded) -> Retirar do Escrow ou do Saldo Disponível
    ELSIF new.status = 'refunded' AND old.status IN ('paid', 'ready_for_pickup') THEN
        -- Retirar o valor do escrow_balance
        UPDATE public.wallets
        SET escrow_balance = escrow_balance - new.store_net,
            updated_at = now()
        WHERE id = v_wallet_id;

        -- Registrar transação de estorno
        INSERT INTO public.wallet_transactions (wallet_id, order_id, type, amount)
        VALUES (v_wallet_id, new.id, 'refund', -new.store_net);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION public.process_order_financials();

-- 3.4 Controle de Saques: Debitar da Carteira se Aprovado
CREATE OR REPLACE FUNCTION public.process_store_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Obter a carteira do lojista
    SELECT id INTO v_wallet_id FROM public.wallets WHERE store_id = new.store_id;

    -- Caso 1: Nova solicitação de saque -> Reter valor do saldo disponível para evitar saques duplicados
    IF new.status = 'requested' AND (old.status IS NULL) THEN
        UPDATE public.wallets
        SET available_balance = available_balance - new.amount,
            updated_at = now()
        WHERE id = v_wallet_id;

    -- Caso 2: Saque Rejeitado pelo Admin -> Devolver valor retido para o saldo disponível
    ELSIF new.status = 'rejected' AND old.status = 'requested' THEN
        UPDATE public.wallets
        SET available_balance = available_balance + new.amount,
            updated_at = now()
        WHERE id = v_wallet_id;

    -- Caso 3: Saque Aprovado/Pago pelo Admin -> Consolidar débito e registrar transação
    ELSIF new.status = 'approved' AND old.status = 'requested' THEN
        INSERT INTO public.wallet_transactions (wallet_id, type, amount)
        VALUES (v_wallet_id, 'withdrawal', -new.amount);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_withdrawal_status_change
    AFTER UPDATE OF status OR INSERT ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION public.process_store_withdrawal();

-- ==========================================
-- 4. POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas cruciais
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

-- 4.1 Perfis (profiles)
CREATE POLICY "Leitura pública de perfis" ON profiles 
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

-- 4.2 Lojas (stores)
CREATE POLICY "Leitura pública de lojas" ON stores 
    FOR SELECT USING (true);

CREATE POLICY "Lojistas podem criar/editar suas próprias lojas" ON stores 
    FOR ALL USING (auth.uid() = owner_id);

-- 4.3 Produtos (products)
CREATE POLICY "Leitura pública de produtos publicados" ON products 
    FOR SELECT USING (status = 'published');

CREATE POLICY "Lojistas podem ver todos os seus produtos" ON products 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Lojistas podem criar/editar seus produtos" ON products 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()
        )
    );

-- 4.4 Promoções (promotions)
CREATE POLICY "Leitura pública de promoções" ON promotions 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Lojistas podem editar suas promoções" ON promotions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM products
            JOIN stores ON stores.id = products.store_id
            WHERE products.id = promotions.product_id AND stores.owner_id = auth.uid()
        )
    );

-- 4.5 Pedidos (orders)
CREATE POLICY "Consumidores visualizam suas próprias compras" ON orders 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Lojistas visualizam pedidos de sua loja" ON orders 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Consumidores criam seus pedidos" ON orders 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.6 Carteiras (wallets)
CREATE POLICY "Lojistas visualizam apenas sua própria carteira" ON wallets 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = wallets.store_id AND stores.owner_id = auth.uid()
        )
    );

-- 4.7 Saques (withdrawals)
CREATE POLICY "Lojistas veem seus próprios saques" ON withdrawals 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = withdrawals.store_id AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Lojistas criam solicitações de saque" ON withdrawals 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = withdrawals.store_id AND stores.owner_id = auth.uid()
        )
    );
