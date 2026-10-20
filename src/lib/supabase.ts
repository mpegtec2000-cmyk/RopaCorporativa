import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  return readEnv('SUPABASE_URL');
}

export function getSupabaseKey(): string | undefined {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Returns true when Supabase credentials are configured.
 */
export const isSupabaseConfigured = Boolean(getSupabaseUrl() && getSupabaseKey());

let cachedClient: SupabaseClient | null = null;

/**
 * Supabase client (server-side only, service_role key).
 * Only call this when `isSupabaseConfigured` is true.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error(
      'Supabase no está configurado. Agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de tu proyecto (Vercel / .env).'
    );
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

