/**
 * Motor de Analítica Web & Atribución de Campañas Meta Ads para ZORTEX.
 *
 * Persistencia inteligente:
 *  1. Usa la tabla `public.analytics_events` en Supabase si existe.
 *  2. Si la tabla aún no fue migrada en Supabase, usa un buffer automático
 *     en `cms_settings` (key: `analytics_buffer`) o archivo local `data/cms/analytics.json`
 *     para que funcione al instante en localhost y producción sin fallos.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSupabase, isSupabaseConfigured } from '../supabase';
import { getQuotes, isReadOnlyEnvironment } from './store';
import type { AnalyticsEvent, AnalyticsEventType } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'cms');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const BUFFER_KEY = 'analytics_buffer';
const MAX_BUFFER_EVENTS = 1500;

export type AnalyticsRange = '24h' | '7d' | '30d' | 'all';

export interface TrackEventInput {
  event_type: AnalyticsEventType;
  event_id?: string | null;
  visitor_id: string;
  session_id: string;
  path?: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string | null;
  metadata?: Record<string, any> | null;
}

/** Clasifica la fuente de tráfico en canales limpios orientados a Meta Ads / B2B. */
export function classifyTrafficSource(input: {
  utm_source?: string | null;
  utm_medium?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  referrer?: string | null;
}): string {
  const src = (input.utm_source || '').toLowerCase().trim();
  const med = (input.utm_medium || '').toLowerCase().trim();
  const ref = (input.referrer || '').toLowerCase().trim();

  const isPaid =
    med.includes('cpc') ||
    med.includes('paid') ||
    med.includes('ads') ||
    med.includes('ppc') ||
    Boolean(input.fbclid);

  if (src.includes('ig') || src.includes('instagram')) {
    return isPaid ? 'Meta Ads (Instagram)' : 'Instagram Orgánico';
  }
  if (src.includes('meta') || src.includes('fb') || src.includes('facebook')) {
    return isPaid ? 'Meta Ads (Facebook)' : 'Facebook Orgánico';
  }
  if (input.fbclid) {
    if (ref.includes('instagram')) return 'Meta Ads (Instagram)';
    return 'Meta Ads (Facebook)';
  }
  if (src.includes('google') || input.gclid) {
    return input.gclid || isPaid ? 'Google Ads' : 'Google Orgánico';
  }
  if (src.includes('whatsapp') || src.includes('wa')) return 'WhatsApp';
  if (src.includes('linkedin')) return 'LinkedIn';
  if (src.includes('tiktok')) return isPaid ? 'TikTok Ads' : 'TikTok';
  if (src) return `UTM: ${input.utm_source}`;

  if (ref) {
    if (ref.includes('instagram.com') || ref.includes('l.instagram.com')) return 'Instagram Orgánico';
    if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('m.facebook.com') || ref.includes('l.facebook.com')) {
      return 'Facebook Orgánico';
    }
    if (ref.includes('google.')) return 'Google Orgánico';
    if (ref.includes('bing.com') || ref.includes('duckduckgo') || ref.includes('yahoo.')) return 'Buscadores';
    if (ref.includes('linkedin.com')) return 'LinkedIn';
    if (ref.includes('whatsapp.com')) return 'WhatsApp';
    if (!ref.includes('zortex.cl') && !ref.includes('localhost')) {
      try {
        const host = new URL(ref).hostname.replace(/^www\./, '');
        return `Referido (${host})`;
      } catch {
        return 'Referido';
      }
    }
  }

  return 'Directo';
}

export function detectDeviceAndBrowser(userAgent: string | null): {
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
} {
  const ua = userAgent || '';
  const lower = ua.toLowerCase();
  let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(lower)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini|fban|fbav|instagram/i.test(lower)) {
    device = 'mobile';
  }

  let browser = 'Otro';
  if (lower.includes('instagram')) browser = 'Instagram In-App';
  else if (lower.includes('fban') || lower.includes('fbav')) browser = 'Facebook In-App';
  else if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome') && !lower.includes('edg')) browser = 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
  else if (lower.includes('firefox')) browser = 'Firefox';

  return { device, browser };
}

let tableStatusCache: { exists: boolean; at: number } | null = null;

async function hasAnalyticsTable(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  if (tableStatusCache && Date.now() - tableStatusCache.at < 60_000) {
    return tableStatusCache.exists;
  }
  try {
    const { error } = await getSupabase().from('analytics_events').select('id').limit(1);
    const exists = !error;
    tableStatusCache = { exists, at: Date.now() };
    return exists;
  } catch {
    tableStatusCache = { exists: false, at: Date.now() };
    return false;
  }
}

async function readLocalEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalEvents(events: AnalyticsEvent[]): Promise<void> {
  if (isReadOnlyEnvironment()) return;
  await fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true });
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(events.slice(0, MAX_BUFFER_EVENTS)), 'utf8');
}

