import { createClient, type SupabaseClient, type SupportedStorage } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { Database } from './database.types';

/**
 * Client Supabase unique de l'application (API REST, RPC, stockage, temps réel, Auth).
 *
 * Seule la clé publique (« publishable ») est utilisée côté navigateur : elle n'ouvre aucun
 * droit par elle-même, les règles RLS de la base décident de tout. La clé secrète n'existe
 * que dans les Edge Functions.
 */

export type LasistantClient = SupabaseClient<Database>;

/** Clé de stockage de la session Supabase Auth. */
const AUTH_STORAGE_KEY = 'lp-auth';
/** Indicateur « Rester connecté » : la session est alors conservée sur l'appareil. */
const PERSISTENCE_KEY = 'lp-auth-persistante';

function safely<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

function persistent(): boolean {
  return safely(() => localStorage.getItem(PERSISTENCE_KEY) === '1', false);
}

/**
 * Stockage de la session : l'onglet (sessionStorage) par défaut, l'appareil (localStorage)
 * si « Rester connecté » a été coché à la connexion.
 */
const authStorage: SupportedStorage = {
  getItem: (key) =>
    safely(() => sessionStorage.getItem(key), null) ?? safely(() => localStorage.getItem(key), null),
  setItem: (key, value) => {
    const keep = persistent();
    safely(() => (keep ? sessionStorage : localStorage).removeItem(key), undefined);
    safely(() => (keep ? localStorage : sessionStorage).setItem(key, value), undefined);
  },
  removeItem: (key) => {
    safely(() => sessionStorage.removeItem(key), undefined);
    safely(() => localStorage.removeItem(key), undefined);
  },
};

/** Choix fait à la connexion : conserver la session sur l'appareil ou seulement dans l'onglet. */
export function setSessionPersistence(keep: boolean): void {
  safely(
    () => (keep ? localStorage.setItem(PERSISTENCE_KEY, '1') : localStorage.removeItem(PERSISTENCE_KEY)),
    undefined,
  );
}

/** Une session Supabase est-elle enregistrée dans ce navigateur ? (lecture synchrone) */
export function hasStoredAuthSession(): boolean {
  return authStorage.getItem(AUTH_STORAGE_KEY) !== null;
}

/** Lien reçu par e-mail (réinitialisation du mot de passe, invitation) ouvert dans cette page. */
export interface AuthRedirect {
  type: string | null;
  error: string | null;
}

let authRedirect: AuthRedirect | null = null;

/**
 * Le client lit puis efface les jetons présents dans l'adresse (#access_token=…&type=recovery) :
 * leur nature est relevée avant, pour que l'écran « Nouveau mot de passe » sache d'où l'on vient.
 */
function captureAuthRedirect(): void {
  if (typeof window === 'undefined') return;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  const type = hash.get('type') ?? query.get('type');
  const error = hash.get('error_code') ?? hash.get('error') ?? query.get('error_code');
  if (type || error) authRedirect = { type, error };
}

/** Nature du lien d'authentification par lequel la page a été ouverte (lu une seule fois). */
export function consumeAuthRedirect(): AuthRedirect | null {
  const redirect = authRedirect;
  authRedirect = null;
  return redirect;
}

let client: LasistantClient | null = null;

export function getSupabase(): LasistantClient {
  if (client) return client;
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error(
      'Configuration Supabase manquante : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.',
    );
  }
  captureAuthRedirect();
  client = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      storage: authStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Liens d'e-mail utilisables depuis n'importe quel appareil (pas de code PKCE local).
      flowType: 'implicit',
    },
  });
  return client;
}
