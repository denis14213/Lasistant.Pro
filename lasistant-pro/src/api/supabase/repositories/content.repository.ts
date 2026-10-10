import { customTemplateKey, isSystemTemplate } from '@/emails/catalog';
import { slugify } from '@/lib/text';
import type { EmailTemplateKey } from '@/types';
import type {
  ArticlesRepository,
  CategoriesRepository,
  EmailTemplatesRepository,
  FaqRepository,
  ServicesRepository,
  SettingsRepository,
} from '../../contracts';
import { DataError } from '../../errors';
import { getSupabase } from '../client';
import { ensureOk, guard, unwrap } from '../errors';
import {
  fromServicePatch,
  fromSiteSettingsPatch,
  toArticle,
  toCategory,
  toEmailTemplate,
  toFaqCategory,
  toFaqItem,
  toService,
  toSiteSettings,
} from '../mappers';

/**
 * Contenus du site et réglages (tables « site_settings », « services », « articles »,
 * « categories », « faq_* », « email_templates »).
 * Les visiteurs ne lisent que les contenus publiés ou actifs (règles RLS) ; les écritures
 * sont réservées aux rôles habilités, et l'auteur des modifications est fixé par la base.
 */

/** Écriture refusée par les règles d'accès : la ligne n'est pas renvoyée. */
const WRITE_DENIED = 'Cet élément est introuvable, ou votre rôle ne permet pas de le modifier.';

export const settingsRepository: SettingsRepository = {
  async get() {
    const result = await guard(() => getSupabase().from('site_settings').select('*').eq('id', 1).single());
    return toSiteSettings(unwrap(result));
  },

  async update(patch) {
    const result = await guard(() =>
      getSupabase()
        .from('site_settings')
        .update(fromSiteSettingsPatch(patch))
        .eq('id', 1)
        .select('*')
        .single(),
    );
    return toSiteSettings(unwrap(result, { notFound: WRITE_DENIED }));
  },
};

export const servicesRepository: ServicesRepository = {
  async list({ includeInactive = false, kind } = {}) {
    const result = await guard(() => {
      let query = getSupabase().from('services').select('*').order('sort_order').order('id');
      if (!includeInactive) query = query.eq('active', true);
      if (kind) query = query.eq('kind', kind);
      return query;
    });
    return unwrap(result).map(toService);
  },

  async getBySlug(slug) {
    const result = await guard(() =>
      getSupabase().from('services').select('*').eq('slug', slug).maybeSingle(),
    );
    return toService(unwrap(result));
  },

  async update(id, patch) {
    const result = await guard(() =>
      getSupabase().from('services').update(fromServicePatch(patch)).eq('id', id).select('*').single(),
    );
    return toService(
      unwrap(result, { notFound: WRITE_DENIED, duplicate: 'Un service utilise déjà cette adresse.' }),
    );
  },

  /**
   * Nouveau service proposé dans la réservation en ligne (désactivé tant qu'il n'est pas rédigé).
   * L'identifiant reprend l'adresse : il sert aussi de paramètre « ?service= » de la réservation.
   */
  async create(title) {
    const name = title.trim();
    const slug = slugify(name);
    const result = await guard(() =>
      getSupabase()
        .from('services')
        .insert({
          id: slug,
          slug,
          kind: 'reservation',
          title: name,
          subtitle: 'Nouveau service',
          summary: 'Description à rédiger.',
          icon: 'conversation',
          icon_tone: 'brand',
          image: 'teamMeeting',
          cta_label: 'Réserver un échange',
          cta_href: `/reservation?service=${slug}`,
          active: false,
          show_in_menu: false,
          seo: { title: name, description: '' },
        })
        .select('*')
        .single(),
    );
    return toService(unwrap(result, { duplicate: 'Un service porte déjà ce nom.' }));
  },

  async move(id, direction) {
    ensureOk(
      await guard(() => getSupabase().rpc('move_service', { p_service_id: id, p_direction: direction })),
    );
    return servicesRepository.list({ includeInactive: true });
  },
};

export const articlesRepository: ArticlesRepository = {
  async listPublished() {
    const result = await guard(() =>
      getSupabase()
        .from('articles')
        .select('*')
        .eq('status', 'publie')
        .order('published_at', { ascending: false }),
    );
    return unwrap(result).map(toArticle);
  },

  async getPublishedBySlug(slug) {
    const result = await guard(() =>
      getSupabase().from('articles').select('*').eq('slug', slug).eq('status', 'publie').maybeSingle(),
    );
    return toArticle(unwrap(result));
  },

  async listAll() {
    const result = await guard(() =>
      getSupabase().from('articles').select('*').order('updated_at', { ascending: false }),
    );
    return unwrap(result).map(toArticle);
  },

  async getById(id) {
    const result = await guard(() => getSupabase().from('articles').select('*').eq('id', id).maybeSingle());
    return toArticle(unwrap(result));
  },

  /** Temps de lecture, date de première publication et auteur sont calculés par la base. */
  async save(draft) {
    const row = {
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body,
      cover_image: draft.coverImage,
      cover_alt: draft.coverAlt,
      category_id: draft.categoryId,
      status: draft.status,
      seo: { ...draft.seo },
      use_cover_for_sharing: draft.useCoverForSharing,
    };
    const context = {
      duplicate: 'Ce slug est déjà utilisé par un autre article.',
      notFound: WRITE_DENIED,
    };
    const result = await guard(() =>
      draft.id
        ? getSupabase().from('articles').update(row).eq('id', draft.id).select('*').single()
        : getSupabase().from('articles').insert(row).select('*').single(),
    );
    return toArticle(unwrap(result, context));
  },

  async remove(id) {
    ensureOk(await guard(() => getSupabase().from('articles').delete().eq('id', id)));
  },
};

