import { DEFAULT_NOTIFICATIONS } from '@/content/demo/team';
import { ROLE_LABELS } from '@/lib/permissions';
import type { AdminUser, InvitationResult } from '@/types';
import type { TeamRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { logActivity } from '../activity';
import { createId, mutateTables, readTable } from '../database';
import { simulateRead, simulateWrite } from '../network';

/**
 * Comptes de l'équipe (table « admin_users »).
 */
export const teamRepository: TeamRepository = {
  async list() {
    return simulateRead(() => readTable('users'));
  },

  async invite(email, role, actor): Promise<InvitationResult> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const normalized = email.trim().toLowerCase();
        if (tables.users.some((user) => user.email === normalized)) {
          throw new DataError('validation', 'Un compte existe déjà avec cette adresse.');
        }
        const name = normalized.split('@')[0] ?? normalized;
        const user: AdminUser = {
          id: createId('usr'),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: normalized,
          role,
          active: false,
          twoFactorEnabled: false,
          twoFactorConfiguredAt: null,
          recoveryCodesRemaining: 0,
          passwordChangedAt: null,
          lastLoginAt: null,
          invitationSentAt: new Date().toISOString(),
          notifications: { ...DEFAULT_NOTIFICATIONS },
        };
        tables.users.push(user);
        logActivity(tables, actor, `Invitation envoyée à ${normalized}`, 'team');
        return { user, emailSent: true, invitationLink: null };
      }),
    );
  },

  async resendInvitation(id, actor): Promise<InvitationResult> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const user = tables.users.find((item) => item.id === id);
        if (!user) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        user.invitationSentAt = new Date().toISOString();
        logActivity(tables, actor, `Invitation renvoyée à ${user.email}`, 'team');
        return { user, emailSent: true, invitationLink: null };
      }),
    );
  },

  async update(id, patch, actor) {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const user = tables.users.find((item) => item.id === id);
        if (!user) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        Object.assign(user, patch);
        if (patch.role)
          logActivity(tables, actor, `Rôle de ${user.name} : ${ROLE_LABELS[patch.role]}`, 'team');
        if (patch.active !== undefined) {
          logActivity(
            tables,
            actor,
            `Compte de ${user.name} ${patch.active ? 'réactivé' : 'désactivé'}`,
            'team',
          );
        }
        return user;
      }),
    );
  },
};

/**
 * Annuaire utilisé par l'authentification simulée (recherche par adresse, dernière connexion).
 * En production, ces opérations relèvent de Supabase Auth.
 */
export const mockTeamDirectory = {
  async findByEmail(email: string): Promise<AdminUser | null> {
    const normalized = email.trim().toLowerCase();
    return simulateRead(() => readTable('users').find((user) => user.email === normalized) ?? null);
  },

  async recordLogin(id: string): Promise<void> {
    return simulateRead(() => {
      mutateTables((tables) => {
        const user = tables.users.find((item) => item.id === id);
        if (user) user.lastLoginAt = new Date().toISOString();
      });
    });
  },
};
