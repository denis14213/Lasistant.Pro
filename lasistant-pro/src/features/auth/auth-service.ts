import { authBackend, type PasswordResetOutcome, type ResetLinkKind, type TwoFactorDelivery } from '@/api';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AuthSession } from '@/types';

/**
 * Règles de connexion du back-office, communes à toutes les sources de données :
 * verrouillage temporaire après plusieurs échecs, double authentification, liens de
 * réinitialisation à usage unique, réponses identiques que le compte existe ou non.
 *
 * La vérification elle-même est déléguée à `authBackend` (Supabase Auth en production).
 * Le verrouillage affiché ici est un confort d'interface : Supabase Auth limite aussi les
 * tentatives côté serveur.
 */

const ATTEMPTS_KEY = 'lp-login-attempts';
const PENDING_KEY = 'lp-2fa-pending';

/** Nombre d'essais avant verrouillage et durée du verrouillage (à valider). */
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

interface AttemptsState {
  count: number;
  lockedUntil: string | null;
}

interface PendingTwoFactor {
  remember: boolean;
  delivery: TwoFactorDelivery;
}

export type LoginResult =
  | { status: 'authenticated'; session: AuthSession; remember: boolean }
  | { status: 'two-factor'; delivery: TwoFactorDelivery }
  | { status: 'invalid'; remainingAttempts: number }
  | { status: 'locked'; lockedUntil: string }
  | { status: 'inactive' };

function readAttempts(): AttemptsState {
  return readStorage<AttemptsState>(ATTEMPTS_KEY, { count: 0, lockedUntil: null }, 'session');
}

/** Verrouillage en cours (date de fin), ou null. */
export function getLockedUntil(now = Date.now()): string | null {
  const { lockedUntil } = readAttempts();
  return lockedUntil && new Date(lockedUntil).getTime() > now ? lockedUntil : null;
}

function registerFailure(): LoginResult {
  const count = readAttempts().count + 1;
  if (count >= MAX_LOGIN_ATTEMPTS) {
    const until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
    writeStorage(ATTEMPTS_KEY, { count: 0, lockedUntil: until }, 'session');
    return { status: 'locked', lockedUntil: until };
  }
  writeStorage(ATTEMPTS_KEY, { count, lockedUntil: null }, 'session');
  return { status: 'invalid', remainingAttempts: MAX_LOGIN_ATTEMPTS - count };
}

export async function attemptLogin(email: string, password: string, remember: boolean): Promise<LoginResult> {
  const lockedUntil = getLockedUntil();
  if (lockedUntil) return { status: 'locked', lockedUntil };

  const outcome = await authBackend.signIn(email, password, remember);
  switch (outcome.status) {
    case 'invalid':
      return registerFailure();
    case 'inactive':
      return { status: 'inactive' };
    case 'two-factor':
      removeStorage(ATTEMPTS_KEY, 'session');
      writeStorage<PendingTwoFactor>(PENDING_KEY, { remember, delivery: outcome.delivery }, 'session');
      return { status: 'two-factor', delivery: outcome.delivery };
    case 'authenticated':
      removeStorage(ATTEMPTS_KEY, 'session');
      return { status: 'authenticated', session: outcome.session, remember };
  }
}

/** Mot de passe vérifié, code reçu par e-mail attendu : envoi en cours, ou null. */
export function pendingTwoFactorDelivery(): TwoFactorDelivery | null {
  return readStorage<PendingTwoFactor | null>(PENDING_KEY, null, 'session')?.delivery ?? null;
}

/** Nouveau code envoyé par e-mail (la date du prochain envoi possible est conservée). */
export async function resendTwoFactorCode(): Promise<TwoFactorDelivery> {
  const pending = readStorage<PendingTwoFactor | null>(PENDING_KEY, null, 'session');
  const delivery = await authBackend.resendTwoFactorCode();
  if (pending) writeStorage<PendingTwoFactor>(PENDING_KEY, { ...pending, delivery }, 'session');
  return delivery;
}

async function finishTwoFactor(
  verify: () => Promise<AuthSession | null>,
): Promise<{ session: AuthSession; remember: boolean } | null> {
  const pending = readStorage<PendingTwoFactor | null>(PENDING_KEY, null, 'session');
  if (!pending) return null;
  const session = await verify();
  if (!session) return null;
  removeStorage(PENDING_KEY, 'session');
  return { session, remember: pending.remember };
}

/** Vérifie le code reçu par e-mail et ouvre la session. */
export function verifyTwoFactor(code: string) {
  return finishTwoFactor(() => authBackend.verifyTwoFactor(code));
}

/** Abandon de la connexion en cours (changement de compte). */
export async function cancelPendingLogin(): Promise<void> {
  removeStorage(PENDING_KEY, 'session');
  await authBackend.signOut();
}

/** Demande de réinitialisation : la réponse est la même que le compte existe ou non. */
export function requestPasswordReset(email: string): Promise<void> {
  return authBackend.requestPasswordReset(email);
}

/** Le lien de réinitialisation ou d'invitation est-il encore valable ? */
export function checkResetLink(): Promise<ResetLinkKind | null> {
  return authBackend.checkResetLink();
}

/** Enregistre le nouveau mot de passe et consomme le lien (usage unique). */
export function completePasswordReset(password: string): Promise<PasswordResetOutcome> {
  return authBackend.completePasswordReset(password);
}
