/**
 * Capa de datos del CMS ZORTEX (solo servidor).
 *
 * Estrategia "en vivo":
 *  1. Si Supabase está configurado y existen las tablas del CMS (ver supabase/cms-schema.sql),
 *     todo se lee y escribe en Supabase → los cambios del panel se reflejan en el sitio al instante.
 *  2. Si no, se usa un almacenamiento local en `data/cms/*.json` (ideal para `astro dev`).
 *  3. Si aún no hay datos guardados, se sirve el catálogo base del repositorio (config.ts).
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { PRODUCTS as BASE_PRODUCTS, SITE } from '../../config';
import { getSupabase, isSupabaseConfigured } from '../supabase';
import type { Backend, CmsProduct, Quote, QuoteItem, QuoteStatus, SiteSettings } from './types';

/* ------------------------------------------------------------------ */
/* Configuración                                                       */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), 'data', 'cms');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');

const T_PRODUCTS = 'cms_products';
const T_SETTINGS = 'cms_settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  heroBadge: 'Distribuidor Mayorista B2B en Chile',
  heroTitle: 'Los Mejores Proveedores en Ropa Corporativa, Industrial y EPP',
  heroLead:
    'Venta al por mayor para empresas de todos los rubros. Precios escalonados por volumen, bordado y estampado de logo corporativo con despacho a todo Chile.',
  contactEmail: SITE.email,
  contactPhone: SITE.phone,
  contactAddress: SITE.address,
  topbarWhatsappText: 'Atención Directa por WhatsApp',
  metaPixelId: '2526844321476728',
  metaPixelEnabled: true,
  metaDomainVerification: '',
  metaCapiToken: '',
  metaTestEventCode: '',
};

const SYS_PREFIX = '__sys_';

/**
 * Almacenamiento KV resiliente en Supabase:
 * 1. Usa `cms_settings` si existe.
 * 2. Si `cms_settings` aún no se migró, guarda un registro oculto (`__sys_<key>`, `is_active: false`)
 *    en `cms_products` (ya existente en producción) para que funcione 100% en vivo en Vercel sin SQL extra.
 */
export async function readSystemKv<T>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  const sb = getSupabase();
  try {
    const { data, error } = await sb.from(T_SETTINGS).select('value').eq('key', key).maybeSingle();
    if (!error) return (data?.value as T) ?? null;
  } catch {}
  try {
    const { data, error } = await sb
      .from(T_PRODUCTS)
      .select('data')
      .eq('id', `${SYS_PREFIX}${key}`)
      .maybeSingle();
    if (!error && data?.data) return (data.data as any).value as T;
  } catch {}
  return null;
}

export async function writeSystemKv(key: string, value: unknown): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const sb = getSupabase();
  const now = new Date().toISOString();
  try {
    const { error } = await sb.from(T_SETTINGS).upsert({ key, value, updated_at: now });
    if (!error) return true;
  } catch {}
  try {
    const { error } = await sb.from(T_PRODUCTS).upsert({
      id: `${SYS_PREFIX}${key}`,
      sku: null,
      name: `[SYSTEM] ${key}`,
      category: '__system__',
      is_active: false,
      is_featured: false,
      sort_order: 999999,
      data: { value },
      updated_at: now,
    });
    if (!error) return true;
  } catch {}
  return false;
}

/* ------------------------------------------------------------------ */
/* Detección de backend                                                */
/* ------------------------------------------------------------------ */

export function isReadOnlyEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    (process.env.NODE_ENV === 'production' && !process.env.LOCAL_DEV)
  );
}

let backendCache: { value: Backend; at: number } | null = null;

