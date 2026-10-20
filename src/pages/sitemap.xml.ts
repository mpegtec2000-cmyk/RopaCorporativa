import type { APIRoute } from 'astro';
import { SITE } from '../config';

export const prerender = false;

export const GET: APIRoute = async () => {
  const baseUrl = SITE.url.replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const pages = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/#productos`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/#lineas`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/#beneficios`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/#cotizar`, priority: '0.9', changefreq: 'weekly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
