import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { faqQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { CtaBand } from '@/components/marketing/CallToAction';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema, faqSchema } from '@/components/seo/structured-data';
import {
  Accordion,
  AccentTitle,
  Breadcrumbs,
  Button,
  ButtonAnchor,
  ButtonLink,
  Card,
  Container,
  EmptyState,
  Eyebrow,
  IconButton,
  Lead,
  Section,
} from '@/components/ui';
import { IconArrowRight, IconClose, IconPhone, IconSearch } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { FAQ_CONTENT } from '@/content/pages/public';
import { FaqAnswer } from '@/features/faq/FaqAnswer';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { phoneHref } from '@/lib/format';
import { matchesQuery, pluralize } from '@/lib/text';

export const loader = () => prefetch(faqQuery());

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Questions fréquentes' }];

/** Questions fréquentes, par thème et avec recherche (cahier des charges § 6.11). */
export function Component() {
  const content = FAQ_CONTENT;
  const { data } = useSuspenseQuery(faqQuery());
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // Une seule réponse ouverte à la fois sur toute la page ; la première est ouverte par défaut.
  const [openId, setOpenId] = useState<string | null>(data.items[0]?.id ?? null);

  const trimmed = query.trim();
  const groups = data.categories
    .filter((category) => !categoryId || category.id === categoryId)
    .map((category) => ({
      category,
      items: data.items.filter(
        (item) => item.categoryId === category.id && matchesQuery(`${item.question} ${item.answer}`, trimmed),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const resultCount = groups.reduce((total, group) => total + group.items.length, 0);
  const countFor = (id: string | null) =>
    id ? data.items.filter((item) => item.categoryId === id).length : data.items.length;

  const navItems = [
    { id: null, name: content.allLabel },
    ...data.categories.map((category) => ({ id: category.id, name: category.name })),
  ];

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={[
          breadcrumbTrailSchema(BREADCRUMBS, ROUTES.faq),
          faqSchema(data.items.map((item) => ({ question: item.question, answer: item.answer }))),
        ]}
      />
      <section aria-labelledby="titre-page" className="relative overflow-hidden pt-4 pb-12 md:pt-9 md:pb-16">
        <BrandSwoosh className="absolute -top-10 -right-24 z-0 size-[340px] md:-top-15 md:-right-35 md:size-[560px]" />
        <Container className="relative">
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="relative z-[2] flex max-w-[900px] flex-col gap-6.5">
            <Eyebrow>{content.hero.eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-h1 font-semibold">
              <AccentTitle value={content.hero.title} />
            </h1>
            <Lead className="max-w-[640px]">{content.hero.lead}</Lead>
            <label className="flex h-14 w-full max-w-[560px] items-center gap-2.5 rounded-full border border-line-strong bg-white px-5 text-muted focus-within:border-brand focus-within:shadow-focus">
              <IconSearch className="size-4.5 shrink-0" aria-hidden />
              <span className="sr-only">Rechercher une question</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une question, par ex. « logement étudiant »"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <IconButton label="Effacer la recherche" variant="ghost" size="sm" onClick={() => setQuery('')}>
                  <IconClose aria-hidden />
                </IconButton>
              ) : null}
            </label>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Questions par thème">
        <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-18">
          <nav aria-label="Thèmes" className="flex gap-1 relative overflow-x-auto max-lg:-mx-1 max-lg:px-1 max-lg:pb-1 lg:sticky lg:top-[120px] lg:flex-col">
            {navItems.map((item) => {
              const active = item.id === categoryId;
              return (
                <button
                  key={item.id ?? 'toutes'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryId(item.id)}
                  className={cn(
                    'flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-[13px] text-left text-[15.5px] font-medium whitespace-nowrap text-muted transition-colors hover:bg-mist hover:text-ink',
                    active && 'bg-white font-semibold text-ink shadow-soft hover:bg-white',
                  )}
                >
                  {item.name}
                  <span className="text-[13px] font-normal text-muted">{countFor(item.id)}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex min-w-0 flex-col gap-14">
            {trimmed ? (
              <p role="status" className="border-b border-line pb-4 text-[19px] font-medium tracking-[-0.01em]">
                {pluralize(resultCount, 'question')} pour « {trimmed} »
              </p>
            ) : null}

            {groups.length === 0 ? (
              <Card className="py-4">
                <EmptyState
                  icon={<IconSearch />}
                  headingLevel="h2"
                  title={`Aucune question ne correspond à « ${trimmed} »`}
                  description="Essayez un autre mot-clé, ou posez-nous directement votre question : nous vous répondons par téléphone ou par e-mail."
                  actions={
                    <>
                      <Button variant="outline" onClick={() => setQuery('')}>
                        Effacer la recherche
                      </Button>
                      <ButtonLink to={ROUTES.contact} variant="dark" trailingIcon={<IconArrowRight />}>
                        Poser ma question
                      </ButtonLink>
                    </>
                  }
                />
              </Card>
            ) : (
              groups.map((group) => (
                <section key={group.category.id} aria-labelledby={`theme-${group.category.id}`}>
                  <h2 id={`theme-${group.category.id}`} className="mb-2 text-2xl font-semibold tracking-[-0.02em]">
                    {group.category.name}
                  </h2>
                  <Accordion
                    openId={openId}
                    onOpenChange={setOpenId}
                    items={group.items.map((item) => ({
                      id: item.id,
                      title: item.question,
                      content: <FaqAnswer item={item} />,
                    }))}
                  />
                </section>
              ))
            )}

            <CtaBand
              icon="conversation"
              title={content.help.title}
              text={content.help.text}
              actions={
                <>
                  {phone ? (
                    <ButtonAnchor href={phoneHref(phone)} variant="outline" icon={<IconPhone />}>
                      Appeler
                    </ButtonAnchor>
                  ) : null}
                  <ButtonLink to={ROUTES.contact} variant="dark" trailingIcon={<IconArrowRight />}>
                    Nous écrire
                  </ButtonLink>
                </>
              }
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
