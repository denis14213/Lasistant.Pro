import { z } from 'zod';
import {
  consentSchema,
  emailSchema,
  fullNameSchema,
  honeypotSchema,
  internationalPhoneSchema,
  optionalInternationalPhoneSchema,
  optionalMessageSchema,
  phoneNumberSchema,
} from './common';

/**
 * Schémas des formulaires publics : réservation, demande rapide, recherche de logement, contact.
 */

/* ------------------------------------------------------------------ Réservation */

export const bookingSchema = z.object({
  serviceId: z.string().min(1, { error: 'Choisissez le service qui vous intéresse.' }),
  date: z.string().min(1, { error: 'Choisissez une date dans le calendrier.' }),
  time: z.string().min(1, { error: 'Choisissez un créneau horaire.' }),
  contactPreference: z.enum(['telephone', 'email', 'whatsapp'], {
    error: 'Indiquez comment vous préférez être contacté(e).',
  }),
  fullName: fullNameSchema,
  phoneCountry: z.string().min(1, { error: 'Choisissez un indicatif.' }),
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  country: z.string(),
  profile: z.enum(['patient', 'proche', 'etudiant', 'autre'], { error: 'Indiquez votre profil.' }),
  arrivalDate: z.string(),
  stayDuration: z.string(),
  message: optionalMessageSchema(1500),
  attachmentName: z.string(),
  consent: consentSchema,
  sendCopy: z.boolean(),
  website: honeypotSchema,
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

/** Champs validés à chaque étape du parcours de réservation. */
export const BOOKING_STEP_FIELDS = {
  service: ['serviceId'],
  schedule: ['date', 'time', 'contactPreference'],
  contact: ['fullName', 'phoneCountry', 'phoneNumber', 'email', 'country', 'profile'],
  details: ['arrivalDate', 'stayDuration', 'message', 'attachmentName'],
  review: ['consent'],
} as const satisfies Record<string, ReadonlyArray<keyof BookingFormValues>>;

export type BookingStepId = keyof typeof BOOKING_STEP_FIELDS;

/* ------------------------------------------------------------- Demande rapide */

export const quickRequestSchema = z.object({
  fullName: fullNameSchema,
  phone: internationalPhoneSchema,
  email: emailSchema,
  serviceId: z.string().min(1, { error: 'Choisissez un service.' }),
  message: optionalMessageSchema(800),
  consent: consentSchema,
  website: honeypotSchema,
});

export type QuickRequestValues = z.infer<typeof quickRequestSchema>;

/* -------------------------------------------------------- Recherche de logement */

export const housingSearchSchema = z
  .object({
    profile: z.enum(['patient', 'etudiant', 'proche', 'autre'], { error: 'Indiquez votre profil.' }),
    zone: z.string().trim().min(2, { error: 'Indiquez la ville ou la zone souhaitée.' }),
    arrivalDate: z.string().min(1, { error: "Indiquez votre date d'arrivée." }),
    departureDate: z.string(),
    housingType: z.enum(['indifferent', 'appartement', 'studio', 'chambre', 'colocation']),
    persons: z.number().int().min(1).max(10, { error: '10 personnes maximum par demande.' }),
    budgetAmount: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d{1,7}$/.test(value), {
        error: 'Indiquez un montant en chiffres.',
      }),
    budgetCurrency: z.enum(['TND', 'EUR']),
    budgetPeriod: z.enum(['mois', 'semaine', 'nuit']),
    needs: optionalMessageSchema(1000),
    fullName: fullNameSchema,
    phoneCountry: z.string().min(1),
    phoneNumber: phoneNumberSchema,
    email: emailSchema,
    consent: consentSchema,
    website: honeypotSchema,
  })
  .refine((values) => !values.departureDate || values.departureDate >= values.arrivalDate, {
    error: "La date de départ doit être postérieure à la date d'arrivée.",
    path: ['departureDate'],
  });

export type HousingSearchValues = z.infer<typeof housingSearchSchema>;

/* -------------------------------------------------------------------- Contact */

export const contactSchema = z.object({
  subject: z.enum(['information', 'accompagnement', 'partenariat', 'autre']),
  fullName: fullNameSchema,
  email: emailSchema,
  phone: optionalInternationalPhoneSchema,
  profile: z.string(),
  message: z
    .string()
    .trim()
    .min(10, { error: 'Décrivez votre demande en quelques mots (10 caractères minimum).' })
    .max(2000, { error: 'Votre message ne doit pas dépasser 2 000 caractères.' }),
  consent: consentSchema,
  website: honeypotSchema,
});

export type ContactValues = z.infer<typeof contactSchema>;
