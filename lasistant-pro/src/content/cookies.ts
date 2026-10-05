import type { IconName, IconTone } from '@/types';

/**
 * Catalogue des cookies et catégories de consentement.
 * Toute nouvelle balise (statistiques, carte, partage…) doit être déclarée ici
 * avant d'être installée : la bannière, la fenêtre de préférences et la page
 * « Gestion des cookies » lisent ce catalogue.
 */

export type ConsentCategoryId = 'essential' | 'analytics' | 'thirdParty';

export interface CookieDefinition {
  name: string;
  purpose: string;
  /** Durée de conservation ; « null » = à définir */
  duration: string | null;
  /** Durée proposée, encore à valider par le propriétaire */
  durationPending?: boolean;
  /** Nom à confirmer (outil pas encore choisi) */
  pendingName?: boolean;
}

export interface ConsentCategory {
  id: ConsentCategoryId;
  title: string;
  description: string;
  icon: IconName;
  tone: IconTone;
  /** Catégorie indispensable : toujours active, non désactivable */
  required: boolean;
  tagLabel: string;
  cookies: CookieDefinition[];
}

export const CONSENT_CATEGORIES: ConsentCategory[] = [
  {
    id: 'essential',
    title: 'Essentiels',
    description:
      'Fonctionnement du site, sécurité des formulaires, mémorisation de vos choix, connexion au back-office.',
    icon: 'secure',
    tone: 'success',
    required: true,
    tagLabel: 'Essentiel',
    cookies: [
      {
        name: 'lp_consent',
        purpose: 'Mémoriser vos préférences de cookies',
        duration: '6 mois',
        durationPending: true,
      },
      {
        name: 'lp_csrf',
        purpose: 'Protéger les formulaires contre les envois frauduleux',
        duration: 'Session',
      },
      {
        name: 'lp_admin_session',
        purpose: 'Maintenir la connexion de l’équipe au back-office',
        duration: 'Session',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Mesure d’audience',
    description:
      'Statistiques de visite anonymisées, pour comprendre comment le site est utilisé et l’améliorer. Aucune donnée n’est revendue.',
    icon: 'analytics',
    tone: 'brand',
    required: false,
    tagLabel: 'Audience',
    cookies: [
      {
        name: 'Outil à choisir',
        pendingName: true,
        purpose: 'Compter les visites et les pages vues, sans publicité ni revente de données',
        duration: null,
      },
    ],
  },
  {
    id: 'thirdParty',
    title: 'Contenus tiers',
    description: 'Carte interactive de la page Contact et boutons de partage vers Facebook ou WhatsApp.',
    icon: 'map',
    tone: 'gold',
    required: false,
    tagLabel: 'Contenus tiers',
    cookies: [
      {
        name: 'Fournisseur de carte',
        pendingName: true,
        purpose: 'Afficher le plan d’accès',
        duration: null,
      },
      { name: 'Facebook', purpose: 'Partager un article', duration: null },
    ],
  },
];

/** Durée de validité du choix : au-delà, la bannière est de nouveau proposée. */
export const CONSENT_DURATION_DAYS = 182;

/** Version du catalogue : l'incrémenter redemande le consentement à tous les visiteurs. */
export const CONSENT_VERSION = 1;

export const COOKIE_FAQ = [
  {
    id: 'definition',
    question: 'Qu’est-ce qu’un cookie ?',
    answer:
      'Un cookie est un petit fichier déposé sur votre appareil lorsque vous consultez un site. Il permet par exemple de mémoriser vos choix ou de mesurer la fréquentation.',
  },
  {
    id: 'modifier',
    question: 'Comment modifier mes choix plus tard ?',
    answer:
      'À tout moment, depuis cette page ou grâce au bouton « Cookies » affiché en bas de l’écran. Vos nouveaux choix s’appliquent immédiatement.',
  },
  {
    id: 'refus',
    question: 'Que se passe-t-il si je refuse tous les cookies ?',
    answer:
      'Le site reste entièrement utilisable. Seuls la carte interactive et les boutons de partage sont remplacés par des liens simples, et aucune statistique n’est collectée.',
  },
];
