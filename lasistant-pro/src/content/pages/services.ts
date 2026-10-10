import { ROUTES } from '@/config/routes';
import type {
  AccentText,
  FeatureItem,
  GalleryItem,
  IconName,
  IconTone,
  ImageRef,
  LinkAction,
  StepItem,
} from '@/types';

/**
 * Contenus des pages « Nos services » et des trois pages de service.
 */

export const SERVICES_PAGE_CONTENT = {
  seo: {
    title: 'Nos services',
    description:
      'Assistance médicale, logement et accompagnement des malades : LASISTANT.PRO coordonne vos démarches en Tunisie.',
  },
  hero: {
    eyebrow: 'Nos services',
    title: {
      start: 'Des services pensés pour',
      accent: 'chaque étape',
      end: 'de votre séjour',
    } satisfies AccentText,
    lead: 'Assistance médicale, logement et accompagnement : LASISTANT.PRO coordonne vos démarches en Tunisie avec une approche humaine et personnalisée.',
  },
  finder: {
    eyebrow: 'Trouver le bon service',
    title: 'Quelle est votre situation ?',
    options: [
      {
        label: 'Je prépare un traitement en Tunisie',
        hint: 'Assistance médicale',
        to: ROUTES.medicalAssistance,
        icon: 'medical',
        tone: 'brand',
      },
      {
        label: 'Je cherche un logement, patient ou étudiant',
        hint: 'Logement & hébergement',
        to: ROUTES.housing,
        icon: 'housing',
        tone: 'success',
      },
      {
        label: 'J’accompagne un proche âgé ou malade',
        hint: 'Accompagnement des malades',
        to: ROUTES.patientSupport,
        icon: 'care',
        tone: 'gold',
      },
      {
        label: 'Je suis un professionnel ou un partenaire',
        hint: 'Prendre contact',
        to: ROUTES.contact,
        icon: 'partner',
        tone: 'neutral',
      },
    ] satisfies ReadonlyArray<{ label: string; hint: string; to: string; icon: IconName; tone: IconTone }>,
  },
  /** Visuels propres à la page « Nos services » (différents des cartes de l'accueil) */
  rowImages: {
    'assistance-medicale': 'familyConsultation',
    'logement-hebergement': 'brightApartment',
    'accompagnement-des-malades': 'airportWelcome',
  } satisfies Record<string, ImageRef>,
  help: {
    title: 'Vous ne savez pas quel service choisir ?',
    text: 'Réservez un échange de 1 h avec notre assistant social : nous faisons le point ensemble, par e-mail ou par téléphone, et nous vous orientons.',
    cta: { label: 'Réserver un échange', to: ROUTES.booking } satisfies LinkAction,
  },
} as const;

