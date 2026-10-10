import type { AuthBackend, DataSource, DemoTools } from './contracts';
import { supabaseAuthBackend } from './supabase/auth';
import { supabaseDataSource } from './supabase';
import { subscribeToRequestChanges as subscribeToSupabaseChanges } from './supabase/realtime';

/**
 * Source de données de l'application : la base Supabase.
 *
 * Pour les tests automatisés (VITE_DATA_SOURCE=mock), Vite remplace ce module par
 * `mock/source.ts` (alias défini dans vite.config.ts) : la base simulée et ses données
 * de démonstration ne sont donc jamais incluses dans le site publié.
 */
export const dataSource: DataSource = supabaseDataSource;

export const authBackend: AuthBackend = supabaseAuthBackend;

/** Abonnement aux changements des demandes (mise à jour du back-office en temps réel). */
export const subscribeToRequestChanges: (onChange: () => void) => () => void = subscribeToSupabaseChanges;

/** Aucune donnée de démonstration en production. */
export const demoTools: DemoTools | null = null;
