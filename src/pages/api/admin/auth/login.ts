import type { APIRoute } from 'astro';
import { createAdminSessionToken, AUTH_COOKIE } from '../../../../lib/cms/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    // Credenciales oficiales acordadas (con soporte para override por variables de entorno en producción)
    const validUser = (import.meta.env.ADMIN_USER || 'ZORTEX').trim().toUpperCase();
    const validPass = (import.meta.env.ADMIN_PASSWORD || 'zortex').trim();

    if (username.toUpperCase() === validUser && password === validPass) {
      const token = await createAdminSessionToken(validUser);
      return new Response(
        JSON.stringify({
          success: true,
          token,
          user: validUser,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `${AUTH_COOKIE}=${encodeURIComponent(
              token
            )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Usuario o contraseña incorrectos' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error de servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
