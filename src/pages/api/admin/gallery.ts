import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isAuthorizedRequest } from '../../../lib/cms/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const images: string[] = [];

    // 1. Escanear carpeta public/images/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    try {
      const uploadFiles = await fs.readdir(uploadsDir);
      for (const f of uploadFiles) {
        if (/\.(jpg|jpeg|png|webp|avif|svg)$/i.test(f)) {
          images.push(`/images/uploads/${f}`);
        }
      }
    } catch {}

    // 2. Escanear carpeta public/images/catalogo (primer nivel y subcarpetas)
    const catalogoDir = path.join(process.cwd(), 'public', 'images', 'catalogo');
    try {
      const catEntries = await fs.readdir(catalogoDir, { withFileTypes: true });
      for (const entry of catEntries) {
        if (entry.isFile() && /\.(jpg|jpeg|png|webp|avif|svg)$/i.test(entry.name)) {
          images.push(`/images/catalogo/${entry.name}`);
        } else if (entry.isDirectory()) {
          const subDir = path.join(catalogoDir, entry.name);
          const subFiles = await fs.readdir(subDir);
          for (const sf of subFiles.slice(0, 3)) {
            if (/\.(jpg|jpeg|png|webp|avif|svg)$/i.test(sf)) {
              images.push(`/images/catalogo/${entry.name}/${sf}`);
            }
          }
        }
      }
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        count: images.length,
        images: images.slice(0, 80), // Devolver hasta 80 imágenes para selector rápido
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
