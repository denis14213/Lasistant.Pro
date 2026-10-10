import type { AccentText } from '@/types';
import { COOKIE_FAQ } from '../cookies';

/**
 * Contenus des autres pages publiques : réservation, confirmation, contact,
 * Espace infos, FAQ, cookies, plan du site et pages système (erreurs, maintenance…).
 */

export const BOOKING_CONTENT = {
  seo: {
    title: 'Réservation en ligne',
    description: 'Réservez un échange de 1 h avec l’équipe LASISTANT.PRO, par e-mail ou par téléphone.',
  },
  hero: {
    eyebrow: 'Réservation en ligne',
    title: { start: 'Réservez votre', accent: 'échange de 1 h' } satisfies AccentText,
    lead: 'Choisissez votre service et votre créneau : notre équipe vous recontacte par e-mail ou par téléphone pour confirmer votre rendez-vous.',
    pills: ['Environ 3 minutes', 'Données protégées'],
  },
  steps: [
    {
      id: 'service',
      label: 'Service',
      title: 'Quel service vous intéresse ?',
      lead: 'Chaque demande commence par un échange de 1 h avec notre équipe.',
    },
    {
      id: 'schedule',
      label: 'Date & heure',
      title: 'Choisissez une date et une heure',
      lead: 'Heure de Tunisie (UTC+1). Les créneaux sont indicatifs et confirmés par notre équipe.',
    },
    {
      id: 'contact',
      label: 'Vos coordonnées',
      title: 'Vos coordonnées',
      lead: 'Elles nous permettent de vous recontacter pour confirmer le rendez-vous.',
    },
    {
      id: 'details',
      label: 'Informations complémentaires',
      title: 'Informations complémentaires',
      lead: 'Facultatif, mais utile pour préparer au mieux notre échange.',
    },
    {
      id: 'review',
      label: 'Validation',
      title: 'Vérifiez et confirmez',
      lead: 'Relisez votre demande avant de l’envoyer.',
    },
  ],
  summary: {
    title: 'Votre demande',
    subtitle: 'Échange avec un conseiller',
    note: 'Le rendez-vous est confirmé par notre équipe après examen de votre demande.',
  },
  privacyHint: 'Merci de ne pas indiquer d’informations médicales détaillées.',
  attachmentHint:
    'PDF, JPG ou PNG · 5 Mo maximum. Pour tout document médical, nous vous indiquerons un moyen d’envoi sécurisé.',
} as const;

export const CONFIRMATION_CONTENT = {
  seo: { title: 'Demande envoyée', description: 'Votre demande a bien été enregistrée.' },
  eyebrow: 'Demande envoyée',
  title: { start: 'Merci, votre demande est', accent: 'bien enregistrée' } satisfies AccentText,
  lead: 'Un e-mail de confirmation vient de vous être envoyé. Notre équipe revient vers vous par téléphone ou par e-mail pour confirmer votre rendez-vous.',
  nextSteps: [
    {
      title: 'Nous examinons votre demande',
      text: 'Votre demande est enregistrée et transmise à notre équipe.',
    },
    { title: 'Nous confirmons le créneau', text: 'Un conseiller vous contacte par téléphone ou par e-mail.' },
    { title: 'Nous préparons la suite', text: 'Ensemble, nous organisons votre accompagnement.' },
  ],
  readMore: { eyebrow: 'En attendant notre appel', title: 'À lire pour préparer votre séjour' },
} as const;

export const CONTACT_CONTENT = {
  seo: {
    title: 'Contact',
    description:
      'Contactez LASISTANT.PRO par téléphone, par e-mail ou via le formulaire : assistance médicale, logement et accompagnement en Tunisie.',
  },
  hero: {
    eyebrow: 'Contact',
    title: { start: 'Parlons de', accent: 'votre projet', end: 'de séjour' } satisfies AccentText,
    lead: 'Une question, un besoin d’accompagnement ou un projet de partenariat ? Notre équipe vous répond par téléphone, par e-mail ou via le formulaire.',
  },
  formTitle: 'Envoyez-nous un message',
  map: {
    pendingText: 'Carte et itinéraire affichés une fois l’adresse complète validée.',
    consentText: 'La carte interactive s’affiche si vous acceptez les contenus tiers.',
  },
  partners: {
    title: 'Professionnels & partenaires',
    text: 'Agence immobilière, propriétaire, responsable de résidence ou professionnel : contactez-nous pour collaborer ou nous orienter des personnes à accompagner.',
    cta: 'Proposer un partenariat',
  },
} as const;

