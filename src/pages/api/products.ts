import type { APIRoute } from 'astro';
import { getPublicProducts } from '../../lib/cms/store';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const products = await getPublicProducts();
    return new Response(
      JSON.stringify({
        success: true,
        count: products.length,
        products,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=10, s-maxage=30',
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
