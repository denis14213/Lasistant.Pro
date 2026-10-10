import { DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/content/demo/team';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AdminUser, AuthSession } from '@/types';
import type { AuthBackend } from '../contracts';
import { readTable } from './database';
import { mockTeamDirectory } from './repositories/team.repository';

/**
 * Authentification simulée (tests automatisés) : mot de passe et code « reçu par e-mail » de démonstration,
 * lien de réinitialisation conservé dans l'onglet. Les règles d'interface (verrouillage,
 * double authentification, lien à usage unique) sont les mêmes qu'en production.
 */

const PENDING_USER_KEY = 'lp-demo-2fa-utilisateur';
const RESET_KEY = 'lp-reset-token';
/** Validité d'un lien de réinitialisation simulé. */
const RESET_LINK_TTL_MS = 30 * 60 * 1000;

function sessionFor(user: AdminUser): AuthSession {
  const now = new Date().toISOString();
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    startedAt: now,
    lastActivityAt: now,
  };
}

/** Envoi simulé du code (le code de démonstration est fixe) ; nouvel envoi possible après 1 min. */
function demoDelivery(email: string) {
  const [local = '', domain = ''] = email.split('@');
  return {
    destination: local ? `${local.charAt(0)}•••@${domain}` : null,
    retryAt: new Date(Date.now() + 60_000).toISOString(),
  };
}

function resetLinkValid(now = Date.now()): boolean {
  const token = readStorage<{ expiresAt: string } | null>(RESET_KEY, null, 'session');
  return token !== null && new Date(token.expiresAt).getTime() > now;
}

export const mockAuthBackend: AuthBackend = {
  async signIn(email, password) {
    const user = await mockTeamDirectory.findByEmail(email);
    if (!user || password !== DEMO_PASSWORD) return { status: 'invalid' };
    if (!user.active) return { status: 'inactive' };
    writeStorage(PENDING_USER_KEY, user.id, 'session');
    return { status: 'two-factor', delivery: demoDelivery(user.email) };
  },

  async verifyTwoFactor(code) {
    const userId = readStorage<string | null>(PENDING_USER_KEY, null, 'session');
    if (!userId || code !== DEMO_TWO_FACTOR_CODE) return null;
    const user = readTable('users').find((item) => item.id === userId);
    if (!user) return null;
    removeStorage(PENDING_USER_KEY, 'session');
    await mockTeamDirectory.recordLogin(user.id);
    return sessionFor(user);
  },

  async resendTwoFactorCode() {
    const userId = readStorage<string | null>(PENDING_USER_KEY, null, 'session');
    const user = readTable('users').find((item) => item.id === userId);
    return demoDelivery(user?.email ?? '');
  },

  async isSecondFactorVerified() {
    return true;
  },

  async requestPasswordReset(email) {
    const user = await mockTeamDirectory.findByEmail(email);
    if (user) {
      writeStorage(
        RESET_KEY,
        { userId: user.id, expiresAt: new Date(Date.now() + RESET_LINK_TTL_MS).toISOString() },
        'session',
      );
    }
  },

  async checkResetLink() {
    return resetLinkValid() ? 'recovery' : null;
  },

  /** Le lien est consommé (usage unique) ; le mot de passe de démonstration ne change pas. */
  async completePasswordReset() {
    const valid = resetLinkValid();
    removeStorage(RESET_KEY, 'session');
    return valid
      ? { ok: true }
      : { ok: false, reason: 'expired', message: 'Ce lien a expiré ou a déjà été utilisé.' };
  },

  async signOut() {
    removeStorage(PENDING_USER_KEY, 'session');
  },

  hasActiveSession() {
    return true;
  },

  onSignedOut() {
    return () => undefined;
  },
};
