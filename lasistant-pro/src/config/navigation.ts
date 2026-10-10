import type { Permission } from '@/lib/permissions';
import type { AdminIconName } from '@/types';
import { ROUTES } from './routes';

/**
 * Menus du site et du back-office.
 * La liste des services du méga-menu et du pied de page provient des données
 * (services actifs), afin qu'un service ajouté dans le back-office y apparaisse.
 */

export interface NavItem {
  label: string;
  /** Libellé plus explicite dans le menu mobile */
  mobileLabel?: string;
  to: string;
  /** Lien actif uniquement sur le chemin exact (accueil) */
  end?: boolean;
  /** Affiche le méga-menu des services au survol */
  servicesMenu?: boolean;
}

export const MAIN_NAVIGATION: NavItem[] = [
  { label: 'Accueil', to: ROUTES.home, end: true },
  { label: 'Services', mobileLabel: 'Nos services', to: ROUTES.services, servicesMenu: true },
  { label: 'À propos', to: ROUTES.about },
  { label: 'Espace infos', to: ROUTES.articles },
  { label: 'Réservation', mobileLabel: 'Réservation en ligne', to: ROUTES.booking },
  { label: 'Contact', to: ROUTES.contact },
];

export const FOOTER_COMPANY_LINKS: NavItem[] = [
  { label: 'À propos', to: ROUTES.about },
  { label: 'Espace infos', to: ROUTES.articles },
  { label: 'Questions fréquentes', to: ROUTES.faq },
  { label: 'Contact', to: ROUTES.contact },
];

export const LEGAL_LINKS: NavItem[] = [
  { label: 'Mentions légales', to: ROUTES.legalNotice },
  { label: 'Politique de confidentialité', to: ROUTES.privacy },
  { label: 'Gestion des cookies', to: ROUTES.cookies },
  { label: 'Plan du site', to: ROUTES.sitemap },
];

/** Groupes du plan du site (les services s'ajoutent dynamiquement). */
export const SITEMAP_GROUPS: Array<{
  id: string;
  title: string;
  links: NavItem[];
}> = [
  {
    id: 'decouvrir',
    title: 'Découvrir',
    links: [
      { label: 'Accueil', to: ROUTES.home },
      { label: 'À propos', to: ROUTES.about },
      { label: 'Contact', to: ROUTES.contact },
      { label: 'Questions fréquentes', to: ROUTES.faq },
    ],
  },
  {
    id: 'demandes',
    title: 'Demandes',
    links: [
      { label: 'Réservation en ligne', to: ROUTES.booking },
      { label: 'Recherche de logement', to: `${ROUTES.housing}#recherche` },
      { label: 'Formulaire de contact', to: ROUTES.contact },
    ],
  },
  {
    id: 'espace-infos',
    title: 'Espace infos',
    links: [{ label: 'Toutes les publications', to: ROUTES.articles }],
  },
  { id: 'legal', title: 'Informations légales', links: LEGAL_LINKS },
];

export interface AdminNavItem {
  label: string;
  to: string;
  icon: AdminIconName;
  permission: Permission;
  end?: boolean;
  /** Compteur affiché à droite du lien */
  counter?: 'newRequests' | 'upcomingAppointments';
}

export interface AdminNavGroup {
  label: string | null;
  items: AdminNavItem[];
}

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    label: null,
    items: [
      {
        label: 'Tableau de bord',
        to: ROUTES.admin.dashboard,
        icon: 'dashboard',
        permission: 'dashboard:view',
        end: true,
      },
      {
        label: 'Demandes',
        to: ROUTES.admin.requests,
        icon: 'inbox',
        permission: 'requests:view',
        counter: 'newRequests',
      },
      {
        label: 'Agenda',
        to: ROUTES.admin.agenda,
        icon: 'calendar',
        permission: 'agenda:manage',
        counter: 'upcomingAppointments',
      },
    ],
  },
  {
    label: 'Contenus',
    items: [
      { label: 'Services', to: ROUTES.admin.services, icon: 'services', permission: 'services:manage' },
      {
        label: 'Articles & catégories',
        to: ROUTES.admin.articles,
        icon: 'articles',
        permission: 'articles:manage',
      },
      { label: 'Pages du site', to: ROUTES.admin.pages, icon: 'pages', permission: 'pages:manage' },
      { label: 'Médiathèque', to: ROUTES.admin.media, icon: 'images', permission: 'media:manage' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        label: 'Coordonnées & réglages',
        to: ROUTES.admin.settings,
        icon: 'identity',
        permission: 'settings:manage',
      },
      { label: 'Utilisateurs & rôles', to: ROUTES.admin.users, icon: 'users', permission: 'users:manage' },
      {
        label: 'Modèles d’e-mails',
        to: ROUTES.admin.emails,
        icon: 'email',
        permission: 'email-templates:manage',
      },
    ],
  },
];
