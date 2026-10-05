import { z } from 'zod';

/**
 * Règles de validation partagées par tous les formulaires.
 * Les mêmes schémas pourront être réutilisés côté serveur (validation client + serveur,
 * cahier des charges § 10.1). Les messages sont rédigés pour le visiteur : précis et bienveillants.
 */

export const MESSAGES = {
  required: 'Ce champ est obligatoire.',
  email: 'Saisissez une adresse e-mail valide, par exemple nom@domaine.com.',
  emailMissing: 'Indiquez votre adresse e-mail.',
  fullName: 'Indiquez votre prénom et votre nom.',
  phoneMissing: 'Indiquez votre numéro de téléphone.',
  phoneInvalid: 'Saisissez un numéro valide (6 à 14 chiffres).',
  phoneInternational: "Indiquez le numéro complet avec l'indicatif, par exemple +216 54 479 391.",
  consent: "Merci d'accepter la politique de confidentialité pour envoyer votre demande.",
} as const;

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { error: MESSAGES.fullName })
  .max(120, { error: 'Le nom ne doit pas dépasser 120 caractères.' });

export const emailSchema = z
  .string()
  .trim()
  .min(1, { error: MESSAGES.emailMissing })
  .pipe(z.email({ error: MESSAGES.email }));

/** Numéro local saisi à côté du sélecteur d'indicatif. */
export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, { error: MESSAGES.phoneMissing })
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 6 && digits.length <= 14;
    },
    { error: MESSAGES.phoneInvalid },
  );

/** Numéro complet avec indicatif (« +216 … » ou « 00216 … »). */
export const internationalPhoneSchema = z
  .string()
  .trim()
  .min(1, { error: MESSAGES.phoneMissing })
  .refine((value) => /^(\+|00)[\d\s().-]{7,20}$/.test(value), { error: MESSAGES.phoneInternational });

/** Variante facultative : vide accepté, sinon le format international est exigé. */
export const optionalInternationalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^(\+|00)[\d\s().-]{7,20}$/.test(value), {
    error: MESSAGES.phoneInternational,
  });

export const consentSchema = z.boolean().refine((value) => value, { error: MESSAGES.consent });

/** Champ piège invisible : un robot le remplit, un humain jamais (protection anti-spam). */
export const honeypotSchema = z.string().optional();

/** Message libre facultatif, limité pour éviter les abus. */
export const optionalMessageSchema = (max = 1500) =>
  z
    .string()
    .trim()
    .max(max, { error: `Votre message ne doit pas dépasser ${max.toLocaleString('fr-FR')} caractères.` });

/** Indicatifs proposés dans les champs téléphone. */
export const PHONE_COUNTRY_CODES = [
  { value: '+216', label: '+216 TN' },
  { value: '+33', label: '+33 FR' },
  { value: '+225', label: '+225 CI' },
  { value: '+221', label: '+221 SN' },
  { value: '+237', label: '+237 CM' },
  { value: '+213', label: '+213 DZ' },
  { value: '+218', label: '+218 LY' },
  { value: '+223', label: '+223 ML' },
  { value: '+241', label: '+241 GA' },
  { value: '+212', label: '+212 MA' },
  { value: '+32', label: '+32 BE' },
  { value: '+41', label: '+41 CH' },
  { value: '+1', label: '+1 CA/US' },
] as const;
