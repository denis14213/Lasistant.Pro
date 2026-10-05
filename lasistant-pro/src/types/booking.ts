/**
 * Demandes et réservations (table « bookings » du cahier des charges).
 * Une même entité regroupe les réservations d'échange, les recherches de logement,
 * les demandes rapides et les messages de contact : le back-office les traite au même endroit.
 */

export type BookingStatus = 'nouveau' | 'en_cours' | 'en_attente' | 'confirme' | 'cloture' | 'annule';

export type BookingSource = 'reservation' | 'logement' | 'demande_rapide' | 'contact';

export type ApplicantProfile =
  'patient' | 'proche' | 'etudiant' | 'personne_agee' | 'professionnel' | 'autre';

export type ContactPreference = 'telephone' | 'email' | 'whatsapp';

export type HousingType = 'indifferent' | 'appartement' | 'studio' | 'chambre' | 'colocation';

export type BudgetPeriod = 'mois' | 'semaine' | 'nuit';

/** Critères d'une recherche de logement. */
export interface HousingCriteria {
  zone: string;
  arrivalDate: string;
  departureDate: string | null;
  housingType: HousingType;
  persons: number;
  budgetAmount: number | null;
  budgetCurrency: 'TND' | 'EUR';
  budgetPeriod: BudgetPeriod;
  needs: string | null;
}

export interface Booking {
  id: string;
  /** Référence communiquée au demandeur (ex. « LP-2026-0148 ») */
  reference: string;
  source: BookingSource;
  serviceId: string | null;
  /** Objet du message (formulaire de contact) */
  subject: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  profile: ApplicantProfile | null;
  /** Créneau souhaité : date « AAAA-MM-JJ » et heure « HH:MM » (heure de Tunisie) */
  requestedDate: string | null;
  requestedTime: string | null;
  contactPreference: ContactPreference | null;
  arrivalDate: string | null;
  stayDuration: string | null;
  message: string | null;
  housing: HousingCriteria | null;
  attachmentName: string | null;
  status: BookingStatus;
  assigneeId: string | null;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingEventType =
  | 'received'
  | 'email_sent'
  | 'notification_sent'
  | 'viewed'
  | 'status_changed'
  | 'assigned'
  | 'reply_sent'
  | 'note_added';

/** Entrée de l'historique d'une demande (journal des demandes). */
export interface BookingEvent {
  id: string;
  bookingId: string;
  type: BookingEventType;
  label: string;
  actor: string | null;
  createdAt: string;
}

/** Note interne, visible uniquement par l'équipe. */
export interface InternalNote {
  id: string;
  bookingId: string;
  author: string;
  text: string;
  createdAt: string;
}

/** Données saisies par un visiteur pour créer une demande. */
export type BookingInput = Omit<
  Booking,
  'id' | 'reference' | 'status' | 'assigneeId' | 'createdAt' | 'updatedAt' | 'consentAt'
>;
