/**
 * Comptes de l'équipe (table « admin_users ») et session de connexion.
 */

export type AdminRole = 'administrateur' | 'editeur' | 'operateur';

/** Notifications par e-mail choisies par chaque membre de l'équipe. */
export interface NotificationPreferences {
  /** Dès qu'un formulaire du site est envoyé */
  newRequest: boolean;
  /** Rappel quotidien des demandes non traitées depuis 24 h */
  overdueReminder: boolean;
  /** Résumé hebdomadaire, chaque lundi matin */
  weeklySummary: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  twoFactorEnabled: boolean;
  /** Date de configuration de la double authentification */
  twoFactorConfiguredAt: string | null;
  /** Codes de secours encore utilisables */
  recoveryCodesRemaining: number;
  passwordChangedAt: string | null;
  lastLoginAt: string | null;
  /** Date d'envoi de l'invitation tant que le compte n'est pas activé */
  invitationSentAt: string | null;
  notifications: NotificationPreferences;
}

/** Autre session ouverte sur un compte (« Sessions actives »). */
export interface AccountSession {
  id: string;
  userId: string;
  device: 'ordinateur' | 'telephone' | 'tablette';
  browser: string;
  location: string;
  lastActiveAt: string;
}

/** Domaine d'une action consignée dans le journal d'activité. */
export type ActivityKind = 'settings' | 'team' | 'content';

/** Action sensible consignée dans le journal d'activité de l'équipe (traçabilité). */
export interface ActivityEntry {
  id: string;
  /** Nom du membre de l'équipe à l'origine de l'action */
  actor: string;
  label: string;
  kind: ActivityKind;
  createdAt: string;
}

/** Action récente d'un membre de l'équipe (« Mon compte › Activité récente »). */
export interface AccountActivity {
  id: string;
  label: string;
  createdAt: string;
  kind: ActivityKind | 'login' | 'request';
}

/** Session ouverte dans le back-office. */
export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  startedAt: string;
  lastActivityAt: string;
}
