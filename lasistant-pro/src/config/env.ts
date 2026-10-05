/**
 * Lecture typée et centralisée des variables d'environnement.
 * Aucune autre partie du code ne lit `import.meta.env` directement.
 */

const rawLatency = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 450);

export const env = {
  /** Adresse publique du site, sans barre oblique finale */
  siteUrl: (import.meta.env.VITE_SITE_URL ?? 'https://lasistant.pro').replace(/\/$/, ''),
  /** Source des données : simulées dans le navigateur ou base Supabase (phase 2) */
  dataSource: import.meta.env.VITE_DATA_SOURCE === 'supabase' ? 'supabase' : 'mock',
  /** Latence simulée des écritures en mode « mock » (affiche les états d'envoi) */
  mockLatencyMs: Number.isFinite(rawLatency) ? Math.max(0, rawLatency) : 450,
  isDev: import.meta.env.DEV,
  isTest: import.meta.env.MODE === 'test',
} as const;
