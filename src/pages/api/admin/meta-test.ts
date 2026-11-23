import type { APIRoute } from 'astro';
import { isAuthorizedRequest } from '../../../lib/cms/auth';
import { extractClientIp, sendMetaCapiEvent } from '../../../lib/tracking/meta-capi';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const eventName = body.eventName === 'Lead' ? 'Lead' : 'PageView';
    const overrideTestCode = typeof body.testEventCode === 'string' ? body.testEventCode.trim() : undefined;

    const result = await sendMetaCapiEvent(
      {
        eventName,
        eventId: `ztx-test-${Date.now()}`,
        eventSourceUrl: 'https://www.zortex.cl/',
        clientIp: extractClientIp(request),
        clientUserAgent: request.headers.get('user-agent'),
        email: eventName === 'Lead' ? 'prueba@zortex.cl' : null,
        phone: eventName === 'Lead' ? '+56958639727' : null,
        fullName: eventName === 'Lead' ? 'Prueba Zortex B2B' : null,
        customData:
          eventName === 'Lead'
            ? { content_name: 'Prueba CAPI ZORTEX', currency: 'CLP', value: 0 }
            : undefined,
      },
      { overrideTestCode }
    );

    return new Response(JSON.stringify({ success: result.sent, ...result }), {
      status: result.sent ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
