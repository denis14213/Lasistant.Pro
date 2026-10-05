import { bookingFor, ROUTES } from '@/config/routes';
import { isoDaysAgo } from '@/lib/dates';
import type { Service } from '@/types';

/**
 * Services de LASISTANT.PRO, repris du site actuel et du cahier des charges.
 * Le fond métier est conservé ; seule la rédaction est professionnalisée.
 */
export function createServicesSeed(now = new Date()): Service[] {
  const updatedAt = isoDaysAgo(2, '15:30', now);
  return [
    {
      id: 'assistance-medicale',
      slug: 'assistance-medicale',
      kind: 'page',
      title: 'Assistance médicale',
      subtitle: 'Soins personnalisés',
      summary:
        'Étude préalable de votre dossier et orientation vers un médecin habilité à vous examiner une fois en Tunisie.',
      description:
        'Nous étudions en amont le dossier du patient qui souhaite poursuivre un traitement en Tunisie, puis l’orientons vers un médecin habilité à l’examiner une fois sur place. Une assistance à domicile, attentive et chaleureuse, peut compléter ce suivi.',
      highlights: [
        'Étude préalable du dossier',
        'Orientation vers un médecin habilité',
        'Assistance à domicile, confort et sécurité',
      ],
      details: [
        'Étude préalable de votre dossier',
        'Orientation vers un médecin habilité',
        'Coordination avec votre logement et votre accueil',
        'Suivi personnalisé à domicile',
      ],
      audiences: [{ label: 'Patients internationaux' }, { label: 'Familles & proches' }],
      icon: 'medical',
      iconTone: 'brand',
      image: 'seniorCare',
      imageAlt: 'Une soignante accompagne une patiente âgée',
      ctaLabel: 'Demander un accompagnement',
      ctaHref: bookingFor('assistance-medicale'),
      active: true,
      showInMenu: true,
      showMedicalDisclaimer: true,
      sortOrder: 1,
      seo: {
        title: 'Assistance médicale en Tunisie',
        description:
          'Étude préalable de votre dossier et orientation vers un médecin habilité en Tunisie. Un accompagnement humain et personnalisé pour votre séjour.',
      },
      updatedAt,
      updatedBy: 'Éditrice contenus',
    },
    {
      id: 'logement-hebergement',
      slug: 'logement-hebergement',
      kind: 'page',
      title: 'Logement & hébergement',
      subtitle: 'Professionnalisme et dévouement',
      summary:
        'Recherche de solutions adaptées à votre séjour, court ou long, selon les disponibilités et votre budget.',
      description:
        'Patient ou étudiant, pour un court ou un long séjour, nous recherchons différents types de logements selon les offres disponibles : des solutions attractives, adaptées à votre budget et dotées des commodités nécessaires.',
      highlights: [
        'Pour les patients et les étudiants',
        'Séjour de courte ou de longue durée',
        'En lien avec agences, responsables et propriétaires',
      ],
      details: [
        'Appartement, studio, chambre ou colocation',
        'Recherche selon vos dates et votre budget',
        'Mise en relation avec agences, responsables et propriétaires',
        'Accompagnement jusqu’à votre installation',
      ],
      audiences: [{ label: 'Patients' }, { label: 'Étudiants' }, { label: 'Parents' }],
      icon: 'housing',
      iconTone: 'success',
      image: 'apartment',
      imageAlt: 'Appartement meublé et lumineux',
      ctaLabel: 'Demander un logement',
      ctaHref: `${ROUTES.housing}#recherche`,
      active: true,
      showInMenu: true,
      showMedicalDisclaimer: false,
      sortOrder: 2,
      seo: {
        title: 'Logement et hébergement en Tunisie',
        description:
          'Recherche de logement pour patients et étudiants en Tunisie : appartement, studio, chambre ou colocation, selon vos dates et votre budget.',
      },
      updatedAt,
      updatedBy: 'Éditrice contenus',
    },
    {
      id: 'accompagnement-des-malades',
      slug: 'accompagnement-des-malades',
      kind: 'page',
      title: 'Accompagnement des malades',
      subtitle: 'Soutien et bienveillance',
      summary:
        'Au-delà de l’accueil à l’aéroport, une présence attentive pendant le séjour, notamment pour les personnes âgées.',
      description:
        'Notre présence va au-delà de l’accueil à l’aéroport : nous accompagnons les personnes pendant leur séjour, en particulier les personnes âgées, en veillant à leur confort, à leur sécurité et à leur bien-être.',
      highlights: [
        'Accueil à votre arrivée',
        'Attention particulière aux personnes âgées',
        'Confort, sécurité et bien-être',
      ],
      details: [
        'Accueil à votre arrivée',
        'Présence lors des déplacements et des démarches',
        'Attention particulière aux personnes âgées',
        'Services personnalisés',
      ],
      audiences: [{ label: 'Personnes âgées' }, { label: 'Patients' }, { label: 'Familles' }],
      icon: 'care',
      iconTone: 'gold',
      image: 'gardenWalk',
      imageAlt: 'Un couple âgé se promène dans un jardin',
      ctaLabel: 'Demander un accompagnement',
      ctaHref: bookingFor('accompagnement-des-malades'),
      active: true,
      showInMenu: true,
      showMedicalDisclaimer: true,
      sortOrder: 3,
      seo: {
        title: 'Accompagnement des malades en Tunisie',
        description:
          'Accueil à l’aéroport et présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées.',
      },
      updatedAt,
      updatedBy: 'Éditrice contenus',
    },
    {
      id: 'echange-global',
      slug: 'echange-global',
      kind: 'reservation',
      title: 'Assistant social & service de logement',
      subtitle: 'Échange découverte',
      summary: 'Un échange global pour faire le point sur votre situation et vos besoins.',
      description:
        'Un premier échange d’une heure avec notre assistant social pour cerner vos besoins et vous orienter.',
      highlights: [],
      details: [],
      audiences: [],
      icon: 'conversation',
      iconTone: 'neutral',
      image: 'meeting',
      imageAlt: 'Deux personnes échangent lors d’un rendez-vous',
      ctaLabel: 'Réserver un échange',
      ctaHref: bookingFor('echange-global'),
      active: true,
      showInMenu: false,
      showMedicalDisclaimer: false,
      sortOrder: 4,
      seo: {
        title: 'Réserver un échange',
        description: 'Réservez un échange de 1 h avec notre assistant social.',
      },
      updatedAt,
      updatedBy: 'Admin LASISTANT',
    },
  ];
}
