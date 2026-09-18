-- ==============================================================================
-- OMACHI STORE - SUPABASE DATABASE SCHEMA DDL
-- Hướng dẫn: Mở Supabase Dashboard -> SQL Editor -> Dán toàn bộ file này -> Nhấn RUN
-- ==============================================================================

-- 1. BẢNG CÀI ĐẶT CỬA HÀNG (SETTINGS)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  shop_name TEXT,
  brand_title TEXT,
  slogan TEXT,
  hotline TEXT,
  zalo_phone TEXT,
  zalo_official_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  banner_text TEXT,
  shop_address TEXT,
  working_hours TEXT,
  free_shipping_threshold NUMERIC DEFAULT 1000000,
  prepaid_free_ship_threshold NUMERIC DEFAULT 10000,
  enable_prepaid_free_ship BOOLEAN DEFAULT TRUE,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  enable_telegram_notify BOOLEAN DEFAULT TRUE,
  bank_id TEXT,
  bank_account TEXT,
  bank_owner TEXT,
  momo_phone TEXT,
  momo_name TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG DANH MỤC SẢN PHẨM (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  slug TEXT,
  icon TEXT DEFAULT '🌸',
  description TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG SẢN PHẨM (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  slug TEXT,
  category_id TEXT,
  category_name TEXT,
  base_price NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  cost_price NUMERIC,
  material TEXT,
  dimensions TEXT,
  weight NUMERIC DEFAULT 50,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  is_hot BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_customizable BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 100,
  sold_count INTEGER DEFAULT 0,
  rating_avg NUMERIC DEFAULT 5,
  rating_count INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  combo_tiers JSONB DEFAULT '[]'::jsonb,
  package_options JSONB DEFAULT '[]'::jsonb,
  min_order_quantity INTEGER DEFAULT 1,
  step_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG KHÁCH HÀNG (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  password TEXT,
  has_account BOOLEAN DEFAULT FALSE,
  address TEXT,
  district TEXT,
  city TEXT,
  saved_addresses JSONB DEFAULT '[]'::jsonb,
  customer_type TEXT DEFAULT 'NEW',
  total_orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  items_summary TEXT,
  subtotal NUMERIC DEFAULT 0,
  subtotal_amount NUMERIC DEFAULT 0,
  combo_discount_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  items_total_amount NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total_weight NUMERIC DEFAULT 0,
  final_total_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'UNPAID',
  order_status TEXT DEFAULT 'PENDING_CONFIRM',
  carrier_name TEXT,
  tracking_number TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  customer JSONB DEFAULT '{}'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG ĐÁNH GIÁ PHẢN HỒI (FEEDBACKS)
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  comment TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  purchased_product TEXT,
  avatar_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- BẢO MẬT & PHÂN QUYỀN (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;
CREATE POLICY "Allow all on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;
CREATE POLICY "Allow all on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on products" ON public.products;
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on customers" ON public.customers;
CREATE POLICY "Allow all on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on feedbacks" ON public.feedbacks;
CREATE POLICY "Allow all on feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- CHỈ MỤC TỐC ĐỘ CAO (INDEXES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders (code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);

-- ==============================================================================
-- CẬP NHẬT CỘT BỔ SUNG NẾU BẢNG ĐÃ TỒN TẠI (IDEMPOTENT MIGRATIONS)
-- ==============================================================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 50;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by TEXT;