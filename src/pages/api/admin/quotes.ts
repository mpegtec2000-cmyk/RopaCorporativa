import type { APIRoute } from 'astro';
import { isAuthorizedRequest } from '../../../lib/cms/auth';
import { getQuotes, updateQuote, deleteQuote, createQuote } from '../../../lib/cms/store';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const quotes = await getQuotes();
    return new Response(JSON.stringify({ success: true, quotes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const id = await createQuote({
      empresa: body.empresa || 'Constructora & Minería del Norte SpA',
      rut: body.rut || '76.852.147-9',
      nombre: body.nombre || 'Mauricio Morales - Subgerente de Compras',
      telefono: body.telefono || '+56 9 9482 1102',
      correo: body.correo || 'compras@nortemineria.cl',
      personalizacion: body.personalizacion || 'Bordado Computarizado',
      plazo: body.plazo || '15 días hábiles',
      mensaje: body.mensaje || 'Solicitud de cotización para cuadrilla en faena alta cordillera.',
      items: Array.isArray(body.items) && body.items.length > 0 ? body.items : [
        { producto: 'Parka Alta Visibilidad Fluor 3 en 1', categoria: 'Ropa de Seguridad', cantidad: 50, talla: 'L' },
        { producto: 'Pantalón Cargo Faena Ignífugo', categoria: 'Ropa Industrial', cantidad: 50, talla: '46' },
        { producto: 'Botín Dieléctrico Seguridad Pu/Goma', categoria: 'EPP', cantidad: 50, talla: '43' },
      ],
    });

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const id = body.id;
    const estado = body.estado || body.status;
    const notas = body.notas;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateQuote(id, { estado, notas });
    return new Response(JSON.stringify({ success: true, id, estado, notas }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteQuote(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
