import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createQuote } from '../../lib/cms/store';
import {
  classifyTrafficSource,
  detectDeviceAndBrowser,
  recordAnalyticsEvent,
} from '../../lib/cms/analytics';
import {
  extractClientIp,
  extractCookie,
  sendMetaCapiEvent,
} from '../../lib/tracking/meta-capi';

const QuoteItemSchema = z.object({
  producto: z.string().min(1, 'Nombre del producto requerido'),
  categoria: z.string().optional().nullable(),
  cantidad: z.number().int().min(1, 'Cantidad mínima: 1'),
  talla: z.string().optional().nullable(),
});

const AttributionSchema = z
  .object({
    utm_source: z.string().optional().nullable(),
    utm_medium: z.string().optional().nullable(),
    utm_campaign: z.string().optional().nullable(),
    utm_content: z.string().optional().nullable(),
    utm_term: z.string().optional().nullable(),
    fbclid: z.string().optional().nullable(),
    gclid: z.string().optional().nullable(),
    referrer: z.string().optional().nullable(),
    visitor_id: z.string().optional().nullable(),
    session_id: z.string().optional().nullable(),
    event_id: z.string().optional().nullable(),
    fbp: z.string().optional().nullable(),
    fbc: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const QuoteSchema = z.object({
  empresa: z.string().min(1, 'El nombre de la empresa es obligatorio'),
  rut: z.string().optional().nullable(),
  nombre: z.string().min(1, 'El nombre de contacto es obligatorio'),
  telefono: z.string().optional().nullable(),
  correo: z.string().email('Correo electrónico inválido').optional().or(z.literal('')).nullable(),
  personalizacion: z.string().default('Sin logo'),
  plazo: z.string().optional().nullable(),
  mensaje: z.string().optional().nullable(),
  honeypot: z.string().max(0, 'Bot detectado').optional(),
  items: z.array(QuoteItemSchema).min(1, 'Agrega al menos un producto'),
  attribution: AttributionSchema,
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = QuoteSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message);
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = result.data;

    // Anti-bot silencioso
    if (data.honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const attr = data.attribution || {};
    const classifiedSource = classifyTrafficSource({
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      fbclid: attr.fbclid,
      gclid: attr.gclid,
      referrer: attr.referrer || request.headers.get('referer'),
    });

    // Guardar mediante capa unificada CMS Store con atribución CRM
    const quoteId = await createQuote({
      empresa: data.empresa,
      rut: data.rut || undefined,
      nombre: data.nombre,
      telefono: data.telefono || undefined,
      correo: data.correo || undefined,
      personalizacion: data.personalizacion,
      plazo: data.plazo || undefined,
      mensaje: data.mensaje || undefined,
      source: classifiedSource,
      utm_source: attr.utm_source || undefined,
      utm_medium: attr.utm_medium || undefined,
      utm_campaign: attr.utm_campaign || undefined,
      utm_content: attr.utm_content || undefined,
      fbclid: attr.fbclid || undefined,
      items: data.items.map((i) => ({
        producto: i.producto,
        categoria: i.categoria || null,
        cantidad: i.cantidad,
        talla: i.talla || null,
      })),
    });

    const leadEventId = attr.event_id || `lead-${quoteId}`;
    const totalUnits = data.items.reduce((acc, i) => acc + (i.cantidad || 1), 0);
    const ua = request.headers.get('user-agent');
    const { device, browser } = detectDeviceAndBrowser(ua);

    // 1) Registrar evento de conversión en Analítica interna
    await recordAnalyticsEvent({
      event_type: 'quote_submit',
      event_id: leadEventId,
      visitor_id: attr.visitor_id || `quote-${quoteId}`,
      session_id: attr.session_id || `sess-${quoteId}`,
      path: '/#cotizar',
      referrer: attr.referrer || request.headers.get('referer'),
      utm_source: attr.utm_source,
      utm_medium: attr.utm_medium,
      utm_campaign: attr.utm_campaign,
      utm_content: attr.utm_content,
      utm_term: attr.utm_term,
      fbclid: attr.fbclid,
      gclid: attr.gclid,
      device,
      browser,
      metadata: {
        quote_id: quoteId,
        empresa: data.empresa,
        num_items: totalUnits,
        lines: data.items.length,
      },
    }).catch(() => {});

    // 2) Enviar Lead server-side a Meta Conversions API (deduplicado con fbq mediante event_id)
    const cookieHeader = request.headers.get('cookie');
    await sendMetaCapiEvent({
      eventName: 'Lead',
      eventId: leadEventId,
      eventSourceUrl: attr.url || request.headers.get('referer') || 'https://www.zortex.cl/#cotizar',
      clientIp: extractClientIp(request),
      clientUserAgent: ua,
      fbp: attr.fbp || extractCookie(cookieHeader, '_fbp'),
      fbc: attr.fbc || extractCookie(cookieHeader, '_fbc'),
      fbclid: attr.fbclid,
      visitorId: attr.visitor_id || quoteId,
      email: data.correo,
      phone: data.telefono,
      fullName: data.nombre,
      customData: {
        content_name: `Cotización B2B - ${data.empresa}`,
        content_category: data.items[0]?.categoria || 'EPP y Vestuario',
        num_items: totalUnits,
        currency: 'CLP',
      },
    }).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, id: quoteId, event_id: leadEventId }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Error en /api/cotizar:', err);
    return new Response(
      JSON.stringify({
        success: false,
        errors: [err.message || 'Error interno al procesar la cotización.'],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
