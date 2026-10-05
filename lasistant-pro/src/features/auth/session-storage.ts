import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AuthSession } from '@/types';

/**
 * Conservation de la session du back-office.
 * Par défaut la session est liée à l'onglet (sessionStorage) ; « Rester connecté »
 * la conserve sur l'appareil (localStorage). Expiration après 30 minutes d'inactivité.
 *
 * Phase 2 : remplacé par la session Supabase Auth (jeton sécurisé côté serveur).
 */

const SESSION_KEY = 'lp-admin-session';

/** Déconnexion automatique après 30 minutes d'inactivité (durée à valider). */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export function readSession(): AuthSession | null {
  return (
    readStorage<AuthSession | null>(SESSION_KEY, null, 'session') ??
    readStorage<AuthSession | null>(SESSION_KEY, null)
  );
}

export function writeSession(session: AuthSession, remember: boolean): void {
  writeStorage(SESSION_KEY, session, remember ? 'local' : 'session');
}

/** Réenregistre la session au même endroit (onglet ou appareil) qu'à l'ouverture. */
export function updateStoredSession(session: AuthSession): AuthSession {
  const remembered = readStorage<AuthSession | null>(SESSION_KEY, null) !== null;
  writeSession(session, remembered);
  return session;
}

/** Prolonge la session : l'inactivité est mesurée à partir de maintenant. */
export function touchSession(session: AuthSession): AuthSession {
  return updateStoredSession({ ...session, lastActivityAt: new Date().toISOString() });
}

export function clearSession(): void {
  removeStorage(SESSION_KEY, 'session');
  removeStorage(SESSION_KEY);
}

export function isSessionExpired(session: AuthSession, now = Date.now()): boolean {
  return now - new Date(session.lastActivityAt).getTime() > IDLE_TIMEOUT_MS;
}
