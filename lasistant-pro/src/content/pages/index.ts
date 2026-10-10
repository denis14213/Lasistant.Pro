import { ROUTES } from '@/config/routes';
import { BRAND_CONTENT } from '../brand';
import { LEGAL_NOTICE, PRIVACY_POLICY } from '../legal';
import { ABOUT_CONTENT } from './about';
import { HOME_CONTENT } from './home';
import {
  ARTICLES_CONTENT,
  BOOKING_CONTENT,
  CONFIRMATION_CONTENT,
  CONTACT_CONTENT,
  COOKIES_PAGE_CONTENT,
  FAQ_CONTENT,
  SITEMAP_CONTENT,
} from './public';
import {
  HOUSING_CONTENT,
  MEDICAL_ASSISTANCE_CONTENT,
  PATIENT_SUPPORT_CONTENT,
  SERVICES_PAGE_CONTENT,
} from './services';

/**
 * Contenus des pages du site (table « page_contents »).
 *
 * Les textes et visuels de chaque page sont enregistrés dans la base et modifiables depuis
 * le back-office (« Pages du site »). Les valeurs ci-dessous sont les contenus d'origine :
 * elles servent à amorcer la base (migration générée) et de structure de référence : un
 * champ absent de la version enregistrée reprend sa valeur d'origine, de sorte qu'une page
 * reste toujours complète.
 *
 * Exceptions volontaires, conservées dans le code : les pages d'erreur et « hors connexion »
 * (elles doivent s'afficher sans réseau ni base de données).
 */
export const PAGE_DEFAULTS = {
  accueil: HOME_CONTENT,
  'a-propos': ABOUT_CONTENT,
  services: SERVICES_PAGE_CONTENT,
  'assistance-medicale': MEDICAL_ASSISTANCE_CONTENT,
  logement: HOUSING_CONTENT,
  accompagnement: PATIENT_SUPPORT_CONTENT,
  reservation: BOOKING_CONTENT,
  confirmation: CONFIRMATION_CONTENT,
  contact: CONTACT_CONTENT,
  'espace-infos': ARTICLES_CONTENT,
  faq: FAQ_CONTENT,
  cookies: COOKIES_PAGE_CONTENT,
  'plan-du-site': SITEMAP_CONTENT,
  'mentions-legales': LEGAL_NOTICE,
  confidentialite: PRIVACY_POLICY,
  identite: BRAND_CONTENT,
};

export type PageKey = keyof typeof PAGE_DEFAULTS;

/** Contenus de toutes les pages, tels qu'affichés sur le site. */
export type PageContents = { [K in PageKey]: (typeof PAGE_DEFAULTS)[K] };

export const PAGE_KEYS = Object.keys(PAGE_DEFAULTS) as PageKey[];

export interface PageDefinition {
  label: string;
  group: 'Pages principales' | 'Services' | 'Demandes et informations' | 'Légal' | 'Commun';
  /** Adresse publique de la page (aperçu), ou null pour un contenu partagé */
  path: string | null;
  description: string;
}

/** Libellés et adresses des pages, pour le back-office. */
export const PAGE_DEFINITIONS: Record<PageKey, PageDefinition> = {
  accueil: {
    label: 'Accueil',
    group: 'Pages principales',
    path: ROUTES.home,
    description: 'Héros, services, « Sur le terrain », confiance, parcours, publics, contact.',
  },
  'a-propos': {
    label: 'À propos',
    group: 'Pages principales',
    path: ROUTES.about,
    description: 'Mission, histoire, approche, équipe identifiable, zone d’intervention.',
  },
  services: {
    label: 'Nos services',
    group: 'Services',
    path: ROUTES.services,
    description: 'Présentation des services et aide au choix.',
  },
  'assistance-medicale': {
    label: 'Assistance médicale',
    group: 'Services',
    path: ROUTES.medicalAssistance,
    description: 'Rôle, accompagnement en consultation, préparation, assistance à domicile.',
  },
  logement: {
    label: 'Logement & hébergement',
    group: 'Services',
    path: ROUTES.housing,
    description: 'Profils, solutions, méthode et formulaire de recherche.',
  },
  accompagnement: {
    label: 'Accompagnement des malades',
    group: 'Services',
    path: ROUTES.patientSupport,
    description: 'Engagements, accueil sur le terrain, personnes âgées, périmètre.',
  },
  reservation: {
    label: 'Réservation en ligne',
    group: 'Demandes et informations',
    path: ROUTES.booking,
    description: 'Textes des cinq étapes de la réservation.',
  },
  confirmation: {
    label: 'Confirmation de demande',
    group: 'Demandes et informations',
    path: null,
    description: 'Page affichée après l’envoi d’une demande.',
  },
  contact: {
    label: 'Contact',
    group: 'Demandes et informations',
    path: ROUTES.contact,
    description: 'Introduction, carte et partenaires.',
  },
  'espace-infos': {
    label: 'Espace infos',
    group: 'Demandes et informations',
    path: ROUTES.articles,
    description: 'Introduction de l’Espace infos et encarts des articles.',
  },
  faq: {
    label: 'Questions fréquentes',
    group: 'Demandes et informations',
    path: ROUTES.faq,
    description: 'Introduction et encart d’aide (les questions se gèrent à part).',
  },
  cookies: {
    label: 'Gestion des cookies',
    group: 'Légal',
    path: ROUTES.cookies,
    description: 'Introduction et questions sur les cookies.',
  },
  'plan-du-site': {
    label: 'Plan du site',
    group: 'Demandes et informations',
    path: ROUTES.sitemap,
    description: 'Introduction du plan du site.',
  },
  'mentions-legales': {
    label: 'Mentions légales',
    group: 'Légal',
    path: ROUTES.legalNotice,
    description: 'Texte des mentions légales (l’éditeur est repris des réglages).',
  },
  confidentialite: {
    label: 'Politique de confidentialité',
    group: 'Légal',
    path: ROUTES.privacy,
    description: 'Texte de la politique de confidentialité.',
  },
  identite: {
    label: 'Identité (contenus communs)',
    group: 'Commun',
    path: null,
    description:
      'Valeurs, parcours, publics, mission, appel final et rappel médical, repris sur plusieurs pages.',
  },
};
