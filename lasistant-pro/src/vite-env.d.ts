/// <reference types="vite/client" />

/** Variables d'environnement exposées au navigateur (préfixe VITE_ : jamais de secret). */
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_DATA_SOURCE?: 'mock' | 'supabase';
  readonly VITE_MOCK_LATENCY_MS?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
