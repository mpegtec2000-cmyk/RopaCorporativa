import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createQuote } from '../../lib/cms/store';

const QuoteItemSchema = z.object({
  producto: z.string().min(1, 'Nombre del producto requerido'),
  categoria: z.string().optional().nullable(),
  cantidad: z.number().int().min(1, 'Cantidad mínima: 1'),
  talla: z.string().optional().nullable(),
});

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

    // Guardar mediante capa unificada CMS Store (guarda en Supabase o local según disponibilidad)
    const quoteId = await createQuote({
      empresa: data.empresa,
      rut: data.rut || undefined,
      nombre: data.nombre,
      telefono: data.telefono || undefined,
      correo: data.correo || undefined,
      personalizacion: data.personalizacion,
      plazo: data.plazo || undefined,
      mensaje: data.mensaje || undefined,
      items: data.items.map((i) => ({
        producto: i.producto,
        categoria: i.categoria || null,
        cantidad: i.cantidad,
        talla: i.talla || null,
      })),
    });

    return new Response(JSON.stringify({ success: true, id: quoteId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