async function readBufferEvents(): Promise<AnalyticsEvent[]> {
  try {
    if (isSupabaseConfigured) {
      const { data } = await getSupabase()
        .from('cms_settings')
        .select('value')
        .eq('key', BUFFER_KEY)
        .maybeSingle();
      if (Array.isArray(data?.value)) return data.value as AnalyticsEvent[];
    }
  } catch {}
  return readLocalEvents();
}

async function appendBufferEvent(ev: AnalyticsEvent): Promise<void> {
  const existing = await readBufferEvents();
  const next = [ev, ...existing].slice(0, MAX_BUFFER_EVENTS);
  try {
    if (isSupabaseConfigured) {
      const { error } = await getSupabase()
        .from('cms_settings')
        .upsert({ key: BUFFER_KEY, value: next, updated_at: new Date().toISOString() });
      if (!error) return;
    }
  } catch {}
  await writeLocalEvents(next);
}

/** Registra un evento de analítica web (PageView, ViewProduct, AddToCart, WhatsApp, Quote). */
export async function recordAnalyticsEvent(input: TrackEventInput): Promise<AnalyticsEvent> {
  const source = classifyTrafficSource(input);
  const now = new Date().toISOString();
  const ev: AnalyticsEvent = {
    id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: now,
    event_type: input.event_type,
    event_id: input.event_id || null,
    visitor_id: String(input.visitor_id || 'anon').slice(0, 80),
    session_id: String(input.session_id || 'sess').slice(0, 80),
    path: String(input.path || '/').slice(0, 240),
    referrer: input.referrer ? String(input.referrer).slice(0, 400) : null,
    source,
    utm_source: input.utm_source ? String(input.utm_source).slice(0, 120) : null,
    utm_medium: input.utm_medium ? String(input.utm_medium).slice(0, 120) : null,
    utm_campaign: input.utm_campaign ? String(input.utm_campaign).slice(0, 160) : null,
    utm_content: input.utm_content ? String(input.utm_content).slice(0, 160) : null,
    utm_term: input.utm_term ? String(input.utm_term).slice(0, 160) : null,
    fbclid: input.fbclid ? String(input.fbclid).slice(0, 200) : null,
    gclid: input.gclid ? String(input.gclid).slice(0, 200) : null,
    device: input.device || 'desktop',
    browser: input.browser || 'Otro',
    metadata: input.metadata || {},
  };

  if (await hasAnalyticsTable()) {
    const { error } = await getSupabase().from('analytics_events').insert({
      event_type: ev.event_type,
      event_id: ev.event_id,
      visitor_id: ev.visitor_id,
      session_id: ev.session_id,
      path: ev.path,
      referrer: ev.referrer,
      source: ev.source,
      utm_source: ev.utm_source,
      utm_medium: ev.utm_medium,
      utm_campaign: ev.utm_campaign,
      utm_content: ev.utm_content,
      utm_term: ev.utm_term,
      fbclid: ev.fbclid,
      gclid: ev.gclid,
      device: ev.device,
      browser: ev.browser,
      metadata: ev.metadata,
    });
    if (!error) return ev;
    // Si falló por cualquier motivo, cae al buffer
    tableStatusCache = null;
  }

  await appendBufferEvent(ev);
  return ev;
}

