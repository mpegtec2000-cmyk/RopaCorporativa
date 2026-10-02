/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
