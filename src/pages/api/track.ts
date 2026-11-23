import type { APIRoute } from 'astro';
import {
  detectDeviceAndBrowser,
  recordAnalyticsEvent,
} from '../../lib/cms/analytics';
import type { AnalyticsEventType } from '../../lib/cms/types';
import {
  extractClientIp,
  extractCookie,
  sendMetaCapiEvent,
  type MetaStandardEventName,
} from '../../lib/tracking/meta-capi';

export const prerender = false;

const ALLOWED_EVENTS = new Set<AnalyticsEventType>([
  'page_view',
  'view_product',
  'search',
  'add_to_cart',
  'initiate_checkout',
  'whatsapp_click',
  'quote_submit',
]);

const EVENT_TO_META: Partial<Record<AnalyticsEventType, MetaStandardEventName>> = {
  page_view: 'PageView',
  view_product: 'ViewContent',
  search: 'Search',
  add_to_cart: 'AddToCart',
  initiate_checkout: 'InitiateCheckout',
  whatsapp_click: 'Contact',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text();
    if (!rawText) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }
    const body = JSON.parse(rawText);
    const eventType = body.event_type as AnalyticsEventType;

    if (!ALLOWED_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ ok: false, error: 'Evento inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ignorar tráfico interno del panel /sistema
    const reqPath = String(body.path || '/');
    if (reqPath.startsWith('/sistema')) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ua = request.headers.get('user-agent');
    const { device, browser } = detectDeviceAndBrowser(ua);

    const saved = await recordAnalyticsEvent({
      event_type: eventType,
      event_id: body.event_id || null,
      visitor_id: body.visitor_id || 'anon',
      session_id: body.session_id || 'sess',
      path: reqPath,
      referrer: body.referrer || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      utm_term: body.utm_term || null,
      fbclid: body.fbclid || null,
      gclid: body.gclid || null,
      device,
      browser,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    });

    // Reenvío opcional server-side a Meta Conversions API (con deduplicación via event_id)
    const metaEventName = EVENT_TO_META[eventType];
    if (metaEventName && body.event_id) {
      const cookieHeader = request.headers.get('cookie');
      const fbp = body.fbp || extractCookie(cookieHeader, '_fbp');
      const fbc = body.fbc || extractCookie(cookieHeader, '_fbc');
      const meta = body.metadata || {};
      const customData: Record<string, any> = {};

      if (meta.product_name) customData.content_name = String(meta.product_name);
      if (meta.product_id) customData.content_ids = [String(meta.product_id)];
      if (meta.category) customData.content_category = String(meta.category);
      if (meta.qty) customData.num_items = Number(meta.qty) || 1;
      if (meta.search_query) customData.search_string = String(meta.search_query);
      if (meta.cta_location) customData.content_name = `WhatsApp (${meta.cta_location})`;
      if (metaEventName === 'AddToCart' || metaEventName === 'ViewContent') {
        customData.content_type = 'product';
        customData.currency = 'CLP';
      }

      // No bloquear la respuesta al cliente si Meta demora
      await sendMetaCapiEvent({
        eventName: metaEventName,
        eventId: String(body.event_id),
        eventSourceUrl: body.url || request.headers.get('referer') || 'https://www.zortex.cl/',
        clientIp: extractClientIp(request),
        clientUserAgent: ua,
        fbp,
        fbc,
        fbclid: body.fbclid || null,
        visitorId: body.visitor_id || null,
        customData,
      });
    }

    return new Response(JSON.stringify({ ok: true, id: saved.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
