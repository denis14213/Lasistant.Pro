import { ROUTES } from '@/config/routes';
import type { AccentText, FeatureItem, GalleryItem, ImageRef, LinkAction } from '@/types';

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
    image: 'teamMeeting' satisfies ImageRef,
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
    image: 'doctorConsultation' satisfies ImageRef,
    badgeTitle: 'Notre mission',
    badgeText: 'Assurer le bien-être et le confort de nos clients.',
    linkLabel: 'Découvrir notre approche',
  },
  field: {
    eyebrow: 'Sur le terrain',
    title: { start: 'À vos côtés,', accent: 'à chaque étape', end: 'du séjour' } satisfies AccentText,
    lead: 'De l’aéroport jusqu’au cabinet du médecin, notre équipe est présente auprès de chaque personne accompagnée. Quelques moments de nos accompagnements :',
    items: [
      {
        image: 'airportWelcome',
        title: 'Accueil à l’aéroport',
        text: 'Nous vous attendons à votre arrivée et vous accompagnons jusqu’à votre logement.',
      },
      {
        image: 'welcomeKit',
        title: 'Un kit de bienvenue',
        text: 'Remis à votre arrivée, aux couleurs de LASISTANT.PRO.',
      },
      {
        image: 'eyeExamFollowUp',
        title: 'Jusqu’en consultation',
        text: 'Nous vous accompagnons aux rendez-vous chez les médecins vers lesquels vous êtes orienté(e).',
      },
      {
        image: 'careSession',
        title: 'Des soins organisés',
        text: 'Nous organisons vos rendez-vous de soins et restons disponibles pendant leur déroulement.',
      },
      {
        image: 'teamVehicle',
        title: 'Des déplacements accompagnés',
        text: 'Un véhicule identifié LASISTANT.PRO vous conduit à vos rendez-vous.',
      },
    ] satisfies readonly GalleryItem[],
  },
  trust: {
    eyebrow: 'Pourquoi nous faire confiance',
    title: {
      start: 'Une équipe',
      accent: 'réelle et identifiable',
      end: ', engagée à vos côtés',
    } satisfies AccentText,
    lead: 'Confier son séjour, sa santé ou celle d’un proche demande de la confiance. Voici ce que nous garantissons à chaque personne accompagnée.',
    items: [
      {
        title: 'Une présence physique',
        text: 'Aéroport, consultations, hospitalisation : un membre de l’équipe est à vos côtés, pas seulement au téléphone.',
      },
      {
        title: 'Une équipe identifiable',
        text: 'Badge, véhicule et kit de bienvenue aux couleurs de LASISTANT.PRO : vous savez toujours qui vous accompagne.',
      },
      {
        title: 'Des médecins habilités',
        text: 'Nous vous orientons vers des médecins habilités à vous examiner. Nous ne réalisons nous-mêmes aucun acte médical.',
      },
      {
        title: 'Un interlocuteur dédié',
        text: 'Une personne de l’équipe suit votre demande, de la première prise de contact à la fin du séjour.',
      },
      {
        title: 'Tout est clair dès le départ',
        text: 'Ce qui est inclus dans l’accompagnement, et ce qui ne l’est pas, est précisé avant tout engagement.',
      },
      {
        title: 'Vos données protégées',
        text: 'Vos informations restent confidentielles et ne servent qu’à traiter votre demande.',
      },
    ] satisfies readonly FeatureItem[],
    linkLabel: 'Découvrir l’équipe et nos engagements',
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
    image: 'familyConsultation' satisfies ImageRef,
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
