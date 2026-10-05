import { redirect, type LoaderFunctionArgs } from 'react-router';
import { ROUTES } from '@/config/routes';
import type { AuthSession } from '@/types';
import { isSessionExpired, readSession } from './session-storage';

/**
 * Règles d'accès au back-office utilisées par les chargeurs de routes (sans React).
 * Phase 2 : les mêmes règles sont appliquées côté serveur (politiques de sécurité Supabase),
 * la protection côté navigateur n'étant qu'un confort d'interface.
 */

/** Paramètre d'adresse : page à rouvrir après la connexion. */
export const REDIRECT_PARAM = 'redirection';

/** Adresse de connexion qui ramène ensuite à la page demandée. */
export function loginPathFor(destination: string): string {
  return `${ROUTES.admin.login}?${REDIRECT_PARAM}=${encodeURIComponent(destination)}`;
}

/** Destination après connexion : uniquement une page interne du back-office. */
export function safeRedirect(value: string | null): string {
  return value && value.startsWith('/admin') && !value.startsWith('//') ? value : ROUTES.admin.dashboard;
}

/**
 * Chargeur des pages protégées : sans session valide, aucune donnée n'est chargée
 * et le visiteur est redirigé vers la connexion (ou l'écran « session expirée »).
 */
export function requireSession({ request }: LoaderFunctionArgs): AuthSession {
  const session = readSession();
  if (session && !isSessionExpired(session)) return session;
  const url = new URL(request.url);
  const destination = url.pathname + url.search;
  throw redirect(
    session
      ? `${ROUTES.admin.sessionExpired}?${REDIRECT_PARAM}=${encodeURIComponent(destination)}`
      : loginPathFor(destination),
  );
}
