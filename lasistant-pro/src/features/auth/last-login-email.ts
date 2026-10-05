import { readStorage, writeStorage } from '@/lib/storage';

/**
 * Dernière adresse utilisée pour se connecter sur cet onglet :
 * pré-remplie après une session expirée, effacée à la fermeture de l'onglet.
 */
const LAST_EMAIL_KEY = 'lp-derniere-adresse';

export function readLastLoginEmail(): string {
  return readStorage<string>(LAST_EMAIL_KEY, '', 'session');
}

export function rememberLoginEmail(email: string): void {
  writeStorage(LAST_EMAIL_KEY, email.trim().toLowerCase(), 'session');
}