export const MEDICAL_ASSISTANCE_CONTENT = {
  seo: {
    title: 'Assistance médicale en Tunisie',
    description:
      'Étude préalable de votre dossier et orientation vers un médecin habilité en Tunisie. Un accompagnement humain et personnalisé.',
  },
  hero: {
    eyebrow: 'Assistance médicale · Soins personnalisés',
    title: {
      start: 'Un accompagnement',
      accent: 'attentif',
      end: 'pour poursuivre votre traitement en Tunisie',
    } satisfies AccentText,
    lead: 'Nous étudions votre dossier en amont, facilitons l’orientation vers un médecin habilité à vous examiner sur place et vous accompagnons dans chacune de vos démarches.',
    note: 'Un service d’accompagnement : nous ne réalisons ni diagnostic ni acte médical.',
    image: 'familyConsultation' satisfies ImageRef,
    floatTitle: 'Premier échange de 1 h',
    floatText: 'Par e-mail ou par téléphone',
  },
  role: {
    title: 'Important : notre rôle',
    text: 'LASISTANT.PRO est un service d’accompagnement et de coordination. Nous ne remplaçons pas un professionnel de santé et ne formulons aucun diagnostic ni promesse de résultat. Seul le médecin qui vous examine est habilité à se prononcer sur votre situation.',
  },
  features: {
    eyebrow: 'Ce que nous faisons',
    title: {
      start: 'Un relais',
      accent: 'humain et organisé',
      end: 'entre vous et votre séjour',
    } satisfies AccentText,
    lead: 'Nous prenons en charge l’organisation pour que vous puissiez vous concentrer sur l’essentiel.',
    items: [
      {
        title: 'Étude préalable du dossier',
        text: 'Nous prenons connaissance de votre demande et de votre situation avant votre venue.',
        icon: 'fileReview',
      },
      {
        title: 'Orientation vers un médecin habilité',
        text: 'Votre dossier est orienté vers un médecin habilité à vous examiner une fois en Tunisie.',
        icon: 'orientation',
      },
      {
        title: 'Organisation du séjour',
        text: 'Logement, accueil, déplacements : nous coordonnons avec vous les aspects pratiques.',
        icon: 'stay',
      },
      {
        title: 'Assistance à domicile',
        text: 'Un suivi personnalisé, confortable et sécurisant, avec une approche chaleureuse.',
        icon: 'housing',
        pending: 'Périmètre à confirmer',
      },
    ] satisfies readonly FeatureItem[],
  },
  field: {
    eyebrow: 'Sur le terrain',
    title: { start: 'Nous vous accompagnons', accent: 'jusqu’en consultation' } satisfies AccentText,
    lead: 'Une fois en Tunisie, un membre de l’équipe vous accompagne aux rendez-vous chez les médecins vers lesquels vous êtes orienté(e).',
    items: [
      {
        image: 'eyeExam',
        title: 'Examens et rendez-vous',
        text: 'Nous organisons vos rendez-vous et vous y accompagnons.',
      },
      {
        image: 'doctorConsultation',
        title: 'Des échanges facilités',
        text: 'Nous vous aidons à préparer vos questions et à exposer votre situation.',
      },
      {
        image: 'eyeExamFollowUp',
        title: 'Un suivi dans la durée',
        text: 'Nous restons présents pour les rendez-vous de suivi pendant votre séjour.',
      },
    ] satisfies readonly GalleryItem[],
  },
  preparation: {
    eyebrow: 'Avant votre arrivée',
    title: { start: 'Votre parcours de', accent: 'préparation' } satisfies AccentText,
    lead: 'Quatre étapes claires pour arriver en Tunisie l’esprit tranquille, en sachant qui vous accompagne.',
    steps: [
      {
        title: 'Premier échange',
        text: 'Un rendez-vous de 1 h, par e-mail ou par téléphone, pour comprendre votre besoin et répondre à vos questions.',
      },
      {
        title: 'Étude préalable du dossier',
        text: 'Nous examinons votre demande et identifions les démarches à prévoir avant votre arrivée.',
      },
      {
        title: 'Orientation',
        text: 'Nous facilitons l’orientation vers un médecin habilité à vous examiner une fois en Tunisie.',
      },
      {
        title: 'Arrivée & accompagnement',
        text: 'Accueil, installation et présence attentive pendant votre séjour, selon vos besoins.',
      },
    ] satisfies readonly StepItem[],
    checklistTitle: 'Préparer votre premier échange',
    checklistIntro: 'Pour gagner du temps, gardez ces informations à portée de main :',
    checklist: [
      'Vos dates de séjour envisagées',
      'Le profil de la personne concernée',
      'Vos besoins de logement et d’accompagnement',
      'Vos questions pratiques',
    ],
    privacyNote:
      'N’envoyez pas de documents médicaux via les formulaires du site. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé.',
  },
  homeCare: {
    eyebrow: 'Assistance à domicile',
    title: { start: 'Un suivi personnalisé,', accent: 'chez vous' } satisfies AccentText,
    text: 'Notre équipe fournit une assistance complète et personnalisée à domicile, avec un suivi attentif et une prise en charge chaleureuse.',
    image: 'careSession' satisfies ImageRef,
    qualities: ['Confort', 'Sécurité', 'Prise en charge professionnelle', 'Approche chaleureuse'],
    pending: 'Modalités et zones d’intervention à confirmer par LASISTANT.PRO',
  },
  related: [
    {
      tag: 'Logement',
      title: 'Un logement adapté pendant votre traitement',
      text: 'Pour vous et la personne qui vous accompagne.',
      image: 'bedroom',
      to: ROUTES.housing,
    },
    {
      tag: 'Accompagnement',
      title: 'Une présence attentive pendant le séjour',
      text: 'Accueil, déplacements, démarches : nous restons à vos côtés.',
      image: 'hospitalVisit',
      to: ROUTES.patientSupport,
    },
  ] satisfies ReadonlyArray<{ tag: string; title: string; text: string; image: ImageRef; to: string }>,
  relatedTitle: 'Services complémentaires',
  faqTitle: 'Vos questions sur l’assistance médicale',
  faqCategory: 'assistance-medicale',
} as const;

