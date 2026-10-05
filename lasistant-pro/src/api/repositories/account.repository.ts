import { DEMO_PASSWORD, RECOVERY_CODES_COUNT } from '@/content/demo/team';
import type { AccountActivity, AccountSession, AdminUser, NotificationPreferences } from '@/types';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';
import { mutateTables, readTable, type MockTables } from '../mock/database';
import { simulateRead, simulateWrite } from '../mock/network';

/**
 * Compte de la personne connectée (« Mon compte ») : profil, sécurité, notifications.
 *
 * Phase 2 : le mot de passe et la double authentification passeront par Supabase Auth
 * (`updateUser`, `mfa`) ; le profil et les préférences restent dans la table « admin_users ».
 */

/** Nombre d'actions affichées dans « Activité récente ». */
const ACTIVITY_LIMIT = 6;

function findUser(tables: MockTables, userId: string): AdminUser {
  const user = tables.users.find((item) => item.id === userId);
  if (!user) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
  return user;
}

/** Code de secours lisible : « 4F7K-92QD ». */
function recoveryCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = crypto.getRandomValues(new Uint32Array(8));
  const chars = Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
  return `${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export const accountRepository = {
  async get(userId: string): Promise<AdminUser> {
    return simulateRead(() => {
      const user = readTable('users').find((item) => item.id === userId);
      if (!user) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return user;
    });
  },

  async updateProfile(userId: string, profile: { name: string; email: string }): Promise<AdminUser> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const email = profile.email.trim().toLowerCase();
        if (tables.users.some((user) => user.id !== userId && user.email === email)) {
          throw new DataError('validation', 'Cette adresse est déjà utilisée par un autre compte.');
        }
        const user = findUser(tables, userId);
        user.name = profile.name.trim();
        user.email = email;
        return user;
      }),
    );
  },

  async updateNotifications(userId: string, patch: Partial<NotificationPreferences>): Promise<AdminUser> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const user = findUser(tables, userId);
        user.notifications = { ...user.notifications, ...patch };
        return user;
      }),
    );
  },

  /** Phase statique : le mot de passe de démonstration reste celui de la connexion. */
  async changePassword(userId: string, current: string): Promise<AdminUser> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        if (current !== DEMO_PASSWORD)
          throw new DataError('validation', 'Le mot de passe actuel est incorrect.');
        const user = findUser(tables, userId);
        user.passwordChangedAt = new Date().toISOString();
        return user;
      }),
    );
  },

  async setTwoFactor(userId: string, enabled: boolean): Promise<AdminUser> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const user = findUser(tables, userId);
        user.twoFactorEnabled = enabled;
        user.twoFactorConfiguredAt = enabled ? new Date().toISOString() : null;
        user.recoveryCodesRemaining = enabled ? RECOVERY_CODES_COUNT : 0;
        return user;
      }),
    );
  },

  /** Nouveaux codes de secours : affichés une seule fois, les anciens deviennent inutilisables. */
  async regenerateRecoveryCodes(userId: string): Promise<string[]> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const user = findUser(tables, userId);
        user.recoveryCodesRemaining = RECOVERY_CODES_COUNT;
        return Array.from({ length: RECOVERY_CODES_COUNT }, recoveryCode);
      }),
    );
  },

  async listSessions(userId: string): Promise<AccountSession[]> {
    return simulateRead(() =>
      readTable('sessions')
        .filter((session) => session.userId === userId)
        .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)),
    );
  },

  /** Déconnecte une session (ou toutes les autres sessions si aucun identifiant n'est donné). */
  async revokeSessions(userId: string, sessionId?: string): Promise<void> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.sessions = tables.sessions.filter(
          (session) => session.userId !== userId || (sessionId !== undefined && session.id !== sessionId),
        );
      }),
    );
  },

  /** Actions récentes de la personne : connexion, demandes traitées, journal d'activité. */
  async activity(userId: string): Promise<AccountActivity[]> {
    return simulateRead(() => {
      const user = readTable('users').find((item) => item.id === userId);
      if (!user) return [];
      const references = new Map(readTable('bookings').map((booking) => [booking.id, booking.reference]));
      const items: AccountActivity[] = [
        ...(user.lastLoginAt
          ? [
              {
                id: 'connexion',
                label: 'Connexion réussie (double authentification)',
                createdAt: user.lastLoginAt,
                kind: 'login' as const,
              },
            ]
          : []),
        ...readTable('bookingEvents')
          .filter((event) => event.actor === user.name && event.type !== 'viewed')
          .map((event) => ({
            id: event.id,
            label: `${event.label} · ${references.get(event.bookingId) ?? 'demande supprimée'}`,
            createdAt: event.createdAt,
            kind: 'request' as const,
          })),
        ...readTable('activity')
          .filter((entry) => entry.actor === user.name)
          .map((entry) => ({
            id: entry.id,
            label: entry.label,
            createdAt: entry.createdAt,
            kind: entry.kind,
          })),
      ];
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, ACTIVITY_LIMIT);
    });
  },
};
