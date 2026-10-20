import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://hjuawsyqgrascremrwwc.supabase.co';
const FALLBACK_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdWF3c3lxZ3Jhc2NyZW1yd3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg5MzU4NiwiZXhwIjoyMTA2NDY5NTg2fQ.hjcu1k_7j782tXamj-1QjoDIO40swr70IFzglcUMzpo';

function readEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
    return (import.meta.env as any)[key];
  }
  return undefined;
}

export function getSupabaseUrl(): string {
  return (
    readEnv('SUPABASE_URL') ||
    import.meta.env.SUPABASE_URL ||
    FALLBACK_SUPABASE_URL
  );
}

export function getSupabaseKey(): string {
  return (
    readEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    FALLBACK_SUPABASE_KEY
  );
}

/**
 * Returns true when Supabase credentials are configured.
 */
export const isSupabaseConfigured = true;

let cachedClient: SupabaseClient | null = null;

/**
 * Supabase client (server-side only, service_role key).
 * Only call this when `isSupabaseConfigured` is true.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
