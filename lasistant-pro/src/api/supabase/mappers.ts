import type {
  AdminUser,
  Article,
  Booking,
  BookingConfirmation,
  BookingEvent,
  BookingInput,
  Category,
  EmailTemplate,
  EmailTemplateKey,
  FaqCategory,
  FaqItem,
  HousingCriteria,
  IconName,
  InternalNote,
  MediaItem,
  NotificationPreferences,
  SeoFields,
  Service,
  ServiceAudience,
  SiteSettings,
} from '@/types';
import type { Json, Row, UpdateRow } from './database.types';

/**
 * Correspondance entre les lignes de la base (snake_case) et les types métier (camelCase).
 * Les colonnes JSONB sont validées par des contraintes `check` côté base ; leur forme
 * détaillée est garantie par les formulaires du back-office (schémas Zod).
 */

const asJson = <T>(value: Json): T => value as unknown as T;
const toJson = (value: unknown): Json => value as Json;

/** Retire les clés non définies d'un objet de mise à jour (PATCH partiel). */
function compact<T extends Record<string, unknown>>(row: T): Partial<T> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined)) as Partial<T>;
}

// ---------------------------------------------------------------------------
// Réglages du site
// ---------------------------------------------------------------------------
export function toSiteSettings(row: Row<'site_settings'>): SiteSettings {
  return {
    brandName: row.brand_name,
    tagline: row.tagline,
    description: row.description,
    phones: asJson(row.phones),
    emails: asJson(row.emails),
    address: asJson(row.address),
    openingHours: row.opening_hours,
    facebook: asJson(row.facebook),
    whatsapp: asJson(row.whatsapp),
    booking: asJson(row.booking),
    seo: asJson(row.seo),
    analytics: asJson(row.analytics),
    maintenance: asJson(row.maintenance),
    backups: asJson(row.backups),
    legal: asJson(row.legal),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function fromSiteSettingsPatch(patch: Partial<SiteSettings>): UpdateRow<'site_settings'> {
  return compact({
    brand_name: patch.brandName,
    tagline: patch.tagline,
    description: patch.description,
    phones: patch.phones && toJson(patch.phones),
    emails: patch.emails && toJson(patch.emails),
    address: patch.address && toJson(patch.address),
    opening_hours: patch.openingHours,
    facebook: patch.facebook && toJson(patch.facebook),
    whatsapp: patch.whatsapp && toJson(patch.whatsapp),
    booking: patch.booking && toJson(patch.booking),
    seo: patch.seo && toJson(patch.seo),
    analytics: patch.analytics && toJson(patch.analytics),
    maintenance: patch.maintenance && toJson(patch.maintenance),
    backups: patch.backups && toJson(patch.backups),
    legal: patch.legal && toJson(patch.legal),
  });
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export function toService(row: Row<'services'>): Service {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    description: row.description,
    highlights: row.highlights,
    details: row.details,
    audiences: asJson<ServiceAudience[]>(row.audiences),
    icon: row.icon as IconName,
    iconTone: row.icon_tone,
    image: row.image,
    imageAlt: row.image_alt,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    active: row.active,
    showInMenu: row.show_in_menu,
    showMedicalDisclaimer: row.show_medical_disclaimer,
    sortOrder: row.sort_order,
    seo: asJson<SeoFields>(row.seo),
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function fromServicePatch(patch: Partial<Service>): UpdateRow<'services'> {
  return compact({
    slug: patch.slug,
    kind: patch.kind,
    title: patch.title,
    subtitle: patch.subtitle,
    summary: patch.summary,
    description: patch.description,
    highlights: patch.highlights,
    details: patch.details,
    audiences: patch.audiences && toJson(patch.audiences),
    icon: patch.icon,
    icon_tone: patch.iconTone,
    image: patch.image,
    image_alt: patch.imageAlt,
    cta_label: patch.ctaLabel,
    cta_href: patch.ctaHref,
    active: patch.active,
    show_in_menu: patch.showInMenu,
    show_medical_disclaimer: patch.showMedicalDisclaimer,
    sort_order: patch.sortOrder,
    seo: patch.seo && toJson(patch.seo),
  });
}

// ---------------------------------------------------------------------------
// Espace infos
// ---------------------------------------------------------------------------
export function toCategory(row: Row<'categories'>): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    active: row.active,
    sortOrder: row.sort_order,
    tone: row.tone,
  };
}

export function toArticle(row: Row<'articles'>): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.cover_image,
    coverAlt: row.cover_alt,
    categoryId: row.category_id,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: row.reading_minutes,
    author: row.author,
    tags: row.tags,
    featured: row.featured,
    seo: asJson<SeoFields>(row.seo),
    useCoverForSharing: row.use_cover_for_sharing,
  };
}

