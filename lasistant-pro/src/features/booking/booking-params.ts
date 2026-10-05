import { ROUTES } from '@/config/routes';
import type { BookingFormValues } from '@/lib/validation/public-forms';

/**
 * Paramètres d'adresse de la réservation en ligne.
 * Ils permettent d'arriver sur le formulaire avec un service, un profil ou une date
 * déjà choisis (depuis l'accueil, une page de service ou un lien partagé).
 */

export const BOOKING_PROFILES = ['patient', 'proche', 'etudiant', 'autre'] as const satisfies ReadonlyArray<
  BookingFormValues['profile']
>;

const PARAMS = { service: 'service', profile: 'profil', arrival: 'arrivee' } as const;

export interface BookingPrefill {
  serviceId?: string;
  profile?: BookingFormValues['profile'];
  arrivalDate?: string;
}

/** Adresse de la réservation pré-remplie. */
export function buildBookingSearch({ serviceId, profile, arrivalDate }: BookingPrefill): string {
  const params = new URLSearchParams();
  if (serviceId) params.set(PARAMS.service, serviceId);
  if (profile) params.set(PARAMS.profile, profile);
  if (arrivalDate) params.set(PARAMS.arrival, arrivalDate);
  const query = params.toString();
  return query ? `${ROUTES.booking}?${query}` : ROUTES.booking;
}

const isProfile = (value: string | null): value is BookingFormValues['profile'] =>
  value !== null && (BOOKING_PROFILES as readonly string[]).includes(value);

const isIsoDate = (value: string | null): value is string =>
  value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Lecture des valeurs pré-remplies (les valeurs inconnues sont ignorées). */
export function readBookingPrefill(params: URLSearchParams): BookingPrefill {
  const profile = params.get(PARAMS.profile);
  const arrival = params.get(PARAMS.arrival);
  return {
    serviceId: params.get(PARAMS.service) ?? undefined,
    profile: isProfile(profile) ? profile : undefined,
    arrivalDate: isIsoDate(arrival) ? arrival : undefined,
  };
}
