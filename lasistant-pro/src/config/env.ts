/**
 * Lecture typée et centralisée des variables d'environnement.
 * Aucune autre partie du code ne lit `import.meta.env` directement
 * (sauf `api/index.ts`, qui choisit la source de données au moment de la compilation).
 */

const rawLatency = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 450);

export const env = {
  /** Adresse publique du site, sans barre oblique finale */
  siteUrl: (import.meta.env.VITE_SITE_URL ?? 'https://lasistant.pro').replace(/\/$/, ''),
  /**
   * Source des données : la base Supabase (production), ou une base simulée dans le
   * navigateur réservée aux tests automatisés (VITE_DATA_SOURCE=mock).
   */
  dataSource: import.meta.env.VITE_DATA_SOURCE === 'mock' ? 'mock' : 'supabase',
  /** Adresse du projet Supabase */
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, ''),
  /** Clé publique (« publishable ») : sans privilège, les règles RLS protègent les données */
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
  /** Latence simulée des écritures en mode « mock » (affiche les états d'envoi) */
  mockLatencyMs: Number.isFinite(rawLatency) ? Math.max(0, rawLatency) : 450,
  isDev: import.meta.env.DEV,
  isTest: import.meta.env.MODE === 'test',
} as const;
