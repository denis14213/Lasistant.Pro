/**
 * Chemins du site, centralisés : aucun lien n'est écrit en dur dans les composants.
 * Les URL sont en français, stables et lisibles (cahier des charges, § 11.1).
 */
export const ROUTES = {
  home: '/',
  services: '/services',
  medicalAssistance: '/services/assistance-medicale',
  housing: '/services/logement-hebergement',
  patientSupport: '/services/accompagnement-des-malades',
  about: '/a-propos',
  booking: '/reservation',
  bookingConfirmation: '/reservation/confirmation',
  articles: '/espace-infos',
  article: (slug: string) => `/espace-infos/${slug}`,
  contact: '/contact',
  faq: '/faq',
  legalNotice: '/mentions-legales',
  privacy: '/politique-de-confidentialite',
  cookies: '/gestion-des-cookies',
  sitemap: '/plan-du-site',
  maintenance: '/maintenance',
  offline: '/hors-connexion',

  admin: {
    dashboard: '/admin',
    login: '/admin/connexion',
    forgotPassword: '/admin/mot-de-passe-oublie',
    forgotPasswordSent: '/admin/mot-de-passe-oublie/envoye',
    resetPassword: '/admin/reinitialiser-mot-de-passe',
    twoFactor: '/admin/verification',
    sessionExpired: '/admin/session-expiree',
    linkExpired: '/admin/lien-expire',
    locked: '/admin/compte-verrouille',
    requests: '/admin/demandes',
    request: (id: string) => `/admin/demandes/${id}`,
    agenda: '/admin/agenda',
    services: '/admin/services',
    articles: '/admin/articles',
    articleNew: '/admin/articles/nouveau',
    articleEdit: (id: string) => `/admin/articles/${id}`,
    media: '/admin/medias',
    pages: '/admin/pages',
    page: (key: string) => `/admin/pages/${key}`,
    settings: '/admin/reglages',
    seo: '/admin/reglages/seo',
    legal: '/admin/reglages/mentions-legales',
    users: '/admin/utilisateurs',
    emails: '/admin/emails',
    emailPreview: (key: string) => `/admin/emails/${key}/apercu`,
    account: '/admin/compte',
  },
} as const;

/** Page d'un service à partir de son identifiant d'URL. */
export function servicePath(slug: string): string {
  return `${ROUTES.services}/${slug}`;
}

/** Chemin de réservation présélectionnant un service. */
export function bookingFor(serviceId: string): string {
  return `${ROUTES.booking}?service=${encodeURIComponent(serviceId)}`;
}

/** Paramètres de la page de confirmation : référence et clé secrète de la demande. */
export const CONFIRMATION_PARAMS = { reference: 'ref', key: 'cle' } as const;

/** Page de confirmation d'une demande (la clé empêche de consulter la demande d'un tiers). */
export function confirmationPath(booking: { reference: string; confirmationKey: string }): string {
  const params = new URLSearchParams({
    [CONFIRMATION_PARAMS.reference]: booking.reference,
    [CONFIRMATION_PARAMS.key]: booking.confirmationKey,
  });
  return `${ROUTES.bookingConfirmation}?${params.toString()}`;
}
