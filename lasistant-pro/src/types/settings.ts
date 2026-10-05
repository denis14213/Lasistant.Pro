/**
 * Réglages du site (table « site_settings » et coordonnées « contacts »).
 * Une valeur « null » signifie « à fournir par le propriétaire » : l'interface
 * affiche alors automatiquement une mention « à valider ».
 */

export interface ContactEntry {
  id: string;
  label: string;
  value: string;
  active: boolean;
  /** Adresse qui reçoit les notifications de nouvelles demandes */
  receivesNotifications?: boolean;
}

export interface PostalAddress {
  street: string;
  postalCode: string | null;
  city: string | null;
  country: string;
  /** L'adresse complète a été vérifiée : la carte peut être affichée */
  validated: boolean;
}

export interface TimeRange {
  start: string;
  end: string;
}

/** Disponibilités proposées dans la réservation en ligne. */
export interface BookingAvailability {
  enabled: boolean;
  durationMinutes: number;
  /** Jours ouverts : 1 = lundi … 7 = dimanche */
  openDays: number[];
  ranges: TimeRange[];
  minNoticeHours: number;
  horizonDays: number;
  closures: string[];
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  description: string;
  phones: ContactEntry[];
  emails: ContactEntry[];
  address: PostalAddress;
  openingHours: string | null;
  facebook: { label: string; url: string | null };
  whatsapp: { enabled: boolean; number: string | null };
  booking: BookingAvailability;
  seo: {
    homeTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    shareImage: string;
    structuredData: boolean;
    robotsTxt: string;
  };
  analytics: {
    enabled: boolean;
    provider: string | null;
    siteId: string | null;
    requireConsent: true;
    trackConversions: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    returnAt: string | null;
  };
  backups: {
    lastBackupAt: string;
    frequency: string;
    retentionDays: number;
  };
  legal: {
    companyName: string | null;
    legalForm: string | null;
    taxId: string | null;
    registryNumber: string | null;
    publicationDirector: string | null;
    host: string | null;
    lastUpdated: string | null;
  };
  updatedAt: string;
  updatedBy: string;
}
