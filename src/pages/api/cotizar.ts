/**
 * POST /api/cotizar
 *
 * Recibe la cotización, valida con Zod, verifica honeypot,
 * y guarda en Supabase (o devuelve éxito en modo demo).
 *
 * NOTA: Este endpoint requiere output: 'server' o 'hybrid' en astro.config.
 * En modo estático (dev local sin adapter), el formulario funciona en modo demo
 * capturando el error en el cliente y mostrando éxito simulado.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

const QuoteItemSchema = z.object({
  producto: z.string().min(1, 'Nombre del producto requerido'),
  categoria: z.string().optional(),
  cantidad: z.number().int().min(1, 'Cantidad mínima: 1'),
  talla: z.string().optional(),
});

const QuoteSchema = z.object({
  empresa: z.string().min(1, 'El nombre de la empresa es obligatorio'),
  rut: z.string().optional(),
  nombre: z.string().min(1, 'El nombre de contacto es obligatorio'),
  telefono: z.string().optional(),
  correo: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  personalizacion: z
    .enum(['Sin logo', 'Bordado', 'Estampado', 'Aún no lo sé'])
    .default('Sin logo'),
  plazo: z.string().optional(),
  mensaje: z.string().optional(),
  honeypot: z.string().max(0, 'Bot detectado'),
  items: z.array(QuoteItemSchema).min(1, 'Agrega al menos un producto'),
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

    // Anti-bot: si el honeypot tiene valor, responder 200 silencioso
    if (data.honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Modo demo: Supabase no configurado
    if (!isSupabaseConfigured) {
      console.log('[DEMO] Cotización recibida:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ success: true, demo: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Modo producción: guardar en Supabase
    const supabase = getSupabase();

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        empresa: data.empresa,
        rut: data.rut || null,
        nombre: data.nombre,
        telefono: data.telefono || null,
        correo: data.correo || null,
        personalizacion: data.personalizacion,
        plazo: data.plazo || null,
        mensaje: data.mensaje || null,
      })
      .select('id')
      .single();

    if (quoteError || !quote) {
      console.error('Error al crear cotización:', quoteError);
      return new Response(
        JSON.stringify({
          success: false,
          errors: ['Error interno al guardar la cotización. Intenta de nuevo.'],
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar ítems
    const items = data.items.map((item) => ({
      quote_id: quote.id,
      producto: item.producto,
      categoria: item.categoria || null,
      cantidad: item.cantidad,
      talla: item.talla || null,
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(items);

    if (itemsError) {
      console.error('Error al insertar ítems:', itemsError);
      // La cotización ya se creó, no es crítico
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error en /api/cotizar:', err);
    return new Response(
      JSON.stringify({
        success: false,
        errors: ['Error interno del servidor. Intenta de nuevo.'],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
