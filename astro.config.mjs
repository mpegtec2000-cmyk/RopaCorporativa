// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Astro 5: modo static por defecto.
  // Los endpoints con `export const prerender = false` se ejecutan server-side en dev.
  // El adapter de Vercel se agrega después para producción.
});