export function toFaqCategory(row: Row<'faq_categories'>): FaqCategory {
  return { id: row.id, name: row.name, sortOrder: row.sort_order };
}

export function toFaqItem(row: Row<'faq_items'>): FaqItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    answer: row.answer,
    pendingNote: row.pending_note,
    sortOrder: row.sort_order,
  };
}

// ---------------------------------------------------------------------------
// Demandes
// ---------------------------------------------------------------------------
export function toBooking(row: Row<'bookings'>): Booking {
  return {
    id: row.id,
    reference: row.reference,
    confirmationKey: row.confirmation_key,
    source: row.source,
    serviceId: row.service_id,
    subject: row.subject,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    profile: row.profile,
    requestedDate: row.requested_date,
    requestedTime: row.requested_time,
    contactPreference: row.contact_preference,
    arrivalDate: row.arrival_date,
    stayDuration: row.stay_duration,
    message: row.message,
    housing: row.housing === null ? null : asJson<HousingCriteria>(row.housing),
    attachmentName: row.attachment_name,
    attachmentPath: row.attachment_path,
    status: row.status,
    assigneeId: row.assignee_id,
    consentAt: row.consent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Récapitulatif renvoyé par la fonction `booking_confirmation` (aucune donnée personnelle). */
export function toBookingConfirmation(value: Json): BookingConfirmation {
  const row =
    asJson<
      Pick<
        Row<'bookings'>,
        | 'reference'
        | 'confirmation_key'
        | 'source'
        | 'service_id'
        | 'requested_date'
        | 'requested_time'
        | 'contact_preference'
        | 'housing'
        | 'created_at'
      >
    >(value);
  return {
    reference: row.reference,
    confirmationKey: row.confirmation_key,
    source: row.source,
    serviceId: row.service_id,
    requestedDate: row.requested_date,
    requestedTime: row.requested_time,
    contactPreference: row.contact_preference,
    housing: row.housing === null ? null : asJson<HousingCriteria>(row.housing),
    createdAt: row.created_at,
  };
}

/** Données d'une demande au format attendu par la fonction `submit_booking` (camelCase). */
export function toSubmissionPayload(input: BookingInput): Json {
  return toJson({ ...input });
}

/** Colonnes saisies par l'équipe (référence, dates et historique sont fixés par la base). */
export function fromBookingInput(input: BookingInput) {
  return {
    source: input.source,
    service_id: input.serviceId,
    subject: input.subject,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    country: input.country,
    profile: input.profile,
    requested_date: input.requestedDate,
    requested_time: input.requestedTime,
    contact_preference: input.contactPreference,
    arrival_date: input.arrivalDate,
    stay_duration: input.stayDuration,
    message: input.message,
    housing: input.housing && toJson(input.housing),
    attachment_name: input.attachmentName,
  };
}

export function toBookingEvent(row: Row<'booking_events'>): BookingEvent {
  return {
    id: row.id,
    bookingId: row.booking_id,
    type: row.type,
    label: row.label,
    actor: row.actor,
    createdAt: row.created_at,
  };
}

export function toInternalNote(row: Row<'internal_notes'>): InternalNote {
  return {
    id: row.id,
    bookingId: row.booking_id,
    author: row.author,
    text: row.text,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Équipe
// ---------------------------------------------------------------------------
export function toAdminUser(row: Row<'admin_users'>): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    twoFactorEnabled: row.two_factor_enabled,
    twoFactorConfiguredAt: row.two_factor_configured_at,
    recoveryCodesRemaining: row.recovery_codes_remaining,
    passwordChangedAt: row.password_changed_at,
    lastLoginAt: row.last_login_at,
    invitationSentAt: row.invitation_sent_at,
    notifications: asJson<NotificationPreferences>(row.notifications),
  };
}

// ---------------------------------------------------------------------------
// Médiathèque et modèles d'e-mails
// ---------------------------------------------------------------------------
export function toMediaItem(row: Row<'media'>): MediaItem {
  return {
    id: row.id,
    fileName: row.file_name,
    kind: row.kind,
    image: row.image,
    title: row.title,
    altText: row.alt_text,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    usedOn: row.used_on,
    isPrivate: row.is_private,
    rightsConfirmed: row.rights_confirmed,
  };
}

export function toEmailTemplate(row: Row<'email_templates'>): EmailTemplate {
  return {
    id: row.id,
    key: row.key as EmailTemplateKey,
    name: row.name,
    trigger: row.trigger,
    kind: row.kind,
    audience: row.audience,
    subject: row.subject,
    heading: row.heading,
    body: row.body,
    senderName: row.sender_name,
    replyTo: row.reply_to,
    active: row.active,
    updatedAt: row.updated_at,
  };
}