function rangeStartDate(range: AnalyticsRange): Date | null {
  const now = Date.now();
  if (range === '24h') return new Date(now - 24 * 60 * 60 * 1000);
  if (range === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (range === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

async function fetchEventsForRange(range: AnalyticsRange): Promise<{
  events: AnalyticsEvent[];
  storageMode: 'supabase_table' | 'buffer';
}> {
  const since = rangeStartDate(range);

  if (await hasAnalyticsTable()) {
    const sb = getSupabase();
    let query = sb
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (since) {
      query = query.gte('created_at', since.toISOString());
    }
    const { data, error } = await query;
    if (!error && data) {
      return { events: data as AnalyticsEvent[], storageMode: 'supabase_table' };
    }
  }

  const all = await readBufferEvents();
  const filtered = since
    ? all.filter((e) => new Date(e.created_at).getTime() >= since.getTime())
    : all;
  return { events: filtered, storageMode: 'buffer' };
}

/** Calcula todas las métricas del panel de Analítica, Tráfico y CRM. */
export async function getAnalyticsDashboard(range: AnalyticsRange = '7d') {
  const [{ events, storageMode }, quotes] = await Promise.all([
    fetchEventsForRange(range),
    getQuotes(),
  ]);

  const since = rangeStartDate(range);
  const rangedQuotes = since
    ? quotes.filter((q) => new Date(q.created_at).getTime() >= since.getTime())
    : quotes;

  const nowMs = Date.now();
  const activeCutoff = nowMs - 5 * 60 * 1000;

  const pageViews = events.filter((e) => e.event_type === 'page_view');
  const uniqueVisitorsSet = new Set(events.map((e) => e.visitor_id));
  const uniqueSessionsSet = new Set(events.map((e) => e.session_id));
  const liveVisitorsSet = new Set(
    events.filter((e) => new Date(e.created_at).getTime() >= activeCutoff).map((e) => e.visitor_id)
  );

  const productViews = events.filter((e) => e.event_type === 'view_product');
  const searches = events.filter((e) => e.event_type === 'search');
  const addToCarts = events.filter((e) => e.event_type === 'add_to_cart');
  const checkoutStarts = events.filter((e) => e.event_type === 'initiate_checkout');
  const whatsappClicks = events.filter((e) => e.event_type === 'whatsapp_click');
  const trackedQuotes = events.filter((e) => e.event_type === 'quote_submit');

  const leadsCount = Math.max(rangedQuotes.length, trackedQuotes.length);
  const totalUnique = uniqueVisitorsSet.size;
  const conversionRate = totalUnique > 0 ? Number(((leadsCount / totalUnique) * 100).toFixed(2)) : 0;
  const contactRate =
    totalUnique > 0 ? Number((((leadsCount + whatsappClicks.length) / totalUnique) * 100).toFixed(2)) : 0;

  // Pipeline CRM en CLP
  const pipelineValue = rangedQuotes
    .filter((q) => q.estado !== 'perdido')
    .reduce((acc, q) => acc + (Number(q.valor_estimado) || 0), 0);
  const wonValue = rangedQuotes
    .filter((q) => q.estado === 'ganado')
    .reduce((acc, q) => acc + (Number(q.valor_estimado) || 0), 0);
  const wonCount = rangedQuotes.filter((q) => q.estado === 'ganado').length;

  // Serie temporal (por hora en 24h, por día en 7d/30d/all)
  const bucketMap = new Map<string, { label: string; visits: number; visitors: Set<string>; conversions: number }>();

  if (range === '24h') {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(nowMs - i * 3600 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}`;
      const label = `${String(d.getHours()).padStart(2, '0')}:00`;
      bucketMap.set(key, { label, visits: 0, visitors: new Set(), conversions: 0 });
    }
  } else {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 14;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      bucketMap.set(key, { label, visits: 0, visitors: new Set(), conversions: 0 });
    }
  }

  events.forEach((e) => {
    const d = new Date(e.created_at);
    const key =
      range === '24h'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const bucket = bucketMap.get(key);
    if (!bucket) return;
    if (e.event_type === 'page_view') bucket.visits += 1;
    bucket.visitors.add(e.visitor_id);
    if (e.event_type === 'whatsapp_click' || e.event_type === 'quote_submit') {
      bucket.conversions += 1;
    }
  });

  const timeline = Array.from(bucketMap.values()).map((b) => ({
    label: b.label,
    visits: b.visits,
    uniqueVisitors: b.visitors.size,
    conversions: b.conversions,
  }));

  // Fuentes de tráfico
  const sourceStats = new Map<
    string,
    { source: string; visits: number; visitors: Set<string>; whatsapp: number; quotes: number }
  >();

  events.forEach((e) => {
    const src = e.source || 'Directo';
    if (!sourceStats.has(src)) {
      sourceStats.set(src, { source: src, visits: 0, visitors: new Set(), whatsapp: 0, quotes: 0 });
    }
    const row = sourceStats.get(src)!;
    if (e.event_type === 'page_view') row.visits += 1;
    row.visitors.add(e.visitor_id);
    if (e.event_type === 'whatsapp_click') row.whatsapp += 1;
    if (e.event_type === 'quote_submit') row.quotes += 1;
  });

  const sources = Array.from(sourceStats.values())
    .map((s) => ({
      source: s.source,
      visits: s.visits,
      uniqueVisitors: s.visitors.size,
      whatsapp: s.whatsapp,
      quotes: s.quotes,
      convRate: s.visitors.size > 0 ? Number((((s.quotes + s.whatsapp) / s.visitors.size) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.visits - a.visits || b.uniqueVisitors - a.uniqueVisitors);

  // Campañas UTM (ideal para medir campañas Meta Ads)
  const campaignStats = new Map<
    string,
    {
      campaign: string;
      source: string;
      medium: string;
      content: string;
      visits: number;
      visitors: Set<string>;
      addToCart: number;
      whatsapp: number;
      quotes: number;
    }
  >();

  events.forEach((e) => {
    if (!e.utm_campaign && !e.fbclid && !e.gclid) return;
    const campaignName = e.utm_campaign || (e.fbclid ? '(Meta sin UTM Campaign)' : '(Google sin UTM Campaign)');
    const key = `${campaignName}__${e.utm_source || e.source}`;
    if (!campaignStats.has(key)) {
      campaignStats.set(key, {
        campaign: campaignName,
        source: e.utm_source || e.source,
        medium: e.utm_medium || (e.fbclid ? 'paid_social' : 'cpc'),
        content: e.utm_content || '',
        visits: 0,
        visitors: new Set(),
        addToCart: 0,
        whatsapp: 0,
        quotes: 0,
      });
    }
    const row = campaignStats.get(key)!;
    if (e.event_type === 'page_view') row.visits += 1;
    row.visitors.add(e.visitor_id);
    if (e.event_type === 'add_to_cart') row.addToCart += 1;
    if (e.event_type === 'whatsapp_click') row.whatsapp += 1;
    if (e.event_type === 'quote_submit') row.quotes += 1;
  });

  const campaigns = Array.from(campaignStats.values())
    .map((c) => ({
      campaign: c.campaign,
      source: c.source,
      medium: c.medium,
      content: c.content,
      visits: c.visits,
      uniqueVisitors: c.visitors.size,
      addToCart: c.addToCart,
      whatsapp: c.whatsapp,
      quotes: c.quotes,
      convRate: c.visitors.size > 0 ? Number((((c.quotes + c.whatsapp) / c.visitors.size) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  // Top Productos más vistos / agregados
  const prodMap = new Map<string, { name: string; category: string; views: number; adds: number }>();
  events.forEach((e) => {
    if (e.event_type !== 'view_product' && e.event_type !== 'add_to_cart') return;
    const name = String(e.metadata?.product_name || e.metadata?.name || '').trim();
    if (!name) return;
    const cat = String(e.metadata?.category || 'Catálogo');
    if (!prodMap.has(name)) {
      prodMap.set(name, { name, category: cat, views: 0, adds: 0 });
    }
    const p = prodMap.get(name)!;
    if (e.event_type === 'view_product') p.views += 1;
    if (e.event_type === 'add_to_cart') p.adds += 1;
  });
  const topProducts = Array.from(prodMap.values())
    .sort((a, b) => b.adds * 3 + b.views - (a.adds * 3 + a.views))
    .slice(0, 8);

  // Dispositivos (por visitante único)
  const devVisitors = { mobile: new Set<string>(), desktop: new Set<string>(), tablet: new Set<string>() };
  events.forEach((e) => {
    const d = e.device === 'mobile' || e.device === 'tablet' ? e.device : 'desktop';
    devVisitors[d].add(e.visitor_id);
  });
  const devices = {
    mobile: devVisitors.mobile.size,
    desktop: devVisitors.desktop.size,
    tablet: devVisitors.tablet.size,
  };

  // Embudo B2B
  const funnel = [
    { step: 'Visitas Web (Únicos)', count: totalUnique, color: '#2563EB' },
    {
      step: 'Vieron Producto',
      count: new Set(productViews.map((e) => e.visitor_id)).size,
      color: '#0EA5E9',
    },
    {
      step: 'Agregaron a Cotización',
      count: new Set(addToCarts.map((e) => e.visitor_id)).size,
      color: '#8B5CF6',
    },
    {
      step: 'Clic WhatsApp / Contacto',
      count: new Set(whatsappClicks.map((e) => e.visitor_id)).size,
      color: '#10B981',
    },
    { step: 'Cotizaciones Formales', count: leadsCount, color: '#F59E0B' },
    { step: 'Ventas Ganadas', count: wonCount, color: '#059669' },
  ];

  // Feed en vivo (últimos 25 eventos)
  const recentEvents = events.slice(0, 25).map((e) => ({
    id: e.id,
    created_at: e.created_at,
    event_type: e.event_type,
    source: e.source,
    utm_campaign: e.utm_campaign || '',
    device: e.device,
    browser: e.browser || '',
    path: e.path,
    detail:
      e.metadata?.product_name ||
      e.metadata?.search_query ||
      e.metadata?.cta_location ||
      e.metadata?.empresa ||
      '',
  }));

  return {
    range,
    storageMode,
    kpis: {
      pageViews: pageViews.length,
      uniqueVisitors: totalUnique,
      sessions: uniqueSessionsSet.size,
      liveUsers: liveVisitorsSet.size,
      productViews: productViews.length,
      searches: searches.length,
      addToCarts: addToCarts.length,
      checkoutStarts: checkoutStarts.length,
      whatsappClicks: whatsappClicks.length,
      quotesCount: leadsCount,
      wonCount,
      conversionRate,
      contactRate,
      pipelineValue,
      wonValue,
    },
    timeline,
    funnel,
    sources,
    campaigns,
    topProducts,
    devices,
    recentEvents,
  };
}