export const HOUSING_CONTENT = {
  seo: {
    title: 'Logement et hébergement en Tunisie',
    description:
      'Patient ou étudiant, pour un court ou un long séjour : nous recherchons un logement adapté à vos dates et à votre budget en Tunisie.',
  },
  hero: {
    eyebrow: 'Logement · Professionnalisme et dévouement',
    title: { start: 'Un logement adapté à votre séjour,', accent: 'trouvé avec vous' } satisfies AccentText,
    lead: 'Patient ou étudiant, pour un court ou un long séjour : nous recherchons des solutions adaptées aux disponibilités et à votre budget, en lien avec agences, responsables et propriétaires.',
    image: 'livingRoom' satisfies ImageRef,
    floatTitle: 'Séjour court ou long',
    floatText: 'Selon vos dates et votre budget',
  },
  profiles: {
    eyebrow: 'Pour qui ?',
    title: { start: 'Deux profils,', accent: 'un même soin', end: 'du détail' } satisfies AccentText,
    items: [
      {
        tag: 'Patients',
        title: 'Vous êtes patient(e)',
        text: 'Un logement confortable et pratique pendant votre traitement, pour vous et, si besoin, la personne qui vous accompagne.',
        points: [
          'Séjour de courte ou de longue durée',
          'Les commodités nécessaires à votre confort',
          'Coordination avec votre accompagnement',
        ],
        image: 'bedroom',
      },
      {
        tag: 'Étudiants & parents',
        title: 'Vous êtes étudiant(e) ou parent',
        text: 'Nous soulageons les parents qui souhaitent trouver rapidement un logement ou une chambre en colocation pour leur futur diplômé.',
        points: [
          'Chambre, studio ou colocation',
          'Un budget maîtrisé',
          'Une recherche accompagnée, de A à Z',
        ],
        image: 'studyDesk',
      },
    ] satisfies ReadonlyArray<{
      tag: string;
      title: string;
      text: string;
      points: string[];
      image: ImageRef;
    }>,
  },
  solutions: {
    eyebrow: 'Les solutions recherchées',
    title: {
      start: 'Des logements',
      accent: 'attractifs',
      end: ', adaptés à vos besoins',
    } satisfies AccentText,
    lead: 'Selon les offres disponibles, nous privilégions des solutions attractives, moins coûteuses et dotées des commodités nécessaires.',
    items: [
      {
        title: 'Appartement',
        text: 'Pour un séjour en famille ou avec un accompagnant.',
        icon: 'apartment',
      },
      { title: 'Studio', text: 'Une solution indépendante et pratique.', icon: 'studio' },
      { title: 'Chambre', text: 'Pour un séjour court ou un budget serré.', icon: 'room' },
      {
        title: 'Colocation',
        text: 'Idéale pour les étudiants qui arrivent en Tunisie.',
        icon: 'family',
      },
    ] satisfies readonly FeatureItem[],
    criteriaLabel: 'Nous tenons compte de :',
    criteria: [
      'Vos dates',
      'Votre budget',
      'Le nombre de personnes',
      'Les commodités',
      'Vos besoins particuliers',
    ],
  },
  method: {
    eyebrow: 'Notre méthode',
    title: { start: 'Trois étapes jusqu’à', accent: 'votre installation' } satisfies AccentText,
    steps: [
      {
        title: 'Vous précisez vos critères',
        text: 'Zone, dates, budget, type de logement, nombre de personnes et besoins particuliers.',
      },
      {
        title: 'Nous sollicitons notre réseau',
        text: 'Agences immobilières, responsables et propriétaires, selon les disponibilités.',
      },
      {
        title: 'Nous vous accompagnons',
        text: 'Présentation des solutions retenues, puis accompagnement jusqu’à votre installation.',
      },
    ] satisfies readonly StepItem[],
  },
  form: {
    eyebrow: 'Formulaire de recherche',
    title: { start: 'Décrivez', accent: 'votre recherche' } satisfies AccentText,
    lead: 'Plus vos critères sont précis, plus notre recherche sera ciblée. Nous revenons vers vous par e-mail ou par téléphone.',
    promises: [
      'Sans engagement',
      'Recherche selon les offres disponibles',
      'Un interlocuteur pour toutes vos questions',
    ],
  },
} as const;