export const ARTICLES_CONTENT = {
  seo: {
    title: 'Espace infos : conseils pratiques et actualités',
    description:
      'Publications utiles, conseils pratiques, actualités et informations liées aux services de LASISTANT.PRO.',
  },
  hero: {
    eyebrow: 'Espace infos',
    title: { start: 'Conseils pratiques &', accent: 'actualités' } satisfies AccentText,
    lead: 'Publications utiles, conseils pratiques, actualités et informations liées à nos services.',
  },
  pageSize: 6,
  help: {
    title: 'Votre question n’est pas traitée ici ?',
    text: 'Consultez notre FAQ ou posez-nous directement votre question.',
  },
  /** Page d'un article */
  article: {
    inlineCta: {
      title: 'Besoin d’aide pour préparer votre séjour ?',
      text: 'Réservez un échange de 1 h, par e-mail ou par téléphone.',
      label: 'Demander un accompagnement',
    },
    aside: {
      title: 'Un accompagnement personnalisé pour votre séjour',
      text: 'Étude du dossier, orientation, logement, accueil.',
      label: 'Réserver un échange',
    },
    disclaimer: 'Cet article est fourni à titre informatif. Il ne remplace pas un avis médical.',
    related: { eyebrow: 'À lire aussi', title: 'Articles liés', linkLabel: 'Tout l’Espace infos' },
  },
} as const;

export const FAQ_CONTENT = {
  seo: {
    title: 'Questions fréquentes',
    description:
      'Assistance médicale, logement, accompagnement, réservation : les réponses aux questions fréquentes.',
  },
  hero: {
    eyebrow: 'FAQ',
    title: { start: 'Les réponses à', accent: 'vos questions' } satisfies AccentText,
    lead: 'Assistance médicale, logement, accompagnement, réservation : retrouvez l’essentiel avant de nous contacter.',
  },
  allLabel: 'Toutes les questions',
  help: {
    title: 'Vous ne trouvez pas votre réponse ?',
    text: 'Notre équipe vous répond par téléphone ou par e-mail.',
  },
} as const;

export const COOKIES_PAGE_CONTENT = {
  seo: {
    title: 'Gestion des cookies',
    description: 'Choisissez à tout moment les cookies que vous acceptez sur le site LASISTANT.PRO.',
  },
  hero: {
    eyebrow: 'Confidentialité',
    title: { start: 'Gestion des', accent: 'cookies' } satisfies AccentText,
    lead: 'Choisissez à tout moment les cookies que vous acceptez. Vos choix s’appliquent à ce navigateur et à cet appareil.',
  },
  faq: COOKIE_FAQ,
} as const;

export const SITEMAP_CONTENT = {
  seo: { title: 'Plan du site', description: 'Toutes les pages du site LASISTANT.PRO.' },
  hero: {
    eyebrow: 'Navigation',
    title: 'Plan du site',
    lead: 'Toutes les pages de LASISTANT.PRO, en un coup d’œil.',
  },
  technical: {
    title: 'Plan pour les moteurs de recherche',
    text: 'Un fichier sitemap.xml est généré à chaque publication et déclaré dans robots.txt.',
  },
} as const;

export const SYSTEM_PAGES_CONTENT = {
  notFound: {
    seo: { title: 'Page introuvable', description: 'Cette page est introuvable.' },
    code: '404',
    title: 'Cette page est introuvable',
    lead: 'Le lien est peut-être erroné ou la page a été déplacée. Voici quelques pistes pour retrouver votre chemin.',
  },
  serverError: {
    seo: { title: 'Erreur technique', description: 'Un problème technique est survenu.' },
    code: '500',
    title: 'Un problème technique est survenu',
    lead: 'Ce n’est pas de votre faute. Notre équipe a été prévenue automatiquement. Réessayez dans quelques instants ou contactez-nous directement.',
    urgentTitle: 'Votre demande est urgente ?',
    urgentText:
      'Notre équipe reste joignable par téléphone et par e-mail, même pendant un incident technique.',
  },
  maintenance: {
    seo: { title: 'Maintenance en cours', description: 'Le site est momentanément indisponible.' },
    eyebrow: 'Maintenance programmée',
    title: { start: 'Nous préparons', accent: 'la suite' } satisfies AccentText,
    contactTitle: 'Besoin de nous joindre maintenant ?',
    contactText: 'Notre équipe reste disponible.',
  },
  offline: {
    seo: { title: 'Hors connexion', description: 'Vous êtes hors connexion.' },
    title: { start: 'Vous êtes', accent: 'hors connexion' } satisfies AccentText,
    lead: 'Impossible de charger la page pour le moment. Vérifiez votre connexion Internet puis réessayez. Les informations déjà saisies dans un formulaire restent enregistrées sur cet appareil.',
    tips: [
      'Vérifiez que le Wi-Fi ou les données mobiles sont activés',
      'Désactivez le mode avion si nécessaire',
      'Rechargez la page une fois la connexion rétablie',
    ],
    callHint: 'Un appel téléphonique fonctionne même sans connexion Internet.',
  },
} as const;
