import type { APIRoute } from 'astro';
import { isAuthorizedRequest } from '../../../lib/cms/auth';
import { getAnalyticsDashboard, type AnalyticsRange } from '../../../lib/cms/analytics';

export const prerender = false;

const VALID_RANGES = new Set<AnalyticsRange>(['24h', '7d', '30d', 'all']);

export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const rawRange = (url.searchParams.get('range') || '7d') as AnalyticsRange;
    const range: AnalyticsRange = VALID_RANGES.has(rawRange) ? rawRange : '7d';

    const dashboard = await getAnalyticsDashboard(range);
    return new Response(JSON.stringify({ success: true, ...dashboard }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
