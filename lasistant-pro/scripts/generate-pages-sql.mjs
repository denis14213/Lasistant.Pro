// Génère, à partir de src/content, les migrations des photos de l'équipe et des contenus de pages :
//   - …_photos_et_contenus_des_pages.sql : contenus d'origine de chaque page du site (table
//     page_contents) et photos de l'équipe LASISTANT.PRO à la place des anciennes photos
//     d'illustration (services, articles, médiathèque) ; les photos des logements ne changent pas ;
//   - …_retrait_anciennes_photos.sql : retrait des anciennes photos d'illustration de la
//     médiathèque. Seule suppression de données, elle est isolée pour être relue et confirmée à part.
// Utilisation : npm run db:pages-sql — à relancer seulement pour régénérer ces migrations.
//
// Les migrations sont idempotentes et ne remplacent jamais un choix fait depuis le back-office :
// une page déjà enregistrée est conservée, une photo n'est remplacée que si elle est encore
// l'une des anciennes photos d'illustration, un titre saisi est conservé.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = new URL(
  '../supabase/migrations/20261010073358_photos_et_contenus_des_pages.sql',
  import.meta.url,
);
const cleanupOutput = new URL(
  '../supabase/migrations/20261010214000_retrait_anciennes_photos.sql',
  import.meta.url,
);
/** Date de référence des contenus (les dates relatives des contenus sont calculées à partir d'elle). */
const SEED_DATE = new Date('2026-10-08T09:00:00.000Z');
/** Auteur affiché pour les contenus d'origine (aucune personne fictive en production). */
const ORIGIN = 'LASISTANT.PRO';

/** Bloc JSON délimité pour PostgreSQL (le délimiteur ne doit jamais figurer dans les contenus). */
function jsonLiteral(value, label) {
  const json = JSON.stringify(value, null, 2);
  if (json.includes('$seed$')) throw new Error(`Délimiteur $seed$ présent dans les contenus : ${label}.`);
  return `$seed$${json}$seed$::jsonb`;
}

const sqlText = (value) => `'${value.replaceAll("'", "''")}'`;

const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});

