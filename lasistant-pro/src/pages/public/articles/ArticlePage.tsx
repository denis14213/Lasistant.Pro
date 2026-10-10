import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams, type LoaderFunctionArgs } from 'react-router';
import { articleBySlugQuery, categoriesQuery, publishedArticlesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { queryClient } from '@/app/query-client';
import { notFound, orNotFound } from '@/app/route-errors';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { LogoMark } from '@/components/brand/Logo';
import { MarkdownContent } from '@/components/content/RichText';
import { Seo } from '@/components/seo/Seo';
import { articleSchema, breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  Lead,
  ResponsiveImage,
  Section,
  SectionHeader,
  Tag,
  TextAnchor,
  TextLink,
} from '@/components/ui';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { ArticleCard } from '@/features/articles/ArticleCard';
import { ArticleMeta } from '@/features/articles/ArticleMeta';
import { ShareButtons } from '@/features/articles/ShareButtons';
import { TableOfContents } from '@/components/content/TableOfContents';
import { IconArrowRight, IconChevronDown, IconPhone } from '@/components/ui/icons';
import { useCategoryLookup } from '@/features/articles/useCategoryLookup';
import { usePageContent } from '@/features/content/usePageContent';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { formatPublicationDate, phoneHref } from '@/lib/format';
import { resolveImage } from '@/lib/images';
import { parseMarkdown, tableOfContents } from '@/lib/markdown';

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug) notFound();
  await Promise.all([
    orNotFound(queryClient.ensureQueryData(articleBySlugQuery(params.slug))),
    prefetch(publishedArticlesQuery(), categoriesQuery(true)),
  ]);
  return null;
}

