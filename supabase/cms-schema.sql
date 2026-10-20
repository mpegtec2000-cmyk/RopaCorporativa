-- ============================================================
-- ZORTEX SaaS & CMS Schema (Tablas para gestión en vivo)
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase:
--    https://supabase.com/dashboard/project/hjuawsyqgrascremrwwc/sql/new
-- 2. Pega todo este contenido en el SQL Editor y presiona "RUN" (o Ctrl+Enter).
-- 3. Una vez ejecutado con éxito, las cotizaciones y productos se guardarán
--    directamente en Supabase en tiempo real.
-- ============================================================

-- Extensiones necesarias para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Cotizaciones Públicas
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  empresa TEXT NOT NULL,
  rut TEXT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  correo TEXT,
  personalizacion TEXT DEFAULT 'Sin logo',
  plazo TEXT,
  mensaje TEXT,
  estado TEXT DEFAULT 'nuevo',
  notas TEXT
);

-- 2. Ítems de Cotizaciones
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  producto TEXT NOT NULL,
  categoria TEXT,
  cantidad INT DEFAULT 1 CHECK (cantidad >= 1),
  talla TEXT
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_estado ON public.quotes(estado);

-- 3. Tabla de Productos del CMS (SaaS en Vivo)
CREATE TABLE IF NOT EXISTS public.cms_products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INT DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_products_cat ON public.cms_products(category);
CREATE INDEX IF NOT EXISTS idx_cms_products_active ON public.cms_products(is_active);

-- 4. Tabla de Ajustes Generales de la Web (Textos de Hero, Contacto, Redes)
CREATE TABLE IF NOT EXISTS public.cms_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;

-- Permisos sobre el esquema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.quotes TO anon, authenticated;
GRANT SELECT, INSERT ON public.quote_items TO anon, authenticated;
GRANT SELECT ON public.cms_products TO anon, authenticated;
GRANT SELECT ON public.cms_settings TO anon, authenticated;

-- Políticas de Seguridad RLS
-- cms_products: Lectura pública de productos activos, acceso total para service_role
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.cms_products;
CREATE POLICY "Permitir lectura publica de productos" ON public.cms_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en cms_products" ON public.cms_products;
CREATE POLICY "Permitir todo a service_role en cms_products" ON public.cms_products
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- cms_settings: Lectura pública de configuración
DROP POLICY IF EXISTS "Permitir lectura publica de configuracion" ON public.cms_settings;
CREATE POLICY "Permitir lectura publica de configuracion" ON public.cms_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en cms_settings" ON public.cms_settings;
CREATE POLICY "Permitir todo a service_role en cms_settings" ON public.cms_settings
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- quotes: Inserción pública para cotizaciones, lectura/gestión para service_role
DROP POLICY IF EXISTS "Permitir crear cotizaciones publicamente" ON public.quotes;
CREATE POLICY "Permitir crear cotizaciones publicamente" ON public.quotes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en quotes" ON public.quotes;
CREATE POLICY "Permitir todo a service_role en quotes" ON public.quotes
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- quote_items: Inserción pública para ítems de cotizaciones
DROP POLICY IF EXISTS "Permitir crear items publicamente" ON public.quote_items;
CREATE POLICY "Permitir crear items publicamente" ON public.quote_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en quote_items" ON public.quote_items;
CREATE POLICY "Permitir todo a service_role en quote_items" ON public.quote_items
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
