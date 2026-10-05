import type { AdminRole } from '@/types';

/**
 * Contrôle d'accès par rôle (RBAC, cahier des charges § 9.1 et § 11.4).
 * Source unique de vérité : le menu latéral, la protection des routes et la
 * matrice affichée dans « Utilisateurs & rôles » lisent tous ce fichier.
 * En phase base de données, les mêmes règles seront appliquées côté serveur
 * (politiques de sécurité au niveau des lignes).
 */

export type Permission =
  | 'dashboard:view'
  | 'requests:view'
  | 'requests:manage'
  | 'agenda:manage'
  | 'services:manage'
  | 'articles:manage'
  | 'media:manage'
  | 'private-documents:view'
  | 'settings:manage'
  | 'email-templates:manage'
  | 'users:manage';

const ALL_PERMISSIONS: readonly Permission[] = [
  'dashboard:view',
  'requests:view',
  'requests:manage',
  'agenda:manage',
  'services:manage',
  'articles:manage',
  'media:manage',
  'private-documents:view',
  'settings:manage',
  'email-templates:manage',
  'users:manage',
];

const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  administrateur: ALL_PERMISSIONS,
  editeur: ['dashboard:view', 'requests:view', 'services:manage', 'articles:manage', 'media:manage'],
  operateur: [
    'dashboard:view',
    'requests:view',
    'requests:manage',
    'agenda:manage',
    'private-documents:view',
  ],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  administrateur: 'Administrateur',
  editeur: 'Éditeur',
  operateur: 'Opérateur',
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  administrateur: 'Accès complet, y compris les comptes et les réglages.',
  editeur: 'Gère les services, les articles et la médiathèque.',
  operateur: 'Consulte et traite les demandes et les rendez-vous.',
};

/** Le rôle dispose-t-il de cette permission ? */
export function can(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export type PermissionLevel = 'complet' | 'lecture' | 'aucun' | 'conditionnel';

interface PermissionRow {
  label: string;
  manage: Permission;
  read?: Permission;
  /** Cas particuliers documentés (ex. accès limité aux demandes assignées) */
  conditional?: Partial<Record<AdminRole, string>>;
}

/** Lignes de la matrice des droits, dans l'ordre d'affichage. */
export const PERMISSION_ROWS: PermissionRow[] = [
  { label: 'Tableau de bord', manage: 'dashboard:view' },
  {
    label: 'Demandes & réservations : consulter et traiter',
    manage: 'requests:manage',
    read: 'requests:view',
  },
  { label: 'Agenda & disponibilités', manage: 'agenda:manage' },
  { label: 'Services', manage: 'services:manage' },
  { label: 'Articles & catégories', manage: 'articles:manage' },
  { label: 'Médiathèque', manage: 'media:manage' },
  {
    label: 'Documents privés',
    manage: 'private-documents:view',
    conditional: { operateur: 'Selon la demande assignée' },
  },
  { label: 'Coordonnées & réglages', manage: 'settings:manage' },
  { label: "Modèles d'e-mails", manage: 'email-templates:manage' },
  { label: 'Utilisateurs & rôles', manage: 'users:manage' },
];

/** Niveau d'accès d'un rôle pour une ligne de la matrice. */
export function permissionLevel(
  role: AdminRole,
  row: PermissionRow,
): { level: PermissionLevel; note?: string } {
  const note = row.conditional?.[role];
  if (note) return { level: 'conditionnel', note };
  if (can(role, row.manage)) return { level: 'complet' };
  if (row.read && can(role, row.read)) return { level: 'lecture' };
  return { level: 'aucun' };
}
