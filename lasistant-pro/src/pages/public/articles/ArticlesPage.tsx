import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { categoriesQuery, publishedArticlesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { CtaBand } from '@/components/marketing/CallToAction';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  Breadcrumbs,
  ButtonLink,
  Card,
  Chip,
  Container,
  EmptyState,
  Eyebrow,
  IconButton,
  Lead,
  Pagination,
  Section,
  TextLink,
} from '@/components/ui';
import { IconArrowRight, IconClose, IconSearch } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { ARTICLES_CONTENT } from '@/content/pages/public';
import { ArticleCard, FeaturedArticle } from '@/features/articles/ArticleCard';
import { useCategoryLookup } from '@/features/articles/useCategoryLookup';
import { matchesQuery, pluralize } from '@/lib/text';

export const loader = () => prefetch(publishedArticlesQuery(), categoriesQuery(), categoriesQuery(true));

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Espace infos' }];

/** Paramètres d'adresse : la sélection est partageable et le bouton « Retour » la conserve. */
const PARAM = { category: 'categorie', query: 'q', page: 'page' } as const;

/** Espace infos : publications, filtres par catégorie, recherche et pagination (cahier des charges § 6.8). */
export function Component() {
  const content = ARTICLES_CONTENT;
  const { data: articles } = useSuspenseQuery(publishedArticlesQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const categoryOf = useCategoryLookup();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get(PARAM.query) ?? '';
  const category = categories.find((item) => item.slug === searchParams.get(PARAM.category)) ?? null;
  const requestedPage = Math.max(1, Number(searchParams.get(PARAM.page)) || 1);

  // Le champ de recherche réagit à chaque frappe ; l'adresse suit (et peut aussi le modifier : « Retour »).
  const [query, setQuery] = useState(urlQuery);
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlQuery);
  if (urlQuery !== previousUrlQuery) {
    setPreviousUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const updateParams = (changes: Partial<Record<keyof typeof PARAM, string | null>>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes) as Array<[keyof typeof PARAM, string | null]>) {
      if (value) next.set(PARAM[key], value);
      else next.delete(PARAM[key]);
    }
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setPreviousUrlQuery(value.trim());
    updateParams({ query: value.trim() || null, page: null });
  };

  const trimmedQuery = query.trim();
  const featured = articles.find((article) => article.featured) ?? articles[0] ?? null;
  const showFeatured = !category && !trimmedQuery && featured !== null;

  const matching = articles.filter(
    (article) =>
      (!category || article.categoryId === category.id) &&
      matchesQuery(
        [article.title, article.excerpt, categoryOf(article.categoryId)?.name ?? '', ...article.tags].join(' '),
        trimmedQuery,
      ),
  );
  const listed = showFeatured ? matching.filter((article) => article.id !== featured.id) : matching;
  const pageCount = Math.max(1, Math.ceil(listed.length / content.pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visible = listed.slice((page - 1) * content.pageSize, page * content.pageSize);
  const countFor = (categoryId: string | null) =>
    categoryId ? articles.filter((article) => article.categoryId === categoryId).length : articles.length;

  const changePage = (next: number) => {
    updateParams({ page: next > 1 ? String(next) : null });
    document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.articles)}
      />
      <section aria-labelledby="titre-page" className="relative overflow-hidden pt-4 pb-10 md:pt-9 md:pb-14">
        <BrandSwoosh className="absolute -top-10 -right-24 z-0 size-[340px] md:-top-15 md:-right-35 md:size-[560px]" />
        <Container className="relative">
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="relative z-[2] flex flex-wrap items-end justify-between gap-8">
            <div className="flex max-w-[760px] flex-col gap-6.5">
              <Eyebrow>{content.hero.eyebrow}</Eyebrow>
              <h1 id="titre-page" className="text-h1 font-semibold">
                <AccentTitle value={content.hero.title} />
              </h1>
              <Lead>{content.hero.lead}</Lead>
            </div>
            <label className="flex h-[52px] w-full max-w-[380px] items-center gap-2.5 rounded-full border border-line-strong bg-white px-4.5 text-muted focus-within:border-brand focus-within:shadow-focus">
              <IconSearch className="size-4.5 shrink-0" aria-hidden />
              <span className="sr-only">Rechercher un article</span>
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Rechercher un article…"
                className="min-w-0 flex-1 bg-transparent text-base text-ink md:text-[15.5px] outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <IconButton label="Effacer la recherche" variant="ghost" size="sm" onClick={() => onQueryChange('')}>
                  <IconClose aria-hidden />
                </IconButton>
              ) : null}
            </label>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Publications">
        <Container id="publications" className="flex scroll-mt-28 flex-col gap-12">
          <div role="group" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
            <Chip pressed={!category} count={countFor(null)} onClick={() => updateParams({ category: null, page: null })}>
              Tous
            </Chip>
            {categories.map((item) => (
              <Chip
                key={item.id}
                pressed={category?.id === item.id}
                count={countFor(item.id)}
                onClick={() => updateParams({ category: item.slug, page: null })}
              >
                {item.name}
              </Chip>
            ))}
          </div>

          {trimmedQuery ? (
            <div role="status" className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <p className="text-[19px] font-medium tracking-[-0.01em]">
                {pluralize(matching.length, 'résultat')} pour « {trimmedQuery} »
              </p>
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="inline-flex items-center gap-2 font-semibold text-brand hover:underline"
              >
                <IconClose className="size-4" aria-hidden />
                Effacer la recherche
              </button>
            </div>
          ) : null}

          {showFeatured && page === 1 ? (
            <FeaturedArticle article={featured} category={categoryOf(featured.categoryId)} />
          ) : null}

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
              {visible.map((article) => (
                <ArticleCard key={article.id} article={article} category={categoryOf(article.categoryId)} />
              ))}
            </div>
          ) : !showFeatured || listed.length === 0 ? (
            <Card className="py-6">
              <EmptyState
                icon={<IconSearch />}
                headingLevel="h2"
                title={trimmedQuery ? `Aucun résultat pour « ${trimmedQuery} »` : 'Aucune publication pour le moment'}
                description={
                  trimmedQuery
                    ? 'Vérifiez l’orthographe, essayez un mot plus général ou parcourez nos thèmes :'
                    : 'De nouveaux conseils pratiques seront bientôt publiés dans cette catégorie.'
                }
                actions={
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {categories.map((item) => (
                        <Chip
                          key={item.id}
                          pressed={false}
                          onClick={() => {
                            setQuery('');
                            setPreviousUrlQuery('');
                            updateParams({ category: item.slug, query: null, page: null });
                          }}
                        >
                          {item.name}
                        </Chip>
                      ))}
                    </div>
                    <p className="text-[15px] text-muted">
                      Vous ne trouvez pas l’information ?{' '}
                      <TextLink to={ROUTES.contact} className="inline">
                        Posez-nous votre question
                      </TextLink>
                    </p>
                  </div>
                }
              />
            </Card>
          ) : null}

          <Pagination page={page} pageCount={pageCount} onChange={changePage} />

          <CtaBand
            icon="conversation"
            title={content.help.title}
            text={content.help.text}
            actions={
              <>
                <ButtonLink to={ROUTES.faq} variant="outline">
                  Voir la FAQ
                </ButtonLink>
                <ButtonLink to={ROUTES.contact} variant="dark" trailingIcon={<IconArrowRight />}>
                  Nous écrire
                </ButtonLink>
              </>
            }
          />
        </Container>
      </Section>
    </>
  );
}
