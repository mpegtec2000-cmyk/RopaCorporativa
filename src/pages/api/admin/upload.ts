import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isAuthorizedRequest } from '../../../lib/cms/auth';
import { getSupabase, isSupabaseConfigured } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!(await isAuthorizedRequest(request))) {
    return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customName = String(formData.get('name') || 'producto-zortex').trim();

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'No se recibió ningún archivo de imagen válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar tipo de archivo
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    const mime = file.type || 'image/webp';
    if (!validMimes.includes(mime)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato no permitido. Usa JPG, PNG, WEBP o SVG.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitizar nombre de archivo
    const safeName = customName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'producto';

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'].includes(ext) ? ext : 'webp';
    const timestamp = Date.now().toString(36);
    const fileName = `${safeName}-${timestamp}.${cleanExt}`;

    // 1. Intentar subir primero a Supabase Storage si está configurado
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabase();
        const { data: uploadData, error: uploadError } = await sb.storage
          .from('product-images')
          .upload(fileName, buffer, {
            contentType: mime,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = sb.storage
            .from('product-images')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return new Response(
              JSON.stringify({
                success: true,
                url: publicUrlData.publicUrl,
                fileName,
                storage: 'supabase',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (err) {
        // Fallback local
      }
    }

    // 2. Fallback: Guardar localmente en public/images/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, fileName);
    await fs.writeFile(targetPath, buffer);

    const publicUrl = `/images/uploads/${fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        fileName,
        storage: 'local',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error al procesar la imagen' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
