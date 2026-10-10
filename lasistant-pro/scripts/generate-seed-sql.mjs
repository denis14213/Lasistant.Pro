// Génère la migration des contenus initiaux (supabase/migrations/…_contenus_initiaux.sql)
// à partir des contenus rédigés dans src/content : réglages, services, catégories, articles,
// FAQ, modèles d'e-mails et images du site.
// Utilisation : npm run db:seed-sql — à relancer seulement pour régénérer la migration d'origine.
//
// Seuls les contenus réels du site sont repris : les demandes, comptes et sessions de
// démonstration (personnes fictives) ne sont jamais copiés dans la base de production.
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = new URL('../supabase/migrations/20261008170426_contenus_initiaux.sql', import.meta.url);
/** Date de référence des contenus (les dates relatives des contenus sont calculées à partir d'elle). */
const SEED_DATE = new Date('2026-10-08T09:00:00.000Z');
/** Auteur affiché pour les contenus d'origine (aucune personne fictive en production). */
const ORIGIN = 'LASISTANT.PRO';

const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});

try {
  const load = (path) => vite.ssrLoadModule(path);
  const [settings, services, categories, articles, faq, templates, media] = await Promise.all([
    load('/src/content/site-settings.ts'),
    load('/src/content/services.ts'),
    load('/src/content/categories.ts'),
    load('/src/content/articles.ts'),
    load('/src/content/faq.ts'),
    load('/src/content/demo/email-templates.ts'),
    load('/src/content/demo/media.ts'),
  ]);

  const s = settings.createSiteSettingsSeed(SEED_DATE);
  const tables = [
    {
      table: 'site_settings',
      rows: [
        {
          id: 1,
          brand_name: s.brandName,
          tagline: s.tagline,
          description: s.description,
          phones: s.phones,
          emails: s.emails,
          address: s.address,
          opening_hours: s.openingHours,
          facebook: s.facebook,
          whatsapp: s.whatsapp,
          booking: s.booking,
          seo: s.seo,
          analytics: s.analytics,
          maintenance: s.maintenance,
          backups: { ...s.backups, lastBackupAt: SEED_DATE.toISOString() },
          legal: s.legal,
          updated_at: SEED_DATE.toISOString(),
          updated_by: ORIGIN,
        },
      ],
    },
    {
      table: 'services',
      rows: services.createServicesSeed(SEED_DATE).map((item) => ({
        id: item.id,
        slug: item.slug,
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle,
        summary: item.summary,
        description: item.description,
        highlights: item.highlights,
        details: item.details,
        audiences: item.audiences,
        icon: item.icon,
        icon_tone: item.iconTone,
        image: item.image,
        image_alt: item.imageAlt,
        cta_label: item.ctaLabel,
        cta_href: item.ctaHref,
        active: item.active,
        show_in_menu: item.showInMenu,
        show_medical_disclaimer: item.showMedicalDisclaimer,
        sort_order: item.sortOrder,
        seo: item.seo,
        updated_at: SEED_DATE.toISOString(),
        updated_by: ORIGIN,
      })),
    },
    {
      table: 'categories',
      rows: categories.createCategoriesSeed().map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        active: item.active,
        sort_order: item.sortOrder,
        tone: item.tone,
      })),
    },
    {
      table: 'articles',
      rows: articles.createArticlesSeed(SEED_DATE).map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        cover_image: item.coverImage,
        cover_alt: item.coverAlt,
        category_id: item.categoryId,
        status: item.status,
        published_at: item.publishedAt,
        updated_at: item.updatedAt,
        reading_minutes: item.readingMinutes,
        author: item.author,
        tags: item.tags,
        featured: item.featured,
        seo: item.seo,
        use_cover_for_sharing: item.useCoverForSharing,
      })),
    },
    {
      table: 'faq_categories',
      rows: faq.FAQ_CATEGORIES.map((item) => ({ id: item.id, name: item.name, sort_order: item.sortOrder })),
    },
    {
      table: 'faq_items',
      rows: faq.createFaqSeed().map((item) => ({
        id: item.id,
        category_id: item.categoryId,
        question: item.question,
        answer: item.answer,
        pending_note: item.pendingNote,
        sort_order: item.sortOrder,
      })),
    },
    {
      table: 'email_templates',
      rows: templates.createEmailTemplatesSeed(SEED_DATE).map((item) => ({
        id: item.id,
        key: item.key,
        name: item.name,
        trigger: item.trigger,
        kind: item.kind,
        audience: item.audience,
        subject: item.subject,
        heading: item.heading,
        body: item.body,
        sender_name: item.senderName,
        reply_to: item.replyTo,
        active: item.active,
        updated_at: SEED_DATE.toISOString(),
      })),
    },
    {
      table: 'media',
      // Images fournies avec le site (registre local) : seules les images publiques sont reprises.
      rows: media
        .createMediaSeed(SEED_DATE)
        .filter((item) => !item.isPrivate)
        .map((item) => ({
          id: randomUUID(),
          file_name: item.fileName,
          kind: item.kind,
          image: item.image,
          storage_path: null,
          title: item.title,
          alt_text: item.altText,
          size_bytes: item.sizeBytes,
          width: item.width,
          height: item.height,
          uploaded_by: ORIGIN,
          created_at: item.createdAt,
          used_on: item.usedOn,
          is_private: false,
          rights_confirmed: item.rightsConfirmed,
        })),
    },
  ];

  const statements = tables.map(({ table, rows }) => {
    const columns = Object.keys(rows[0]).join(', ');
    const json = JSON.stringify(rows, null, 2);
    if (json.includes('$seed$')) throw new Error(`Délimiteur $seed$ présent dans les contenus de ${table}.`);
    return [
      `-- ${table} (${rows.length} ligne${rows.length > 1 ? 's' : ''})`,
      `insert into public.${table} (${columns})`,
      `select ${columns}`,
      `from jsonb_populate_recordset(null::public.${table}, $seed$${json}$seed$::jsonb)`,
      'on conflict (id) do nothing;',
    ].join('\n');
  });

  const sql = `-- =============================================================================
-- LASISTANT.PRO · 6/6 · Contenus initiaux
--
-- Fichier généré par « npm run db:seed-sql » à partir de src/content : ne pas modifier à la main.
-- Contenus réels du site uniquement (aucune demande ni personne fictive).
-- Idempotent : une ligne déjà présente n'est jamais écrasée.
-- =============================================================================

${statements.join('\n\n')}
`;
  await writeFile(output, sql, 'utf8');
  console.log(
    `Migration des contenus générée : ${tables.map(({ table, rows }) => `${table} (${rows.length})`).join(', ')}.`,
  );
} finally {
  await vite.close();
}
