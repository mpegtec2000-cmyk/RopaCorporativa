-- ============================================================
-- ZORTEX CRM & Analítica Web + Atribución Meta Ads (Migración)
-- ============================================================
-- Ejecuta este script en Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hjuawsyqgrascremrwwc/sql/new
-- Es idempotente (puedes ejecutarlo varias veces sin perder datos).
-- ============================================================

-- 1. Tabla de Eventos de Tráfico y Analítica en Vivo
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  path TEXT DEFAULT '/' NOT NULL,
  referrer TEXT,
  source TEXT DEFAULT 'Directo' NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  gclid TEXT,
  device TEXT DEFAULT 'desktop' NOT NULL,
  browser TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_source ON public.analytics_events(source);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON public.analytics_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON public.analytics_events(visitor_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.analytics_events TO service_role;
GRANT INSERT ON public.analytics_events TO anon, authenticated;

DROP POLICY IF EXISTS "Permitir registrar eventos publicamente" ON public.analytics_events;
CREATE POLICY "Permitir registrar eventos publicamente" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a service_role en analytics_events" ON public.analytics_events;
CREATE POLICY "Permitir todo a service_role en analytics_events" ON public.analytics_events
  FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 2. Columnas CRM y Atribución de Campañas Meta en Cotizaciones
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS valor_estimado BIGINT DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS proximo_seguimiento TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS fbclid TEXT;
