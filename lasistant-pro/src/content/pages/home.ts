import { ROUTES } from '@/config/routes';
import type { AccentText, ImageRef, LinkAction } from '@/types';

/**
 * Contenu éditorial de la page d'accueil (cahier des charges § 6.1 et annexe 18.1).
 */
export const HOME_CONTENT = {
  seo: {
    title: 'Soutien médical et hébergement en Tunisie',
    description:
      'LASISTANT.PRO accompagne patients, familles, étudiants et personnes âgées : assistance médicale, logement et accompagnement en Tunisie.',
  },
  hero: {
    eyebrow: 'Service social d’assistance · Tunisie',
    title: { start: 'Soutien médical & hébergement', accent: 'en Tunisie' } satisfies AccentText,
    lead: 'LASISTANT.PRO accompagne ses clients dans leurs démarches d’assistance, de séjour et de logement en Tunisie, avec une approche humaine et personnalisée.',
    primaryCta: { label: 'Demander un accompagnement', to: ROUTES.booking } satisfies LinkAction,
    secondaryCta: { label: 'Réserver un échange', to: ROUTES.booking } satisfies LinkAction,
    audienceLabel: 'Nous accompagnons',
    audiences: ['Patients internationaux', 'Familles & proches', 'Étudiants', 'Personnes âgées'],
    image: 'consultation' satisfies ImageRef,
    insetImage: 'livingRoom' satisfies ImageRef,
    insetCaption: 'Un logement adapté à votre séjour et à votre budget',
    bookingCard: {
      tag: 'Réservation en ligne',
      title: 'Assistant social & service de logement',
      mode: 'Par e-mail ou par téléphone',
      cta: 'Réserver',
    },
  },
  services: {
    eyebrow: 'Nos services',
    title: {
      start: 'Trois expertises,',
      accent: 'un même engagement',
      end: 'à vos côtés',
    } satisfies AccentText,
    lead: 'De l’étude de votre dossier à votre installation, nous coordonnons chaque étape de votre séjour avec vous.',
    linkLabel: 'Voir tous nos services',
  },
  engagement: {
    eyebrow: 'Notre engagement',
    statement: {
      start: 'Faciliter vos démarches, anticiper vos besoins et veiller à votre',
      accent: 'confort',
      end: 'comme à votre sécurité.',
    } satisfies AccentText,
    text: 'Lasistant.Pro a pour but de vous accompagner dans vos démarches et de cerner vos besoins, avec une qualité de service adaptée à chaque personne accompagnée.',
    image: 'supportiveHands' satisfies ImageRef,
    badgeTitle: 'Notre mission',
    badgeText: 'Assurer le bien-être et le confort de nos clients.',
    linkLabel: 'Découvrir notre approche',
  },
  journey: {
    eyebrow: 'Votre parcours',
    title: { start: 'Un accompagnement clair,', accent: 'étape par étape' } satisfies AccentText,
    lead: 'De votre première demande au suivi de votre séjour, vous savez à chaque instant où en est votre dossier.',
    ctaText: 'Prêt(e) à commencer ? La première étape ne prend que quelques minutes.',
    primaryCta: { label: 'Démarrer ma demande', to: ROUTES.booking } satisfies LinkAction,
    secondaryCta: { label: 'Réserver un échange de 1 h', to: ROUTES.booking } satisfies LinkAction,
  },
  audiences: {
    eyebrow: 'Pour qui ?',
    title: { start: 'Un accompagnement adapté', accent: 'à chaque situation' } satisfies AccentText,
    lead: 'Patient, proche, étudiant ou partenaire : chaque profil a ses besoins. Nous partons des vôtres.',
    image: 'student' satisfies ImageRef,
  },
  values: {
    eyebrow: 'Nos valeurs',
    title: 'Ce qui guide chacune de nos interventions',
  },
  news: {
    eyebrow: 'Espace infos',
    title: { start: 'Découvrez nos', accent: 'dernières actualités' } satisfies AccentText,
    linkLabel: 'Toutes les publications',
  },
  contact: {
    eyebrow: 'Contact',
    title: { start: 'Parlons de', accent: 'votre besoin' } satisfies AccentText,
    lead: 'Décrivez votre situation en quelques lignes. Nous revenons vers vous par e-mail ou par téléphone pour en discuter et vous orienter.',
    formTitle: 'Demande rapide',
  },
} as const;
