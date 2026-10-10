import type { BookingInput, BookingSource } from '@/types';

/**
 * Construction des demandes envoyées depuis les formulaires publics.
 * Toutes les demandes (réservation, logement, demande rapide, contact) partagent
 * la même structure : chaque formulaire ne renseigne que les champs qui le concernent.
 */

type RequiredFields = Pick<BookingInput, 'fullName' | 'email'>;

export function createRequestInput(
  source: BookingSource,
  fields: RequiredFields & Partial<Omit<BookingInput, 'source'>>,
): BookingInput {
  return {
    source,
    serviceId: null,
    subject: null,
    phone: null,
    country: null,
    profile: null,
    requestedDate: null,
    requestedTime: null,
    contactPreference: null,
    arrivalDate: null,
    stayDuration: null,
    message: null,
    housing: null,
    attachmentName: null,
    attachmentPath: null,
    ...fields,
  };
}

/** Texte libre facultatif : une saisie vide est enregistrée comme « null ». */
export function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

/** Numéro complet à partir de l'indicatif et du numéro local : « +216 54 479 391 ». */
export function joinPhone(countryCode: string, localNumber: string): string {
  return `${countryCode} ${localNumber.trim()}`;
}

/** Valeur du choix « Je ne sais pas encore » dans les listes de services. */
export const UNDECIDED_SERVICE = 'a-definir';
