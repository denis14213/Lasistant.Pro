import { ROUTES } from '@/config/routes';
import type { AccentText, IconName } from '@/types';

/**
 * Contenus de marque partagés par plusieurs pages (valeurs, parcours, publics, mission).
 */

export interface BrandValue {
  id: string;
  title: string;
  text: string;
}

/** Valeurs de réassurance (cahier des charges § 6.1) */
export const BRAND_VALUES: BrandValue[] = [
  {
    id: 'ecoute',
    title: 'Écoute',
    text: 'Nous prenons le temps de comprendre votre situation et vos attentes.',
  },
  {
    id: 'securite',
    title: 'Sécurité',
    text: 'Chaque étape est préparée pour que vous avanciez en confiance.',
  },
  {
    id: 'confort',
    title: 'Confort',
    text: 'Nous veillons à votre bien-être, à votre arrivée comme pendant le séjour.',
  },
  {
    id: 'personnalise',
    title: 'Accompagnement personnalisé',
    text: 'Un suivi adapté à votre profil, à votre rythme et à votre budget.',
  },
];

export interface JourneyStep {
  id: string;
  title: string;
  text: string;
}

/** Parcours d'accompagnement en cinq étapes (cahier des charges § 6.1) */
export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'demande',
    title: 'Demande',
    text: 'Vous décrivez votre besoin en ligne, par téléphone ou par e-mail.',
  },
  {
    id: 'qualification',
    title: 'Qualification',
    text: 'Nous échangeons avec vous pour cerner votre situation, vos dates et votre budget.',
  },
  {
    id: 'preparation',
    title: 'Préparation',
    text: 'Étude du dossier, orientation, recherche de logement : nous organisons chaque démarche.',
  },
  {
    id: 'accueil',
    title: 'Accueil & accompagnement',
    text: 'Nous vous accueillons à votre arrivée et restons présents pendant le séjour.',
  },
  {
    id: 'suivi',
    title: 'Suivi',
    text: 'Nous restons à votre écoute pour ajuster l’accompagnement si nécessaire.',
  },
];

export interface Audience {
  id: string;
  title: string;
  need: string;
  icon: IconName;
  cta: { label: string; to: string };
}

/** Publics cibles et action prioritaire de chacun (cahier des charges § 3.3) */
export const AUDIENCES: Audience[] = [
  {
    id: 'patients',
    title: 'Patients internationaux',
    need: 'Préparer votre séjour, être orienté et accompagné en Tunisie.',
    icon: 'arrival',
    cta: { label: 'Demander un accompagnement', to: ROUTES.medicalAssistance },
  },
  {
    id: 'familles',
    title: 'Familles & proches',
    need: 'Sécuriser l’organisation du séjour ou du logement d’un proche.',
    icon: 'family',
    cta: { label: 'Parler à un conseiller', to: ROUTES.contact },
  },
  {
    id: 'etudiants',
    title: 'Étudiants',
    need: 'Trouver un logement ou une chambre, pour une courte ou une longue durée.',
    icon: 'student',
    cta: { label: 'Demander un logement', to: ROUTES.housing },
  },
  {
    id: 'personnes-agees',
    title: 'Personnes âgées',
    need: 'Être accompagné(e) dans vos déplacements et vos démarches.',
    icon: 'care',
    cta: { label: 'Demander un accompagnement', to: ROUTES.patientSupport },
  },
  {
    id: 'partenaires',
    title: 'Professionnels & partenaires',
    need: 'Collaborer avec nous ou nous orienter des personnes à accompagner.',
    icon: 'partner',
    cta: { label: 'Prendre contact', to: ROUTES.contact },
  },
];

export const MISSION_STATEMENT =
  'Assurer le bien-être et le confort de nos clients, avec une qualité adaptée aux besoins de chaque personne accompagnée.';

export const SUPPORT_QUOTE =
  'N’hésitez pas à nous solliciter : notre objectif et notre présence sont là pour vous offrir un soutien plus personnel.';

export const TEAM_SIGNATURE = 'L’équipe LASISTANT.PRO';

/** Rappel affiché partout où il est question de santé (cahier des charges § 6.3) */
export const MEDICAL_DISCLAIMER = 'Nos services d’accompagnement ne remplacent pas un avis médical.';

/** Bloc d'appel final, en bas des pages de service et de la page « À propos ». */
export const CLOSING_CTA = {
  title: { start: 'Prêt(e) à préparer', accent: 'votre séjour', end: '?' } satisfies AccentText,
  text: 'Réservez un échange de 1 h avec notre équipe, par e-mail ou par téléphone.',
  primaryLabel: 'Demander un accompagnement',
} as const;
