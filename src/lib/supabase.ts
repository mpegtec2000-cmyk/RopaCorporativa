import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Returns true when Supabase credentials are configured.
 * In demo mode (no credentials) the form validates but does not persist.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Supabase client (server-side only, service_role key).
 * Only call this when `isSupabaseConfigured` is true.
 */
export function getSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase no está configurado. Agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env'
    );
  }
  return createClient(supabaseUrl!, supabaseKey!);
}
