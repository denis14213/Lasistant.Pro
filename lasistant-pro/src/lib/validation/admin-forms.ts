import { z } from 'zod';
import {
  emailSchema,
  fullNameSchema,
  optionalInternationalPhoneSchema,
  optionalMessageSchema,
} from './common';

/**
 * Schémas des formulaires du back-office et de l'authentification.
 */

/* ---------------------------------------------------------- Authentification */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Indiquez votre mot de passe.' }),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Règles de robustesse affichées en direct sous le champ mot de passe. */
export const PASSWORD_RULES = [
  { id: 'length', label: '12 caractères minimum', test: (value: string) => value.length >= 12 },
  { id: 'upper', label: 'Une majuscule', test: (value: string) => /[A-ZÀ-Ý]/.test(value) },
  { id: 'digit', label: 'Un chiffre', test: (value: string) => /\d/.test(value) },
  { id: 'special', label: 'Un caractère spécial', test: (value: string) => /[^A-Za-z0-9À-ÿ]/.test(value) },
] as const;

export const strongPasswordSchema = z
  .string()
  .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
    error: 'Le mot de passe ne respecte pas toutes les règles de sécurité.',
  });

export const resetPasswordSchema = z
  .object({ password: strongPasswordSchema, confirmation: z.string() })
  .refine((values) => values.password === values.confirmation, {
    error: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, { error: 'Le code contient 6 chiffres.' }),
  trustDevice: z.boolean(),
});
export type TwoFactorValues = z.infer<typeof twoFactorSchema>;

/* --------------------------------------------------------------- Coordonnées */

const contactEntrySchema = z.object({
  id: z.string(),
  label: z.string().trim().min(1, { error: 'Indiquez un libellé.' }),
  value: z.string().trim().min(1, { error: 'Ce champ est obligatoire.' }),
  active: z.boolean(),
  receivesNotifications: z.boolean().optional(),
});

export const identitySettingsSchema = z.object({
  brandName: z.string().trim().min(2, { error: 'Indiquez le nom de la marque.' }),
  tagline: z.string().trim().min(2, { error: "Indiquez l'accroche." }),
  phones: z.array(contactEntrySchema).min(1, { error: 'Au moins un numéro est nécessaire.' }),
  emails: z
    .array(contactEntrySchema.extend({ value: emailSchema }))
    .min(1, { error: 'Au moins une adresse est nécessaire.' }),
  street: z.string().trim().min(2, { error: 'Indiquez la rue.' }),
  postalCode: z.string().trim(),
  city: z.string().trim(),
  openingHours: z.string().trim(),
  facebookUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || /^https:\/\/(www\.)?facebook\.com\/.+/.test(value), {
      error: 'Saisissez l’adresse complète de la page, par exemple https://www.facebook.com/…',
    }),
  /** L'adresse complète a été vérifiée : la carte peut être affichée */
  addressValidated: z.boolean(),
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().trim(),
});
export type IdentitySettingsValues = z.infer<typeof identitySettingsSchema>;

/* ------------------------------------------------------------ Mentions légales */

export const legalSettingsSchema = z.object({
  companyName: z.string().trim(),
  legalForm: z.string().trim(),
  taxId: z.string().trim(),
  registryNumber: z.string().trim(),
  publicationDirector: z.string().trim(),
  host: z.string().trim(),
  lastUpdated: z.string(),
});
export type LegalSettingsValues = z.infer<typeof legalSettingsSchema>;

/* -------------------------------------------------------------------- SEO */

export const seoSettingsSchema = z.object({
  homeTitle: z.string().trim().min(10).max(60, { error: '60 caractères maximum pour un affichage complet.' }),
  titleTemplate: z
    .string()
    .trim()
    .refine((value) => value.includes('%s'), { error: 'Le modèle doit contenir « %s » (titre de la page).' }),
  defaultDescription: z
    .string()
    .trim()
    .min(50, { error: '50 caractères minimum.' })
    .max(160, { error: '160 caractères maximum.' }),
  structuredData: z.boolean(),
  robotsTxt: z.string(),
  analyticsEnabled: z.boolean(),
  analyticsProvider: z.string(),
  analyticsSiteId: z.string(),
  trackConversions: z.boolean(),
  maintenanceEnabled: z.boolean(),
  maintenanceMessage: z.string().trim().min(10, { error: 'Rédigez un message pour les visiteurs.' }),
  maintenanceReturnAt: z.string(),
});
export type SeoSettingsValues = z.infer<typeof seoSettingsSchema>;

/* ------------------------------------------------------------ Demandes (équipe) */

/** Demande reçue hors du site (téléphone, e-mail, rendez-vous) et saisie par l'équipe. */
export const manualRequestSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: optionalInternationalPhoneSchema,
  source: z.enum(['reservation', 'logement', 'demande_rapide', 'contact']),
  serviceId: z.string(),
  message: optionalMessageSchema(1500),
  /** Rendez-vous déjà convenu (saisie depuis l'agenda) */
  date: z.string(),
  time: z.string(),
});
export type ManualRequestValues = z.infer<typeof manualRequestSchema>;

