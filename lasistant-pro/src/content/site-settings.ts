import { isoDaysAgo } from '@/lib/dates';
import type { SiteSettings } from '@/types';

/**
 * Réglages initiaux du site : coordonnées reprises du site actuel.
 * Une valeur « null » signale une information à fournir par le propriétaire :
 * l'interface affiche alors automatiquement la mention « à valider ».
 */
export function createSiteSettingsSeed(now = new Date()): SiteSettings {
  return {
    brandName: 'LASISTANT.PRO',
    tagline: 'Soutien Médical et Hébergement',
    description:
      'Service social d’assistance médicale, d’accompagnement et de recherche de logement en Tunisie, avec une approche humaine et personnalisée.',
    phones: [
      { id: 'tel-principal', label: 'Tunisie', value: '+216 54 479 391', active: true },
      { id: 'tel-secondaire', label: 'Tunisie', value: '+216 25 393 214', active: true },
      { id: 'tel-gabon', label: 'Gabon', value: '+241 07 63 03 39', active: true },
    ],
    emails: [
      {
        id: 'mail-principal',
        label: 'Principal',
        value: 'imassist.service@hotmail.com',
        active: true,
        receivesNotifications: true,
      },
      { id: 'mail-secondaire', label: 'Secondaire', value: 'moryendi@gmail.com', active: true },
    ],
    address: {
      street: 'Avenue Habib Thamer',
      postalCode: null,
      city: null,
      country: 'Tunisie',
      validated: false,
    },
    openingHours: null,
    facebook: { label: 'imassist Tant', url: null },
    // Numéro principal utilisé pour WhatsApp en attendant la confirmation de l'agence.
    whatsapp: { enabled: true, number: '+216 54 479 391' },
    booking: {
      enabled: true,
      durationMinutes: 60,
      openDays: [1, 2, 3, 4, 5, 6],
      ranges: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ],
      minNoticeHours: 24,
      horizonDays: 60,
      closures: [],
    },
    seo: {
      homeTitle: 'LASISTANT.PRO · Soutien médical et hébergement en Tunisie',
      titleTemplate: '%s | LASISTANT.PRO',
      defaultDescription:
        'Assistance médicale, logement et accompagnement des malades en Tunisie. Un service social humain et personnalisé pour patients, familles et étudiants.',
      shareImage: '/og-image.jpg',
      structuredData: true,
      robotsTxt: 'User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: https://lasistant.pro/sitemap.xml',
    },
    analytics: {
      enabled: false,
      provider: null,
      siteId: null,
      requireConsent: true,
      trackConversions: false,
    },
    maintenance: {
      enabled: false,
      message:
        'Le site LASISTANT.PRO est momentanément indisponible pour une opération de maintenance. Nous revenons très vite.',
      returnAt: null,
    },
    backups: {
      lastBackupAt: isoDaysAgo(0, '03:00', now),
      frequency: 'Quotidienne',
      retentionDays: 30,
    },
    legal: {
      companyName: null,
      legalForm: null,
      taxId: null,
      registryNumber: null,
      publicationDirector: null,
      host: null,
      lastUpdated: null,
    },
    updatedAt: isoDaysAgo(4, '16:05', now),
    updatedBy: 'Admin LASISTANT',
  };
}