try {
  const load = (path) => vite.ssrLoadModule(path);
  const [pages, images, services, articles, media] = await Promise.all([
    load('/src/content/pages/index.ts'),
    load('/src/assets/images/index.ts'),
    load('/src/content/services.ts'),
    load('/src/content/articles.ts'),
    load('/src/content/demo/media.ts'),
  ]);

  const legacyKeys = Object.keys(images.LEGACY_IMAGE_KEYS);
  const legacyArray = `array[${legacyKeys.map(sqlText).join(', ')}]::text[]`;

  // Le contenu doit survivre à un aller-retour JSON (aucune fonction, aucune valeur indéfinie).
  const pageContents = Object.fromEntries(
    pages.PAGE_KEYS.map((key) => [key, JSON.parse(JSON.stringify(pages.PAGE_DEFAULTS[key]))]),
  );

  const serviceImages = services
    .createServicesSeed(SEED_DATE)
    .map((item) => ({ id: item.id, image: item.image, image_alt: item.imageAlt }));
  const articleCovers = articles
    .createArticlesSeed(SEED_DATE)
    .map((item) => ({ id: item.id, cover_image: item.coverImage, cover_alt: item.coverAlt }));
  const mediaRows = media
    .createMediaSeed(SEED_DATE)
    .filter((item) => !item.isPrivate)
    .map((item) => ({
      file_name: item.fileName,
      kind: item.kind,
      image: item.image,
      title: item.title,
      alt_text: item.altText,
      size_bytes: item.sizeBytes,
      width: item.width,
      height: item.height,
      uploaded_by: ORIGIN,
      used_on: item.usedOn,
      is_private: false,
      rights_confirmed: item.rightsConfirmed,
    }));
  // Les premières photos portaient un titre tiré des premiers mots du texte alternatif :
  // il est remplacé par un titre court, sauf s'il a été modifié depuis le back-office.
  const mediaTitles = mediaRows.map((item) => ({ image: item.image, title: item.title }));

  const sql = `-- =============================================================================
-- LASISTANT.PRO · Photos de l'équipe et contenus des pages
--
-- Fichier généré par « npm run db:pages-sql » à partir de src/content : ne pas modifier à la main.
-- Idempotent : une page déjà enregistrée depuis le back-office n'est jamais écrasée, et une
-- photo n'est remplacée que si elle est encore l'une des anciennes photos d'illustration.
-- Les photos des appartements ne sont pas concernées.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Contenus d'origine des pages (${pages.PAGE_KEYS.length} pages)
-- -----------------------------------------------------------------------------
insert into public.page_contents (key, content, updated_by)
select page.key, page.content, ${sqlText(ORIGIN)}
from jsonb_each(${jsonLiteral(pageContents, 'page_contents')}) as page (key, content)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Services : photos de l'équipe à la place des anciennes photos d'illustration
-- -----------------------------------------------------------------------------
update public.services as service
set image = seed.image, image_alt = seed.image_alt
from jsonb_to_recordset(${jsonLiteral(serviceImages, 'services')}) as seed (id text, image text, image_alt text)
where service.id = seed.id
  and service.image = any (${legacyArray});

-- -----------------------------------------------------------------------------
-- Articles : photos de couverture
-- -----------------------------------------------------------------------------
update public.articles as article
set cover_image = seed.cover_image, cover_alt = seed.cover_alt
from jsonb_to_recordset(${jsonLiteral(articleCovers, 'articles')}) as seed (id text, cover_image text, cover_alt text)
where article.id = seed.id
  and article.cover_image = any (${legacyArray});

-- -----------------------------------------------------------------------------
-- Médiathèque : photos de l'équipe (les anciennes photos d'illustration sont retirées par la
-- migration suivante, « retrait_anciennes_photos »)
-- -----------------------------------------------------------------------------
insert into public.media (
  file_name, kind, image, title, alt_text, size_bytes, width, height,
  uploaded_by, used_on, is_private, rights_confirmed
)
select
  seed.file_name, seed.kind, seed.image, seed.title, seed.alt_text, seed.size_bytes, seed.width, seed.height,
  seed.uploaded_by, seed.used_on, seed.is_private, seed.rights_confirmed
from jsonb_populate_recordset(null::public.media, ${jsonLiteral(mediaRows, 'media')}) as seed
where not exists (
  select 1 from public.media as existing
  where existing.storage_path is null and existing.image = seed.image
);

-- Titres courts des photos fournies avec le site : seul un titre automatique d'origine (début
-- exact, mot pour mot, du texte alternatif) est remplacé ; un titre saisi est conservé.
update public.media as item
set title = seed.title
from jsonb_to_recordset(${jsonLiteral(mediaTitles, 'media (titres)')}) as seed (image text, title text)
where item.storage_path is null
  and item.image = seed.image
  and starts_with(item.alt_text || ' ', item.title || ' ');
`;
  const cleanupSql = `-- =============================================================================
-- LASISTANT.PRO · Retrait des anciennes photos d'illustration de la médiathèque
--
-- Fichier généré par « npm run db:pages-sql » à partir de src/content : ne pas modifier à la main.
-- Les photos d'illustration fournies avec la première version du site sont remplacées par les
-- photos de l'équipe : leurs fiches sont retirées de la médiathèque. Aucun fichier déposé n'est
-- concerné (storage_path renseigné) et les contenus qui les citent encore affichent la photo de
-- l'équipe correspondante (LEGACY_IMAGE_KEYS). Sans effet sur une base déjà à jour.
-- =============================================================================

delete from public.media
where storage_path is null
  and image = any (${legacyArray});
`;
  await writeFile(output, sql, 'utf8');
  await writeFile(cleanupOutput, cleanupSql, 'utf8');
  console.log(
    `Migration générée : ${pages.PAGE_KEYS.length} pages, ${serviceImages.length} services, ` +
      `${articleCovers.length} articles, ${mediaRows.length} photos (anciennes clés : ${legacyKeys.length}).`,
  );
} finally {
  await vite.close();
}
