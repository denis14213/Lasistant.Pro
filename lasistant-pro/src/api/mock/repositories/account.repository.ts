import { DEMO_PASSWORD } from '@/content/demo/team';
import type { AccountActivity, AccountSession, AdminUser, NotificationPreferences } from '@/types';
import type { AccountRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { mutateTables, readTable, type MockTables } from '../database';
import { simulateRead, simulateWrite } from '../network';

/**
 * Compte de la personne connectée (« Mon compte ») : profil, sécurité, notifications.
 *
 * La double authentification se fait par code envoyé par e-mail (aucune configuration).
 */

/** Nombre d'actions affichées dans « Activité récente ». */
const ACTIVITY_LIMIT = 6;

function findUser(tables: MockTables, userId: string): AdminUser {
  const user = tables.users.find((item) => item.id === userId);
  if (!user) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
  return user;
}

export const accountRepository: AccountRepository = {
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

  /** Base simulée : le mot de passe de démonstration reste celui de la connexion. */
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