/* -------------------------------------------------------------- Disponibilités */

export const availabilitySchema = z.object({
  enabled: z.boolean(),
  durationMinutes: z.number().int().min(15).max(180),
  openDays: z.array(z.number().int().min(1).max(7)).min(1, { error: 'Ouvrez au moins un jour.' }),
  ranges: z
    .array(
      z.object({ start: z.string(), end: z.string() }).refine((range) => range.end > range.start, {
        error: 'La fin doit être après le début.',
        path: ['end'],
      }),
    )
    .min(1, { error: 'Ajoutez au moins une plage horaire.' }),
  minNoticeHours: z.number().int().min(0),
  horizonDays: z.number().int().min(7),
  /** Jours de fermeture exceptionnelle (« AAAA-MM-JJ ») */
  closures: z.array(z.string()),
});
export type AvailabilityValues = z.infer<typeof availabilitySchema>;

/* -------------------------------------------------------------------- Services */

export const serviceEditorSchema = z.object({
  title: z.string().trim().min(3, { error: 'Indiquez le titre du service.' }),
  subtitle: z.string().trim().min(3, { error: 'Indiquez un sous-titre.' }),
  summary: z.string().trim().min(20, { error: 'Rédigez une description (20 caractères minimum).' }),
  icon: z.string(),
  image: z.string().min(1, { error: 'Choisissez une image.' }),
  imageAlt: z.string().trim().min(5, { error: "Décrivez l'image pour les personnes qui ne la voient pas." }),
  ctaLabel: z.string().trim().min(3, { error: 'Indiquez le libellé du bouton.' }),
  ctaHref: z.string().trim().startsWith('/', { error: 'Le lien doit commencer par « / ».' }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: 'Minuscules, chiffres et tirets uniquement.' }),
  seoTitle: z.string().trim().max(60, { error: '60 caractères maximum.' }),
  seoDescription: z.string().trim().max(160, { error: '160 caractères maximum.' }),
  active: z.boolean(),
});
export type ServiceEditorValues = z.infer<typeof serviceEditorSchema>;

/* -------------------------------------------------------------------- Articles */

export const articleEditorSchema = z.object({
  title: z.string().trim().min(8, { error: 'Le titre doit contenir au moins 8 caractères.' }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: 'Minuscules, chiffres et tirets uniquement.' }),
  body: z.string().trim().min(50, { error: 'Le contenu doit contenir au moins 50 caractères.' }),
  excerpt: z
    .string()
    .trim()
    .min(30, { error: '30 caractères minimum.' })
    .max(160, { error: '160 caractères maximum.' }),
  categoryId: z.string().min(1, { error: 'Choisissez une catégorie.' }),
  status: z.enum(['brouillon', 'publie', 'archive']),
  coverImage: z.string().min(1),
  coverAlt: z.string().trim().min(5, { error: "Décrivez l'image pour les personnes qui ne la voient pas." }),
  seoTitle: z.string().trim().max(60, { error: '60 caractères maximum.' }),
  seoDescription: z.string().trim().max(160, { error: '160 caractères maximum.' }),
  useCoverForSharing: z.boolean(),
});
export type ArticleEditorValues = z.infer<typeof articleEditorSchema>;

/* -------------------------------------------------------------- Utilisateurs */

export const inviteUserSchema = z.object({
  email: emailSchema.refine((value) => value.endsWith('@lasistant.pro'), {
    error: 'Utilisez une adresse professionnelle @lasistant.pro.',
  }),
  role: z.enum(['administrateur', 'editeur', 'operateur']),
});
export type InviteUserValues = z.infer<typeof inviteUserSchema>;

/* ------------------------------------------------------------ Modèles d'e-mails */

export const emailTemplateSchema = z.object({
  /** Modifiable uniquement pour les réponses standards créées par l'équipe */
  name: z
    .string()
    .trim()
    .min(3, { error: 'Donnez un nom au modèle (3 caractères minimum).' })
    .max(60, { error: '60 caractères maximum.' }),
  senderName: z.string().trim().min(2, { error: "Indiquez le nom de l'expéditeur." }),
  replyTo: emailSchema,
  subject: z
    .string()
    .trim()
    .min(5, { error: "Indiquez l'objet du message." })
    .max(140, { error: '140 caractères maximum.' }),
  heading: z.string().trim().max(120, { error: '120 caractères maximum.' }),
  body: z.string().trim().min(20, { error: 'Le message doit contenir au moins 20 caractères.' }),
  active: z.boolean(),
});
export type EmailTemplateValues = z.infer<typeof emailTemplateSchema>;

export const newEmailTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: 'Donnez un nom au modèle (3 caractères minimum).' })
    .max(60, { error: '60 caractères maximum.' }),
});
export type NewEmailTemplateValues = z.infer<typeof newEmailTemplateSchema>;

/* ------------------------------------------------------------------ Mon compte */

export const profileSchema = z.object({ name: fullNameSchema, email: emailSchema });
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, { error: 'Indiquez votre mot de passe actuel.' }),
    password: strongPasswordSchema,
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    error: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
