import type { APIRoute } from 'astro';
import { isAuthorizedRequest } from '../../../lib/cms/auth';
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
  getBackend,
  ensureSeeded,
} from '../../../lib/cms/store';

export const prerender = false;

// GET: Obtener lista completa de productos (para administración)
export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { products } = await getAllProducts();
    const backend = await getBackend();
    return new Response(
      JSON.stringify({
        success: true,
        backend,
        count: products.length,
        products,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error al obtener productos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Crear o actualizar producto
export const POST: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    if (!body || !body.name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nombre de producto requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const saved = await saveProduct(body);
    const backend = await getBackend();

    return new Response(
      JSON.stringify({
        success: true,
        product: saved,
        backend,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error al guardar producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Eliminar producto
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
      return new Response(
        JSON.stringify({ success: false, error: 'ID de producto requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteProduct(id);
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error al eliminar producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
