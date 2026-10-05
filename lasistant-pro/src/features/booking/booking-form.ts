import { useFormContext } from 'react-hook-form';
import type { z } from 'zod';
import { STAY_DURATIONS } from '@/content/labels';
import type { bookingSchema, BookingFormValues } from '@/lib/validation/public-forms';

/**
 * Modèle du formulaire de réservation, partagé par l'assistant et ses étapes.
 */

/** Valeurs saisies (avant validation). */
export type BookingFormInput = z.input<typeof bookingSchema>;

export const BOOKING_DEFAULT_VALUES: BookingFormInput = {
  serviceId: '',
  date: '',
  time: '',
  contactPreference: 'telephone',
  fullName: '',
  phoneCountry: '+216',
  phoneNumber: '',
  email: '',
  country: '',
  profile: 'patient',
  arrivalDate: '',
  stayDuration: STAY_DURATIONS[0],
  message: '',
  attachmentName: '',
  consent: false,
  sendCopy: true,
  website: '',
};

/** Libellés utilisés par le résumé des erreurs. */
export const BOOKING_FIELD_LABELS = {
  serviceId: 'Service',
  date: 'Date',
  time: 'Heure',
  contactPreference: 'Contact préféré',
  fullName: 'Nom complet',
  phoneNumber: 'Téléphone',
  email: 'E-mail',
  profile: 'Profil',
  message: 'Message',
  consent: 'Consentement',
} as const;

/** Accès au formulaire depuis une étape. */
export function useBookingForm() {
  return useFormContext<BookingFormInput, unknown, BookingFormValues>();
}
