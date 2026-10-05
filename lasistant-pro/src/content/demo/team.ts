import { isoDaysAgo } from '@/lib/dates';
import type { AccountSession, ActivityEntry, AdminUser, NotificationPreferences } from '@/types';

/**
 * Comptes de démonstration du back-office (personnes fictives).
 * Mot de passe de démonstration commun : voir `DEMO_PASSWORD`.
 */

/** Mot de passe accepté en phase statique (aucune donnée réelle n'est protégée). */
export const DEMO_PASSWORD = 'Lasistant2026!';

/** Code de double authentification accepté en phase statique. */
export const DEMO_TWO_FACTOR_CODE = '123456';

/** Nombre de codes de secours générés avec la double authentification. */
export const RECOVERY_CODES_COUNT = 8;

/** Préférences par défaut d'un nouveau compte. */
export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  newRequest: true,
  overdueReminder: true,
  weeklySummary: false,
};

export function createTeamSeed(now = new Date()): AdminUser[] {
  return [
    {
      id: 'usr-admin',
      name: 'Admin LASISTANT',
      email: 'admin@lasistant.pro',
      role: 'administrateur',
      active: true,
      twoFactorEnabled: true,
      twoFactorConfiguredAt: isoDaysAgo(53, '09:30', now),
      recoveryCodesRemaining: RECOVERY_CODES_COUNT,
      passwordChangedAt: isoDaysAgo(42, '09:10', now),
      lastLoginAt: isoDaysAgo(0, '10:02', now),
      invitationSentAt: null,
      notifications: DEFAULT_NOTIFICATIONS,
    },
    {
      id: 'usr-editeur',
      name: 'Éditrice contenus',
      email: 'contenus@lasistant.pro',
      role: 'editeur',
      active: true,
      twoFactorEnabled: true,
      twoFactorConfiguredAt: isoDaysAgo(40, '14:05', now),
      recoveryCodesRemaining: 6,
      passwordChangedAt: isoDaysAgo(40, '14:00', now),
      lastLoginAt: isoDaysAgo(2, '16:41', now),
      invitationSentAt: null,
      notifications: { newRequest: false, overdueReminder: false, weeklySummary: true },
    },
    {
      id: 'usr-operateur-1',
      name: 'Opérateur 1',
      email: 'operateur1@lasistant.pro',
      role: 'operateur',
      active: true,
      twoFactorEnabled: false,
      twoFactorConfiguredAt: null,
      recoveryCodesRemaining: 0,
      passwordChangedAt: isoDaysAgo(18, '08:45', now),
      lastLoginAt: isoDaysAgo(0, '10:12', now),
      invitationSentAt: null,
      notifications: DEFAULT_NOTIFICATIONS,
    },
    {
      id: 'usr-operateur-2',
      name: 'Opérateur 2',
      email: 'operateur2@lasistant.pro',
      role: 'operateur',
      active: false,
      twoFactorEnabled: false,
      twoFactorConfiguredAt: null,
      recoveryCodesRemaining: 0,
      passwordChangedAt: null,
      lastLoginAt: null,
      invitationSentAt: isoDaysAgo(2, '16:12', now),
      notifications: DEFAULT_NOTIFICATIONS,
    },
  ];
}

/** Autres sessions ouvertes (la session en cours est ajoutée par l'interface). */
export function createSessionsSeed(now = new Date()): AccountSession[] {
  return [
    {
      id: 'ses-admin-mobile',
      userId: 'usr-admin',
      device: 'telephone',
      browser: 'Safari',
      location: 'Tunisie',
      lastActiveAt: isoDaysAgo(2, '18:20', now),
    },
    {
      id: 'ses-editeur-portable',
      userId: 'usr-editeur',
      device: 'ordinateur',
      browser: 'Firefox',
      location: 'Tunisie',
      lastActiveAt: isoDaysAgo(5, '11:02', now),
    },
  ];
}

/** Journal d'activité de démonstration (actions sensibles de l'équipe). */
export function createActivitySeed(now = new Date()): ActivityEntry[] {
  return [
    {
      id: 'act-invitation',
      actor: 'Admin LASISTANT',
      label: 'Invitation envoyée à operateur2@lasistant.pro',
      kind: 'team',
      createdAt: isoDaysAgo(2, '16:12', now),
    },
    {
      id: 'act-coordonnees',
      actor: 'Admin LASISTANT',
      label: 'Coordonnées du site modifiées',
      kind: 'settings',
      createdAt: isoDaysAgo(0, '07:20', now),
    },
    {
      id: 'act-article',
      actor: 'Éditrice contenus',
      label: 'Article « Préparer son dossier avant un séjour médical en Tunisie » mis à jour',
      kind: 'content',
      createdAt: isoDaysAgo(2, '16:30', now),
    },
  ];
}
