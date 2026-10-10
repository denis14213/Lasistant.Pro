import type {
  Article,
  Booking,
  BookingEvent,
  Category,
  EmailTemplate,
  FaqCategory,
  FaqItem,
  InternalNote,
  MediaItem,
  Service,
  SiteSettings,
} from '@/types';
import { PAGE_DEFAULTS } from '@/content/pages';
import type { BackupRepository } from '../../contracts';
import { DataError } from '../../errors';
import { getSupabase } from '../client';
import type { Json } from '../database.types';
import { ensureOk, guard, toDataError, unwrap } from '../errors';
import {
  fromServicePatch,
  fromSiteSettingsPatch,
  toArticle,
  toBooking,
  toBookingEvent,
  toCategory,
  toEmailTemplate,
  toFaqCategory,
  toFaqItem,
  toInternalNote,
  toMediaItem,
  toService,
  toSiteSettings,
} from '../mappers';

const BACKUP_FORMAT = 'lasistant-pro-backup';
const BACKUP_VERSION = 1;
const INVALID_BACKUP = 'Ce fichier n’est pas une sauvegarde valide de LASISTANT.PRO.';
/** Table absente : la migration « page_contents » n'est pas encore appliquée à la base. */
const MISSING_TABLE_CODES = new Set(['PGRST205', '42P01']);

interface StoredPage {
  key: string;
  content: Json;
}

interface Backup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  tables: {
    siteSettings: SiteSettings;
    services: Service[];
    categories: Category[];
    articles: Article[];
    faqCategories: FaqCategory[];
    faqItems: FaqItem[];
    emailTemplates: EmailTemplate[];
    media: MediaItem[];
    /** Pages modifiées depuis le back-office (absent des sauvegardes plus anciennes) */
    pages?: StoredPage[];
    /** Archivées dans la sauvegarde, jamais réécrites par une restauration */
    bookings: Booking[];
    bookingEvents: BookingEvent[];
    internalNotes: InternalNote[];
  };
}

function parseBackup(json: string): Backup {
  try {
    const backup = JSON.parse(json) as Partial<Backup>;
    if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION || !backup.tables)
      throw new Error();
    return backup as Backup;
  } catch {
    throw new DataError('validation', INVALID_BACKUP);
  }
}

/**
 * Sauvegarde et restauration (administrateurs : les règles RLS donnent accès à toutes les tables).
 * La restauration rétablit les contenus et les réglages ; les demandes reçues depuis la
 * sauvegarde ne sont jamais écrasées ni supprimées.
 */
export const backupRepository: BackupRepository = {
  async export() {
    const supabase = getSupabase();
    const [
      settings,
      services,
      categories,
      articles,
      faqCategories,
      faqItems,
      templates,
      media,
      bookings,
      events,
      notes,
      pages,
    ] = await Promise.all([
      guard(() => supabase.from('site_settings').select('*').eq('id', 1).single()),
      guard(() => supabase.from('services').select('*').order('sort_order')),
      guard(() => supabase.from('categories').select('*').order('sort_order')),
      guard(() => supabase.from('articles').select('*').order('updated_at')),
      guard(() => supabase.from('faq_categories').select('*').order('sort_order')),
      guard(() => supabase.from('faq_items').select('*').order('sort_order')),
      guard(() => supabase.from('email_templates').select('*').order('key')),
      guard(() => supabase.from('media').select('*').order('created_at')),
      guard(() => supabase.from('bookings').select('*').order('created_at')),
      guard(() => supabase.from('booking_events').select('*').order('created_at')),
      guard(() => supabase.from('internal_notes').select('*').order('created_at')),
      guard(() => supabase.from('page_contents').select('key, content').order('key')),
    ]);
    if (pages.error && !MISSING_TABLE_CODES.has(pages.error.code)) throw toDataError(pages.error);

    const backup: Backup = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      tables: {
        siteSettings: toSiteSettings(unwrap(settings)),
        services: unwrap(services).map(toService),
        categories: unwrap(categories).map(toCategory),
        articles: unwrap(articles).map(toArticle),
        faqCategories: unwrap(faqCategories).map(toFaqCategory),
        faqItems: unwrap(faqItems).map(toFaqItem),
        emailTemplates: unwrap(templates).map(toEmailTemplate),
        media: unwrap(media).map(toMediaItem),
        pages: pages.data ?? [],
        bookings: unwrap(bookings).map(toBooking),
        bookingEvents: unwrap(events).map(toBookingEvent),
        internalNotes: unwrap(notes).map(toInternalNote),
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  async restore(json) {
    const { tables } = parseBackup(json);
    const supabase = getSupabase();
    const context = { inUse: INVALID_BACKUP, duplicate: INVALID_BACKUP };

    const { updatedAt: _updatedAt, updatedBy: _updatedBy, ...settings } = tables.siteSettings;
    ensureOk(
      await guard(() => supabase.from('site_settings').update(fromSiteSettingsPatch(settings)).eq('id', 1)),
      context,
    );

    ensureOk(
      await guard(() =>
        supabase.from('categories').upsert(
          tables.categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            active: category.active,
            sort_order: category.sortOrder,
            tone: category.tone,
          })),
        ),
      ),
      context,
    );
    ensureOk(
      await guard(() =>
        supabase.from('services').upsert(
          tables.services.map((service) => ({
            ...fromServicePatch(service),
            id: service.id,
            slug: service.slug,
            title: service.title,
          })),
        ),
      ),
      context,
    );
    ensureOk(
      await guard(() =>
        supabase.from('articles').upsert(
          tables.articles.map((article) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            body: article.body,
            cover_image: article.coverImage,
            cover_alt: article.coverAlt,
            category_id: article.categoryId,
            status: article.status,
            published_at: article.publishedAt,
            tags: article.tags,
            featured: article.featured,
            seo: { ...article.seo },
            use_cover_for_sharing: article.useCoverForSharing,
          })),
        ),
      ),
      context,
    );
    ensureOk(
      await guard(() =>
        supabase.from('faq_categories').upsert(
          tables.faqCategories.map((item) => ({
            id: item.id,
            name: item.name,
            sort_order: item.sortOrder,
          })),
        ),
      ),
      context,
    );
    ensureOk(
      await guard(() =>
        supabase.from('faq_items').upsert(
          tables.faqItems.map((item) => ({
            id: item.id,
            category_id: item.categoryId,
            question: item.question,
            answer: item.answer,
            pending_note: item.pendingNote,
            sort_order: item.sortOrder,
          })),
        ),
      ),
      context,
    );

    // Modèles d'e-mails et médias : seuls les champs rédactionnels sont restaurés.
    for (const template of tables.emailTemplates) {
      ensureOk(
        await guard(() =>
          supabase
            .from('email_templates')
            .update({
              name: template.name,
              subject: template.subject,
              heading: template.heading,
              body: template.body,
              sender_name: template.senderName,
              reply_to: template.replyTo,
              active: template.active,
            })
            .eq('id', template.id),
        ),
        context,
      );
    }
    for (const item of tables.media) {
      ensureOk(
        await guard(() =>
          supabase
            .from('media')
            .update({ title: item.title, alt_text: item.altText, rights_confirmed: item.rightsConfirmed })
            .eq('id', item.id),
        ),
        context,
      );
    }

    // Pages du site : seules les pages connues du site sont restaurées.
    const pages = (tables.pages ?? []).filter((page) => Object.hasOwn(PAGE_DEFAULTS, page.key));
    if (pages.length > 0) {
      ensureOk(
        await guard(() => supabase.from('page_contents').upsert(pages, { onConflict: 'key' })),
        context,
      );
    }
  },
};
