import type {
  ApplicantProfile,
  ArticleStatus,
  BookingSource,
  BookingStatus,
  BudgetPeriod,
  ContactPreference,
  HousingType,
  Tone,
} from '@/types';

/**
 * Libellés affichés pour les valeurs codées (statuts, profils, sources…).
 * Les valeurs techniques restent stables ; seuls ces libellés évoluent.
 */

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  en_attente: 'En attente',
  confirme: 'Confirmé',
  cloture: 'Clôturé',
  annule: 'Annulé',
};

/** Usage de chaque statut (cahier des charges § 8.4). */
export const BOOKING_STATUS_HINTS: Record<BookingStatus, string> = {
  nouveau: 'Demande reçue mais non examinée',
  en_cours: 'Demande prise en charge',
  en_attente: 'Informations complémentaires nécessaires',
  confirme: 'Rendez-vous ou service confirmé',
  cloture: 'Demande terminée',
  annule: 'Demande annulée',
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  'nouveau',
  'en_cours',
  'en_attente',
  'confirme',
  'cloture',
  'annule',
];

export const BOOKING_STATUS_TONES: Record<BookingStatus, Tone> = {
  nouveau: 'brand',
  en_cours: 'info',
  en_attente: 'warning',
  confirme: 'success',
  cloture: 'neutral',
  annule: 'danger',
};

export const PROFILE_LABELS: Record<ApplicantProfile, string> = {
  patient: 'Patient(e)',
  proche: 'Proche / famille',
  etudiant: 'Étudiant(e)',
  personne_agee: 'Personne âgée',
  professionnel: 'Professionnel / partenaire',
  autre: 'Autre',
};

export const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  telephone: 'Téléphone',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
};

/** Tournure insérée dans une phrase (« Nous vous contacterons par téléphone »). */
export const CONTACT_PREFERENCE_PHRASES: Record<ContactPreference, string> = {
  telephone: 'par téléphone',
  email: 'par e-mail',
  whatsapp: 'par WhatsApp',
};

export const SOURCE_LABELS: Record<BookingSource, string> = {
  reservation: 'Réservation',
  logement: 'Recherche de logement',
  demande_rapide: 'Demande rapide',
  contact: 'Message de contact',
};

/** Origine d'une demande, insérée dans une phrase (« Reçue via le formulaire de réservation »). */
export const SOURCE_PHRASES: Record<BookingSource, string> = {
  reservation: 'le formulaire de réservation',
  logement: 'le formulaire de recherche de logement',
  demande_rapide: 'la demande rapide de l’accueil',
  contact: 'le formulaire de contact',
};

export const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  indifferent: 'Indifférent',
  appartement: 'Appartement',
  studio: 'Studio',
  chambre: 'Chambre',
  colocation: 'Colocation',
};

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  mois: 'par mois',
  semaine: 'par semaine',
  nuit: 'par nuit',
};

export const CONTACT_SUBJECT_LABELS = {
  information: 'Demande d’information',
  accompagnement: 'Accompagnement',
  partenariat: 'Partenariat',
  autre: 'Autre',
} as const;

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  archive: 'Archivé',
};

export const STAY_DURATIONS = [
  'Je ne sais pas encore',
  'Moins d’une semaine',
  '1 à 4 semaines',
  '1 à 6 mois',
  'Plus de 6 mois',
] as const;

export const COUNTRIES = [
  'Tunisie',
  'Algérie',
  'Libye',
  'Maroc',
  'France',
  'Belgique',
  'Suisse',
  'Côte d’Ivoire',
  'Sénégal',
  'Mali',
  'Cameroun',
  'Gabon',
  'Autre pays',
] as const;