/** Article de l'Espace infos (cahier des charges § 6.9). */
export function Component() {
  const { slug = '' } = useParams();
  const { data: article } = useSuspenseQuery(articleBySlugQuery(slug));
  const { data: articles } = useSuspenseQuery(publishedArticlesQuery());
  const categoryOf = useCategoryLookup();
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const texts = usePageContent('espace-infos').article;

  const category = categoryOf(article.categoryId);
  const blocks = useMemo(() => parseMarkdown(article.body), [article.body]);
  const contents = useMemo(() => tableOfContents(blocks), [blocks]);
  const path = ROUTES.article(article.slug);
  const cover = resolveImage(article.coverImage, article.coverAlt);

  // Articles liés : même catégorie d'abord, puis les plus récents.
  const related = [
    ...articles.filter((item) => item.id !== article.id && item.categoryId === article.categoryId),
    ...articles.filter((item) => item.id !== article.id && item.categoryId !== article.categoryId),
  ].slice(0, 3);

  const breadcrumbs = [
    { label: 'Accueil', to: ROUTES.home },
    { label: 'Espace infos', to: ROUTES.articles },
    { label: category?.name ?? article.title },
  ];

  return (
    <>
      <Seo
        title={article.seo.title || article.title}
        description={article.seo.description || article.excerpt}
        type="article"
        image={article.useCoverForSharing ? cover.src : undefined}
        structuredData={[articleSchema(article, cover.src), breadcrumbTrailSchema(breadcrumbs, path)]}
      />
      <article aria-labelledby="titre-page">
        <header className="pt-4 pb-10 md:pt-9 md:pb-12">
          <Container>
            <Breadcrumbs items={breadcrumbs} className="mb-6 md:mb-12" />
            <div className="flex max-w-[920px] flex-col gap-7">
              <ArticleMeta article={article} category={category} longReadingLabel />
              <h1 id="titre-page" className="text-h1 font-semibold">
                {article.title}
              </h1>
              <Lead className="text-lg md:text-[21px]">{article.excerpt}</Lead>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white p-1">
                    <LogoMark size={32} />
                  </span>
                  <span>
                    {article.author}
                    <span className="block text-[13px] font-normal text-muted">
                      Mis à jour le {formatPublicationDate(article.updatedAt)}
                    </span>
                  </span>
                </p>
                <ShareButtons url={`${env.siteUrl}${path}`} title={article.title} />
              </div>
            </div>
          </Container>
        </header>

        <Container>
          <figure className="h-[260px] overflow-hidden rounded-[24px] bg-mist md:h-[560px] md:rounded-[32px]">
            <ResponsiveImage
              image={cover}
              priority
              sizes="(min-width: 1280px) 1240px, 100vw"
              className="size-full object-cover"
            />
          </figure>
        </Container>

        <Section className="pt-12 md:pt-18">
          <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[220px_minmax(0,1fr)_280px] xl:gap-16">
            <aside aria-label="Sommaire" className="hidden xl:sticky xl:top-[120px] xl:block">
              <TableOfContents items={contents} label="Sommaire de l’article" />
            </aside>

            <div className="min-w-0">
              {contents.length > 0 ? (
                <details className="group mb-8 rounded-box border border-line bg-paper xl:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                    Sommaire de l’article
                    <IconChevronDown className="size-4.5 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <TableOfContents items={contents} label="Sommaire de l’article" className="px-2 pb-3 [&>p]:hidden" />
                </details>
              ) : null}

              <MarkdownContent
                blocks={blocks}
                renderCta={() => (
                  <div className="mt-[1.8em]! flex flex-wrap items-center gap-5.5 rounded-card border border-brand-200 bg-mist px-6 py-6 md:px-7.5 md:py-7">
                    <div className="min-w-[min(240px,100%)] flex-1">
                      <p className="text-[19px] font-semibold text-ink">{texts.inlineCta.title}</p>
                      <p className="mt-1.5 text-[15.5px] text-muted">{texts.inlineCta.text}</p>
                    </div>
                    <ButtonLink to={ROUTES.booking} trailingIcon={<IconArrowRight />} className="no-underline">
                      {texts.inlineCta.label}
                    </ButtonLink>
                  </div>
                )}
              />
              <p className="mt-10 max-w-[45rem] border-t border-line pt-6 text-sm text-muted">{texts.disclaimer}</p>
              {article.tags.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Mots-clés">
                  {article.tags.map((tag) => (
                    <li key={tag}>
                      <Tag tone="neutral">{tag}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <aside aria-label="Aller plus loin" className="flex flex-col gap-5 lg:sticky lg:top-[120px]">
              <div className="relative flex flex-col gap-4.5 overflow-hidden rounded-card bg-plum p-6 text-white">
                <BrandSwoosh secondBlade="green" className="absolute -right-20 -bottom-24 size-[260px] opacity-35" />
                <span className="relative flex size-11 items-center justify-center rounded-xl bg-white p-1.5">
                  <LogoMark size={32} />
                </span>
                <p className="relative text-[19px] leading-[1.3] font-semibold">{texts.aside.title}</p>
                <p className="relative text-[15px] text-on-plum">{texts.aside.text}</p>
                <ButtonLink to={ROUTES.booking} variant="light" size="sm" className="relative w-fit" trailingIcon={<IconArrowRight />}>
                  {texts.aside.label}
                </ButtonLink>
              </div>
              {phone ? (
                <div className="flex flex-col gap-3 rounded-box border border-line bg-paper p-6">
                  <p className="text-[15px] font-semibold">Une question ?</p>
                  <TextAnchor href={phoneHref(phone)} icon={<IconPhone />}>
                    {phone}
                  </TextAnchor>
                </div>
              ) : null}
            </aside>
          </Container>
        </Section>
      </article>

      {related.length > 0 ? (
        <Section tone="paper" bordered aria-labelledby="articles-lies">
          <Container>
            <SectionHeader
              eyebrow={texts.related.eyebrow}
              titleId="articles-lies"
              title={texts.related.title}
              titleClassName="text-[clamp(1.875rem,2.8vw,2.375rem)] max-[359px]:text-[min(1.875rem,9.3vw)]"
              aside={
                <TextLink to={ROUTES.articles} arrow>
                  {texts.related.linkLabel}
                </TextLink>
              }
            />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} category={categoryOf(item.categoryId)} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