export async function getBackend(): Promise<Backend> {
  const now = Date.now();
  if (backendCache && now - backendCache.at < 30_000) return backendCache.value;

  let value: Backend = 'local';
  if (isSupabaseConfigured) {
    try {
      const { error } = await getSupabase().from(T_PRODUCTS).select('id').limit(1);
      if (!error) {
        value = 'supabase';
      } else {
        // Si cms_products aún no existe, probar con quotes
        const { error: qErr } = await getSupabase().from('quotes').select('id').limit(1);
        if (!qErr) {
          value = 'supabase';
        }
      }
    } catch {
      value = 'local';
    }
  }
  backendCache = { value, at: now };
  return value;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  if (isReadOnlyEnvironment()) {
    throw new Error(
      'Entorno de solo lectura detectado (Vercel/Serverless). No se puede escribir en archivos locales. ' +
        'Ejecuta "supabase/cms-schema.sql" en el SQL Editor de tu proyecto Supabase para trabajar con base de datos en producción.'
    );
  }
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err: any) {
    throw new Error(
      'No se pudo guardar en el almacenamiento local. ' +
        `Detalle: ${err?.message || err}`
    );
  }
}

export function slugify(input: string): string {
  return (input || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function baseCatalog(): CmsProduct[] {
  return (BASE_PRODUCTS as CmsProduct[]).map((p, i) => ({
    ...p,
    isActive: true,
    isFeatured: false,
    sortOrder: i,
  }));
}

function toWebp(url: string): string {
  if (!url || typeof url !== 'string') return url;
  if (url.endsWith('.webp') || url.endsWith('.svg')) return url;
  const webpUrl = url.replace(/\.(png|jpe?g)$/i, '.webp');
  try {
    const diskPath = path.join(process.cwd(), 'public', webpUrl.replace(/^\//, ''));
    if (fsSync.existsSync(diskPath)) {
      return webpUrl;
    }
  } catch {}
  return url;
}

function normalizeProduct(p: CmsProduct): CmsProduct {
  const rawImages = (p.images || []).filter(Boolean);
  const rawImage = p.image || rawImages[0] || '';
  const image = toWebp(rawImage);
  const images = (rawImages.length ? rawImages : rawImage ? [rawImage] : []).map(toWebp);
  const colors = (p.colors || []).filter((c) => c && c.name).map((c) => ({
    ...c,
    image: c.image ? toWebp(c.image) : image,
  }));
  return {
    ...p,
    id: String(p.id).trim(),
    name: String(p.name || '').trim(),
    image,
    images,
    colors,
    sizes: (p.sizes || []).map((s) => String(s).trim()).filter(Boolean),
    features: (p.features || []).filter((f) => f && f.name && f.value),
    isActive: p.isActive !== false,
    isFeatured: Boolean(p.isFeatured),
    sortOrder: Number.isFinite(p.sortOrder) ? Number(p.sortOrder) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Productos                                                           */
/* ------------------------------------------------------------------ */

let productsCache: { data: CmsProduct[]; at: number; seeded: boolean } | null = null;
const PRODUCTS_TTL = 8_000;

function invalidateProducts() {
  productsCache = null;
}

function rowToProduct(row: any): CmsProduct {
  return normalizeProduct({
    ...(row.data || {}),
    id: row.id,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function productToRow(p: CmsProduct) {
  const { isActive, isFeatured, sortOrder, createdAt, updatedAt, ...data } = p;
  return {
    id: p.id,
    sku: p.sku || null,
    name: p.name,
    category: p.category,
    is_active: isActive !== false,
    is_featured: Boolean(isFeatured),
    sort_order: Number(sortOrder) || 0,
    data,
    updated_at: new Date().toISOString(),
  };
}

/** Devuelve todos los productos (incluye inactivos). */
export async function getAllProducts(): Promise<{ products: CmsProduct[]; seeded: boolean }> {
  if (productsCache && Date.now() - productsCache.at < PRODUCTS_TTL) {
    return { products: productsCache.data, seeded: productsCache.seeded };
  }

  const backend = await getBackend();
  let products: CmsProduct[] = [];
  let seeded = false;

  if (backend === 'supabase') {
    const sb = getSupabase();
    const rows: any[] = [];
    // Paginación para catálogos grandes (>1000 filas)
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb
        .from(T_PRODUCTS)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    if (rows.length > 0) {
      products = rows
        .filter((r) => !String(r.id || '').startsWith(SYS_PREFIX) && r.category !== '__system__')
        .map(rowToProduct);
      seeded = products.length > 0;
      if (!seeded) products = baseCatalog();
    } else {
      products = baseCatalog();
    }
  } else {
    const local = await readJson<CmsProduct[]>(PRODUCTS_FILE);
    if (local && Array.isArray(local)) {
      products = local.map(normalizeProduct).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      seeded = true;
    } else {
      products = baseCatalog();
    }
  }

  productsCache = { data: products, at: Date.now(), seeded };
  return { products, seeded };
}

/** Productos visibles en el sitio público. */
export async function getPublicProducts(): Promise<CmsProduct[]> {
  try {
    const { products } = await getAllProducts();
    return products.filter((p) => p.isActive !== false);
  } catch (err) {
    console.error('[CMS] Error leyendo productos, usando catálogo base:', err);
    return baseCatalog();
  }
}

export async function getProductById(id: string): Promise<CmsProduct | null> {
  const { products } = await getAllProducts();
  return products.find((p) => p.id === id) || null;
}

/** Copia el catálogo base al backend si aún no tiene datos. */
export async function ensureSeeded(): Promise<number> {
  const { seeded } = await getAllProducts();
  if (seeded) return 0;
  const base = baseCatalog();
  const backend = await getBackend();
  if (backend === 'supabase') {
    const sb = getSupabase();
    for (let i = 0; i < base.length; i += 100) {
      const chunk = base.slice(i, i + 100).map(productToRow);
      const { error } = await sb.from(T_PRODUCTS).upsert(chunk);
      if (error) throw new Error(`Error al importar catálogo: ${error.message}`);
    }
  } else {
    await writeJson(PRODUCTS_FILE, base);
  }
  invalidateProducts();
  return base.length;
}

export async function saveProduct(input: CmsProduct): Promise<CmsProduct> {
  await ensureSeeded();
  const { products } = await getAllProducts();
  const now = new Date().toISOString();

  let id = String(input.id || '').trim();
  const existing = id ? products.find((p) => p.id === id) : undefined;
  if (!id) {
    id = `${slugify(input.name)}-${Date.now().toString(36)}`;
  }

  const minOrder = products.reduce((m, p) => Math.min(m, p.sortOrder ?? 0), 0);
  const product = normalizeProduct({
    ...(existing || {}),
    ...input,
    id,
    baseId: input.baseId || existing?.baseId || id,
    sortOrder: existing ? existing.sortOrder : input.sortOrder ?? minOrder - 1,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (!product.name) throw new Error('El nombre del producto es obligatorio.');
  if (!product.category) throw new Error('La categoría es obligatoria.');

  const backend = await getBackend();
  if (backend === 'supabase') {
    const row = productToRow(product);
    const { error } = await getSupabase()
      .from(T_PRODUCTS)
      .upsert(existing ? row : { ...row, created_at: now });
    if (error) throw new Error(error.message);
  } else {
    const next = existing ? products.map((p) => (p.id === id ? product : p)) : [product, ...products];
    await writeJson(PRODUCTS_FILE, next);
  }

  invalidateProducts();
  return product;
}

export async function patchProduct(id: string, updates: Partial<CmsProduct>): Promise<CmsProduct> {
  const current = await getProductById(id);
  if (!current) throw new Error('Producto no encontrado.');
  return saveProduct({ ...current, ...updates, id });
}

export async function deleteProduct(id: string): Promise<void> {
  await ensureSeeded();
  const backend = await getBackend();
  if (backend === 'supabase') {
    const { error } = await getSupabase().from(T_PRODUCTS).delete().eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { products } = await getAllProducts();
    await writeJson(
      PRODUCTS_FILE,
      products.filter((p) => p.id !== id)
    );
  }
  invalidateProducts();
}

/* ------------------------------------------------------------------ */
/* Contenido del sitio                                                 */
/* ------------------------------------------------------------------ */

let settingsCache: { data: SiteSettings; at: number } | null = null;

export async function getSettings(): Promise<SiteSettings> {
  if (settingsCache && Date.now() - settingsCache.at < PRODUCTS_TTL) return settingsCache.data;
  let stored: Partial<SiteSettings> | null = null;
  try {
    if ((await getBackend()) === 'supabase') {
      stored = await readSystemKv<Partial<SiteSettings>>('site');
    } else {
      stored = await readJson<Partial<SiteSettings>>(SETTINGS_FILE);
    }
  } catch (err) {
    console.error('[CMS] Error leyendo contenido:', err);
  }
  const merged: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...(stored || {}),
    metaPixelId: (stored?.metaPixelId ?? process.env.PUBLIC_META_PIXEL_ID ?? DEFAULT_SETTINGS.metaPixelId ?? '').trim(),
    metaPixelEnabled:
      typeof stored?.metaPixelEnabled === 'boolean'
        ? stored.metaPixelEnabled
        : Boolean(stored?.metaPixelId || process.env.PUBLIC_META_PIXEL_ID || DEFAULT_SETTINGS.metaPixelEnabled),
    metaDomainVerification: (stored?.metaDomainVerification ?? process.env.META_DOMAIN_VERIFICATION ?? '').trim(),
    metaCapiToken: (stored?.metaCapiToken ?? process.env.META_CAPI_TOKEN ?? '').trim(),
    metaTestEventCode: (stored?.metaTestEventCode ?? process.env.META_TEST_EVENT_CODE ?? '').trim(),
  };
  settingsCache = { data: merged, at: Date.now() };
  return merged;
}

/** Versión segura de settings para exponer en HTML público o API sin secretos (sin metaCapiToken). */
export async function getPublicSettings(): Promise<SiteSettings> {
  const s = await getSettings();
  const hasToken = Boolean(s.metaCapiToken && s.metaCapiToken.trim().length > 8);
  const { metaCapiToken: _secret, ...safe } = s;
  return { ...safe, hasMetaCapiToken: hasToken };
}

export async function saveSettings(input: Partial<SiteSettings> & { clearMetaCapiToken?: boolean }): Promise<SiteSettings> {
  const current = await getSettings();
  const clean: Partial<SiteSettings> = {};
  const stringKeys: (keyof SiteSettings)[] = [
    'heroBadge',
    'heroTitle',
    'heroLead',
    'contactEmail',
    'contactPhone',
    'contactAddress',
    'topbarWhatsappText',
    'metaPixelId',
    'metaDomainVerification',
    'metaTestEventCode',
  ];
  stringKeys.forEach((k) => {
    if (typeof input[k] === 'string') {
      (clean as any)[k] = String(input[k]).trim();
    }
  });
  if (typeof input.metaPixelEnabled === 'boolean') {
    clean.metaPixelEnabled = input.metaPixelEnabled;
  }
  if (input.clearMetaCapiToken) {
    clean.metaCapiToken = '';
  } else if (typeof input.metaCapiToken === 'string' && input.metaCapiToken.trim() !== '') {
    clean.metaCapiToken = input.metaCapiToken.trim();
  }

  const merged: SiteSettings = { ...current, ...clean };
  delete merged.hasMetaCapiToken;

  if ((await getBackend()) === 'supabase') {
    const ok = await writeSystemKv('site', merged);
    if (!ok) throw new Error('No se pudo guardar la configuración en Supabase.');
  } else {
    await writeJson(SETTINGS_FILE, merged);
  }
  settingsCache = null;
  const hasToken = Boolean(merged.metaCapiToken && merged.metaCapiToken.trim().length > 8);
  const { metaCapiToken: _secret, ...safe } = merged;
  return { ...safe, hasMetaCapiToken: hasToken };
}

/* ------------------------------------------------------------------ */
/* Cotizaciones                                                        */
/* ------------------------------------------------------------------ */

export interface NewQuoteInput {
  empresa: string;
  rut?: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  personalizacion?: string;
  plazo?: string;
  mensaje?: string;
  valor_estimado?: number;
  proximo_seguimiento?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  fbclid?: string;
  items: QuoteItem[];
}

interface QuoteCrmMeta {
  valor_estimado?: number | null;
  proximo_seguimiento?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
}

const CRM_META_FILE = path.join(DATA_DIR, 'crm-quote-meta.json');

async function readCrmMetaMap(): Promise<Record<string, QuoteCrmMeta>> {
  try {
    if ((await getBackend()) === 'supabase') {
      const val = await readSystemKv<Record<string, QuoteCrmMeta>>('crm_quote_meta');
      if (val && typeof val === 'object') return val;
      return {};
    }
    return (await readJson<Record<string, QuoteCrmMeta>>(CRM_META_FILE)) || {};
  } catch {
    return {};
  }
}

async function saveCrmMetaForQuote(id: string, meta: Partial<QuoteCrmMeta>): Promise<void> {
  try {
    const map = await readCrmMetaMap();
    map[id] = { ...(map[id] || {}), ...meta };
    if ((await getBackend()) === 'supabase') {
      await writeSystemKv('crm_quote_meta', map);
    } else if (!isReadOnlyEnvironment()) {
      await writeJson(CRM_META_FILE, map);
    }
  } catch (err) {
    console.warn('[CRM] No se pudo guardar metadato auxiliar:', err);
  }
}

function isMissingColumnError(err: any): boolean {
  const msg = String(err?.message || '').toLowerCase();
  return (
    err?.code === 'PGRST204' ||
    err?.code === '42703' ||
    msg.includes('could not find the') ||
    (msg.includes('column') && msg.includes('does not exist'))
  );
}

export async function createQuote(input: NewQuoteInput): Promise<string> {
  const baseRow = {
    empresa: input.empresa,
    rut: input.rut || null,
    nombre: input.nombre,
    telefono: input.telefono || null,
    correo: input.correo || null,
    personalizacion: input.personalizacion || null,
    plazo: input.plazo || null,
    mensaje: input.mensaje || null,
    estado: 'nuevo',
  };
  const crmFields: QuoteCrmMeta = {
    valor_estimado: Number.isFinite(input.valor_estimado) ? Number(input.valor_estimado) : 0,
    proximo_seguimiento: input.proximo_seguimiento || null,
    source: input.source || null,
    utm_source: input.utm_source || null,
    utm_medium: input.utm_medium || null,
    utm_campaign: input.utm_campaign || null,
    utm_content: input.utm_content || null,
    fbclid: input.fbclid || null,
  };

  // 1. Si Supabase está configurado, intentar guardar siempre en la base de datos
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase();
      let usedShadowMeta = false;
      let { data: quote, error } = await sb
        .from('quotes')
        .insert({ ...baseRow, ...crmFields })
        .select('id')
        .single();

      if (error && isMissingColumnError(error)) {
        // Fallback transparente si aún no se ejecutó analytics-crm-migration.sql
        usedShadowMeta = true;
        const retry = await sb.from('quotes').insert(baseRow).select('id').single();
        quote = retry.data;
        error = retry.error;
      }

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          throw new Error(
            'La tabla "quotes" no existe en Supabase. Debes ejecutar el script "supabase/cms-schema.sql" en el SQL Editor de tu proyecto Supabase para habilitar el guardado en producción.'
          );
        }
        throw new Error(`Error en base de datos Supabase: ${error.message}`);
      }

      if (!quote) {
        throw new Error('No se pudo crear la cotización en Supabase.');
      }

      if (usedShadowMeta && Object.values(crmFields).some((v) => v !== null && v !== 0 && v !== '')) {
        await saveCrmMetaForQuote(quote.id as string, crmFields);
      }

      if (input.items.length) {
        const { error: itemsError } = await sb.from('quote_items').insert(
          input.items.map((it) => ({
            quote_id: quote.id,
            producto: it.producto,
            categoria: it.categoria || null,
            cantidad: it.cantidad,
            talla: it.talla || null,
          }))
        );
        if (itemsError) {
          console.error('[CMS] Error insertando ítems:', itemsError);
        }
      }
      return quote.id as string;
    } catch (err: any) {
      if (isReadOnlyEnvironment()) {
        throw err;
      }
      console.warn('[CMS] Supabase no disponible en entorno local, usando almacenamiento JSON local:', err.message);
    }
  }

  // 2. Si estamos en producción/Vercel y Supabase no está configurado
  if (isReadOnlyEnvironment()) {
    throw new Error(
      'No se pudo almacenar la cotización: Supabase no está configurado en producción. ' +
      'Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel y ejecuta "supabase/cms-schema.sql" en Supabase.'
    );
  }

  // 3. Fallback solo para desarrollo local (con disco modificable)
  const quotes = (await readJson<Quote[]>(QUOTES_FILE)) || [];
  const id = `q-${Date.now().toString(36)}`;
  quotes.unshift({
    id,
    created_at: new Date().toISOString(),
    ...baseRow,
    ...crmFields,
    estado: 'nuevo',
    notas: null,
    items: input.items,
  });
  await writeJson(QUOTES_FILE, quotes);
  return id;
}

export async function getQuotes(): Promise<Quote[]> {
  try {
    const metaMap = await readCrmMetaMap();
    if (isSupabaseConfigured) {
      const { data, error } = await getSupabase()
        .from('quotes')
        .select('*, items:quote_items(producto, categoria, cantidad, talla)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (!error && data) {
        return data.map((q: any) => {
          const shadow = metaMap[q.id] || {};
          return {
            ...shadow,
            ...q,
            valor_estimado: q.valor_estimado ?? shadow.valor_estimado ?? 0,
            proximo_seguimiento: q.proximo_seguimiento ?? shadow.proximo_seguimiento ?? null,
            source: q.source ?? shadow.source ?? null,
            utm_source: q.utm_source ?? shadow.utm_source ?? null,
            utm_medium: q.utm_medium ?? shadow.utm_medium ?? null,
            utm_campaign: q.utm_campaign ?? shadow.utm_campaign ?? null,
            utm_content: q.utm_content ?? shadow.utm_content ?? null,
            fbclid: q.fbclid ?? shadow.fbclid ?? null,
            estado: q.estado || 'nuevo',
            items: q.items || [],
          };
        });
      }
    }
    const local = (await readJson<Quote[]>(QUOTES_FILE)) || [];
    return local.map((q) => ({ ...(metaMap[q.id] || {}), ...q }));
  } catch (err) {
    console.error('[CMS] Error leyendo cotizaciones:', err);
    return [];
  }
}

export async function updateQuote(
  id: string,
  updates: {
    estado?: QuoteStatus;
    notas?: string;
    valor_estimado?: number;
    proximo_seguimiento?: string;
  }
): Promise<void> {
  const basePatch: Record<string, unknown> = {};
  const crmPatch: Partial<QuoteCrmMeta> = {};
  if (updates.estado) basePatch.estado = updates.estado;
  if (typeof updates.notas === 'string') basePatch.notas = updates.notas;
  if (typeof updates.valor_estimado === 'number' && Number.isFinite(updates.valor_estimado)) {
    crmPatch.valor_estimado = Math.max(0, Math.round(updates.valor_estimado));
  }
  if (typeof updates.proximo_seguimiento === 'string') {
    crmPatch.proximo_seguimiento = updates.proximo_seguimiento.trim() || null;
  }

  const fullPatch = { ...basePatch, ...crmPatch };

  if (isSupabaseConfigured) {
    const sb = getSupabase();
    const { error } = await sb.from('quotes').update(fullPatch).eq('id', id);
    if (!error) return;
    if (isMissingColumnError(error)) {
      if (Object.keys(basePatch).length > 0) {
        const retry = await sb.from('quotes').update(basePatch).eq('id', id);
        if (retry.error && isReadOnlyEnvironment()) throw new Error(retry.error.message);
      }
      if (Object.keys(crmPatch).length > 0) {
        await saveCrmMetaForQuote(id, crmPatch);
      }
      return;
    }
    if (isReadOnlyEnvironment()) throw new Error(error.message);
  }
  const quotes = (await readJson<Quote[]>(QUOTES_FILE)) || [];
  await writeJson(
    QUOTES_FILE,
    quotes.map((q) => (q.id === id ? { ...q, ...fullPatch } : q))
  );
}

export async function deleteQuote(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await getSupabase().from('quotes').delete().eq('id', id);
    if (!error) return;
    if (isReadOnlyEnvironment()) throw new Error(error.message);
  }
  const quotes = (await readJson<Quote[]>(QUOTES_FILE)) || [];
  await writeJson(
    QUOTES_FILE,
    quotes.filter((q) => q.id !== id)
  );
}
