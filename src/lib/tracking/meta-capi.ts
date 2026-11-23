/**
 * Meta Conversions API (CAPI) — Envío Server-Side Profesional con Deduplicación.
 *
 * Permite mejorar drásticamente el Event Match Quality (EMQ) de las campañas
 * de Meta Ads enviando eventos desde el servidor con hashing SHA-256 (email,
 * teléfono, nombre, país) + cookies `_fbp`/`_fbc` + IP + User-Agent + `event_id`
 * idéntico al del navegador (`fbq`) para deduplicación exacta.
 */
import crypto from 'node:crypto';
import { getSettings } from '../cms/store';

export type MetaStandardEventName =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Contact'
  | 'Lead';

export interface MetaCapiEventInput {
  eventName: MetaStandardEventName;
  eventId: string;
  eventSourceUrl: string;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  fbclid?: string | null;
  visitorId?: string | null;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  customData?: Record<string, any>;
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return clean.includes('@') ? clean : null;
}

/** Normaliza teléfonos chilenos o internacionales a solo dígitos con código país (56...). */
function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits || digits.length < 8) return null;
  if (digits.length === 9 && digits.startsWith('9')) {
    digits = `56${digits}`;
  } else if (digits.length === 8) {
    digits = `569${digits}`;
  }
  return digits;
}

export function extractCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function extractClientIp(request: Request): string | null {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    null
  );
}

/** Envía un evento a Meta Conversions API (no lanza excepciones que bloqueen el flujo principal). */
export async function sendMetaCapiEvent(
  input: MetaCapiEventInput,
  options?: { overrideTestCode?: string }
): Promise<{ sent: boolean; skipped?: string; metaResponse?: any; error?: string }> {
  try {
    const settings = await getSettings();
    const pixelId = (settings.metaPixelId || '').trim();
    const token = (settings.metaCapiToken || '').trim();

    if (!settings.metaPixelEnabled || !pixelId) {
      return { sent: false, skipped: 'Pixel desactivado o sin Pixel ID configurado.' };
    }
    if (!token) {
      return { sent: false, skipped: 'No hay Access Token de Conversions API configurado.' };
    }

    const userData: Record<string, any> = {
      country: [sha256('cl')],
    };

    if (input.clientIp) userData.client_ip_address = input.clientIp;
    if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
    if (input.fbp) userData.fbp = input.fbp;

    // Construir fbc si viene fbclid pero no cookie _fbc
    if (input.fbc) {
      userData.fbc = input.fbc;
    } else if (input.fbclid) {
      userData.fbc = `fb.1.${Date.now()}.${input.fbclid}`;
    }

    if (input.visitorId) {
      userData.external_id = [sha256(input.visitorId.trim())];
    }

    const em = normalizeEmail(input.email);
    if (em) userData.em = [sha256(em)];

    const ph = normalizePhone(input.phone);
    if (ph) userData.ph = [sha256(ph)];

    if (input.fullName && input.fullName.trim()) {
      const tokens = input.fullName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .filter(Boolean);
      if (tokens[0]) userData.fn = [sha256(tokens[0])];
      if (tokens.length > 1) userData.ln = [sha256(tokens[tokens.length - 1])];
    }

    const eventPayload: Record<string, any> = {
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl || 'https://www.zortex.cl/',
      user_data: userData,
    };

    if (input.customData && Object.keys(input.customData).length > 0) {
      eventPayload.custom_data = input.customData;
    }

    const body: Record<string, any> = {
      data: [eventPayload],
    };

    const testCode = (options?.overrideTestCode ?? settings.metaTestEventCode ?? '').trim();
    if (testCode) {
      body.test_event_code = testCode;
    }

    const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        sent: false,
        error: json?.error?.message || `Meta API HTTP ${res.status}`,
        metaResponse: json,
      };
    }

    return { sent: true, metaResponse: json };
  } catch (err: any) {
    console.warn('[Meta CAPI] Error enviando evento:', err?.message || err);
    return { sent: false, error: err?.message || 'Error de conexión con Meta Graph API' };
  }
}