export const PATIENT_SUPPORT_CONTENT = {
  seo: {
    title: 'Accompagnement des malades en Tunisie',
    description:
      'Accueil à l’aéroport et présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées.',
  },
  hero: {
    eyebrow: 'Accompagnement · Soutien et bienveillance',
    title: {
      start: 'Une présence attentive,',
      accent: 'de l’accueil',
      end: 'à la fin du séjour',
    } satisfies AccentText,
    lead: 'Au-delà de l’accueil à l’aéroport, nous accompagnons les personnes pendant leur séjour, avec une attention particulière portée aux personnes âgées.',
    image: 'hospitalVisit' satisfies ImageRef,
    floatTitle: 'Dès votre arrivée',
    floatText: 'Accueil à l’aéroport et installation',
  },
  pillars: {
    eyebrow: 'Notre engagement',
    title: { start: 'Quatre attentions,', accent: 'à chaque instant' } satisfies AccentText,
    items: [
      {
        title: 'Confort',
        text: 'Un rythme respecté et un cadre agréable, pour un séjour sans fatigue inutile.',
      },
      {
        title: 'Sécurité',
        text: 'Des déplacements et des démarches préparés, pour avancer en confiance.',
      },
      {
        title: 'Bien-être',
        text: 'Une attention portée à l’humeur, aux besoins et aux envies de chacun.',
      },
      {
        title: 'Présence humaine',
        text: 'Une présence attentive et des services personnalisés, tout au long du séjour.',
      },
    ] satisfies readonly FeatureItem[],
  },
  field: {
    eyebrow: 'Sur le terrain',
    title: { start: 'Dès votre arrivée,', accent: 'nous sommes là' } satisfies AccentText,
    lead: 'Accueil à l’aéroport, kit de bienvenue, trajets vers le logement et les rendez-vous : chaque moment du séjour est préparé avec vous.',
    items: [
      {
        image: 'airportWelcome',
        title: 'Accueil à l’aéroport',
        text: 'Nous vous attendons à la sortie et vous aidons avec vos bagages.',
      },
      {
        image: 'welcomeKit',
        title: 'Installation',
        text: 'Un kit de bienvenue vous est remis à votre arrivée au logement.',
      },
      {
        image: 'teamVehicleDoor',
        title: 'Trajets accompagnés',
        text: 'Un véhicule identifié pour vos déplacements et vos rendez-vous.',
      },
    ] satisfies readonly GalleryItem[],
  },
  seniors: {
    eyebrow: 'Personnes âgées',
    title: { start: 'Une attention', accent: 'particulière', end: 'pour nos aînés' } satisfies AccentText,
    text: 'Rythme, mobilité, besoin d’être rassuré : nous adaptons notre accompagnement à chaque personne, pour qu’elle vive son séjour en toute sérénité.',
    points: [
      { label: 'Accueil et aide à l’installation' },
      { label: 'Accompagnement lors des déplacements et des démarches' },
      { label: 'Présence attentive et services personnalisés' },
      { label: 'Lien avec les proches', pending: 'à confirmer' },
    ],
    image: 'eyeExamFollowUp' satisfies ImageRef,
  },
  scope: {
    eyebrow: 'En toute transparence',
    title: { start: 'Ce qui est inclus,', accent: 'et ce qui ne l’est pas' } satisfies AccentText,
    pendingLabel: 'Contenu à valider par LASISTANT.PRO',
    included: [
      'Accueil à l’arrivée, à l’aéroport',
      'Accompagnement pendant le séjour',
      'Aide aux déplacements et aux démarches',
      'Attention au confort, à la sécurité et au bien-être',
      'Suivi personnalisé',
    ],
    excluded: [
      { label: 'Actes médicaux et soins infirmiers' },
      { label: 'Diagnostic ou avis médical' },
      { label: 'Frais médicaux, d’hébergement et de transport', pending: 'à préciser' },
      { label: '', pending: 'Autre élément à préciser' },
    ],
  },
  steps: {
    eyebrow: 'Déroulement',
    title: 'Comment se passe l’accompagnement ?',
    items: [
      {
        title: 'Échange préalable',
        text: 'Nous faisons connaissance et définissons ensemble les besoins de la personne accompagnée.',
      },
      {
        title: 'Préparation de l’arrivée',
        text: 'Horaires, logement, déplacements : tout est organisé en amont.',
      },
      {
        title: 'Accueil & installation',
        text: 'Nous accueillons la personne à l’aéroport et l’aidons à s’installer.',
      },
      {
        title: 'Présence pendant le séjour',
        text: 'Nous restons présents et disponibles jusqu’à la fin du séjour.',
      },
    ] satisfies readonly StepItem[],
  },
} as const;
