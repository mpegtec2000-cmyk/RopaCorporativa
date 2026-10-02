-- ============================================================
-- Supabase schema for EPP Landing — Quotes & Quote Items
-- Run this SQL in the Supabase SQL Editor.
-- ============================================================

-- Tabla de cotizaciones
CREATE TABLE public.quotes (
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
  estado TEXT DEFAULT 'nuevo'
);

-- Ítems de cada cotización
CREATE TABLE public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  producto TEXT NOT NULL,
  categoria TEXT,
  cantidad INT DEFAULT 1 CHECK (cantidad >= 1),
  talla TEXT
);

-- Índice para buscar ítems por cotización
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);

-- Índice para filtrar cotizaciones por estado
CREATE INDEX idx_quotes_estado ON public.quotes(estado);

-- RLS activado: sin policies públicas.
-- Solo el service_role key (server-side) puede leer y escribir.
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- No se crean policies → anon y authenticated no tienen acceso.
-- Solo service_role bypasses RLS.