export const categoriesRepository: CategoriesRepository = {
  async list(includeInactive = false) {
    const result = await guard(() => {
      let query = getSupabase().from('categories').select('*').order('sort_order');
      if (!includeInactive) query = query.eq('active', true);
      return query;
    });
    return unwrap(result).map(toCategory);
  },

  async create(name) {
    const result = await guard(() =>
      getSupabase()
        .from('categories')
        .insert({ name: name.trim(), slug: slugify(name), description: '', active: true, tone: 'neutral' })
        .select('*')
        .single(),
    );
    return toCategory(unwrap(result, { duplicate: 'Une catégorie porte déjà ce nom.' }));
  },

  async setActive(id, active) {
    const result = await guard(() =>
      getSupabase().from('categories').update({ active }).eq('id', id).select('*').single(),
    );
    return toCategory(unwrap(result, { notFound: WRITE_DENIED }));
  },
};

export const faqRepository: FaqRepository = {
  async list() {
    const [categories, items] = await Promise.all([
      guard(() => getSupabase().from('faq_categories').select('*').order('sort_order')),
      guard(() => getSupabase().from('faq_items').select('*').order('sort_order')),
    ]);
    return {
      categories: unwrap(categories).map(toFaqCategory),
      items: unwrap(items).map(toFaqItem),
    };
  },
};

/** Modèles fournis avec le site d'abord (ordre d'origine), puis réponses ajoutées par l'équipe. */
function byCatalogOrder(a: { key: EmailTemplateKey; id: string; name: string }, b: typeof a): number {
  const system = Number(isSystemTemplate(b.key)) - Number(isSystemTemplate(a.key));
  if (system !== 0) return system;
  return isSystemTemplate(a.key)
    ? a.id.localeCompare(b.id, 'fr', { numeric: true })
    : a.name.localeCompare(b.name, 'fr');
}

export const emailTemplatesRepository: EmailTemplatesRepository = {
  async list() {
    const result = await guard(() => getSupabase().from('email_templates').select('*'));
    return unwrap(result).map(toEmailTemplate).sort(byCatalogOrder);
  },

  async getByKey(key) {
    const result = await guard(() =>
      getSupabase().from('email_templates').select('*').eq('key', key).maybeSingle(),
    );
    return toEmailTemplate(unwrap(result));
  },

  /**
   * Le nom des modèles fournis avec le site reste fixe (garanti par la base).
   * Les champs non renseignés sont ignorés (ils ne sont pas transmis à l'API).
   */
  async update(id, patch) {
    const row = {
      name: patch.name,
      subject: patch.subject,
      heading: patch.heading,
      body: patch.body,
      sender_name: patch.senderName,
      reply_to: patch.replyTo,
      active: patch.active,
    };
    const result = await guard(() =>
      getSupabase().from('email_templates').update(row).eq('id', id).select('*').single(),
    );
    return toEmailTemplate(unwrap(result, { notFound: WRITE_DENIED }));
  },

  async create(name) {
    const id = crypto.randomUUID();
    const reference = await guard(() =>
      getSupabase()
        .from('email_templates')
        .select('reply_to')
        .eq('key', 'confirmation-demandeur')
        .maybeSingle(),
    );
    const result = await guard(() =>
      getSupabase()
        .from('email_templates')
        .insert({
          id,
          key: customTemplateKey(id),
          name: name.trim(),
          trigger: 'Envoi manuel',
          kind: 'manuel',
          audience: 'demandeur',
          subject: 'Votre demande [référence]',
          heading: '',
          body: 'Bonjour [prénom],\n\n\n\nL’équipe LASISTANT.PRO',
          sender_name: 'LASISTANT.PRO',
          reply_to: reference.data?.reply_to ?? '',
          active: true,
        })
        .select('*')
        .single(),
    );
    return toEmailTemplate(unwrap(result));
  },

  async remove(id) {
    const existing = await guard(() =>
      getSupabase().from('email_templates').select('key').eq('id', id).maybeSingle(),
    );
    const template = unwrap(existing);
    if (isSystemTemplate(template.key as EmailTemplateKey)) {
      throw new DataError('forbidden', 'Les modèles fournis avec le site ne peuvent pas être supprimés.');
    }
    ensureOk(await guard(() => getSupabase().from('email_templates').delete().eq('id', id)));
  },
};
