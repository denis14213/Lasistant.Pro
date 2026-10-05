import { teamRepository } from '@/api';
import { DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/content/demo/team';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AuthSession } from '@/types';

/**
 * Authentification simulée de la phase statique.
 * Les règles de sécurité attendues sont déjà en place : verrouillage temporaire après
 * plusieurs échecs, double authentification, liens de réinitialisation à usage unique
 * et expirants, réponses identiques que le compte existe ou non (pas d'énumération).
 *
 * Phase 2 : ces fonctions appelleront Supabase Auth ; l'interface reste identique.
 */

const ATTEMPTS_KEY = 'lp-login-attempts';
const PENDING_KEY = 'lp-2fa-pending';
const RESET_KEY = 'lp-reset-token';

/** Nombre d'essais avant verrouillage et durée du verrouillage (à valider). */
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
/** Validité d'un lien de réinitialisation (à valider). */
export const RESET_LINK_TTL_MS = 30 * 60 * 1000;

interface AttemptsState {
  count: number;
  lockedUntil: string | null;
}

interface PendingTwoFactor {
  userId: string;
  remember: boolean;
}

export type LoginResult =
  | { status: 'two-factor' }
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

export async function attemptLogin(email: string, password: string, remember: boolean): Promise<LoginResult> {
  const lockedUntil = getLockedUntil();
  if (lockedUntil) return { status: 'locked', lockedUntil };

  const user = await teamRepository.findByEmail(email);
  const valid = user !== null && password === DEMO_PASSWORD;

  if (!valid) {
    const attempts = readAttempts();
    const count = attempts.count + 1;
    if (count >= MAX_LOGIN_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      writeStorage(ATTEMPTS_KEY, { count: 0, lockedUntil: until }, 'session');
      return { status: 'locked', lockedUntil: until };
    }
    writeStorage(ATTEMPTS_KEY, { count, lockedUntil: null }, 'session');
    return { status: 'invalid', remainingAttempts: MAX_LOGIN_ATTEMPTS - count };
  }

  if (!user.active) return { status: 'inactive' };

  removeStorage(ATTEMPTS_KEY, 'session');
  writeStorage<PendingTwoFactor>(PENDING_KEY, { userId: user.id, remember }, 'session');
  return { status: 'two-factor' };
}

export function hasPendingTwoFactor(): boolean {
  return readStorage<PendingTwoFactor | null>(PENDING_KEY, null, 'session') !== null;
}

/** Vérifie le code à usage unique et ouvre la session. */
export async function verifyTwoFactor(
  code: string,
): Promise<{ session: AuthSession; remember: boolean } | null> {
  const pending = readStorage<PendingTwoFactor | null>(PENDING_KEY, null, 'session');
  if (!pending || code !== DEMO_TWO_FACTOR_CODE) return null;
  const users = await teamRepository.list();
  const user = users.find((item) => item.id === pending.userId);
  if (!user) return null;
  removeStorage(PENDING_KEY, 'session');
  await teamRepository.recordLogin(user.id);
  const now = new Date().toISOString();
  return {
    session: {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      startedAt: now,
      lastActivityAt: now,
    },
    remember: pending.remember,
  };
}

/**
 * Demande de réinitialisation : la réponse est la même que le compte existe ou non.
 * En phase statique, le lien est simulé dans le navigateur.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await teamRepository.findByEmail(email);
  if (user) {
    writeStorage(
      RESET_KEY,
      { userId: user.id, expiresAt: new Date(Date.now() + RESET_LINK_TTL_MS).toISOString() },
      'session',
    );
  }
}

/** Le lien de réinitialisation est-il encore valable ? */
export function isResetLinkValid(now = Date.now()): boolean {
  const token = readStorage<{ expiresAt: string } | null>(RESET_KEY, null, 'session');
  return token !== null && new Date(token.expiresAt).getTime() > now;
}

/** Consomme le lien (usage unique). */
export async function completePasswordReset(): Promise<boolean> {
  const valid = isResetLinkValid();
  removeStorage(RESET_KEY, 'session');
  return valid;
}
