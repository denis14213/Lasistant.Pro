import { useSuspenseQuery } from '@tanstack/react-query';
import { categoriesQuery, servicesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import { Breadcrumbs, Card, Container, Eyebrow, Lead, Section, TextLink } from '@/components/ui';
import { env } from '@/config/env';
import { SITEMAP_GROUPS, type NavItem } from '@/config/navigation';
import { ROUTES, servicePath } from '@/config/routes';
import { SITEMAP_CONTENT } from '@/content/pages/public';
import { cn } from '@/lib/cn';

export const loader = () => prefetch(servicesQuery(), categoriesQuery());

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Plan du site' }];

interface SitemapGroup {
  id: string;
  title: string;
  links: NavItem[];
  wide?: boolean;
}

/**
 * Plan du site : toutes les pages publiques, y compris les services et catégories actifs.
 * Les titres de groupe suffisent à s'orienter : aucune icône décorative par carte.
 */
export function Component() {
  const content = SITEMAP_CONTENT;
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const [discover, requests, articles, legal] = SITEMAP_GROUPS;

  const groups: SitemapGroup[] = [
    ...(discover ? [discover] : []),
    {
      id: 'services',
      title: 'Nos services',
      links: [
        { label: 'Tous nos services', to: ROUTES.services },
        ...services
          .filter((service) => service.kind === 'page')
          .map((service) => ({ label: service.title, to: servicePath(service.slug) })),
      ],
    },
    ...(requests ? [requests] : []),
    ...(articles
      ? [
          {
            ...articles,
            links: [
              ...articles.links,
              ...categories.map((category) => ({
                label: category.name,
                to: `${ROUTES.articles}?categorie=${encodeURIComponent(category.slug)}`,
              })),
            ],
          },
        ]
      : []),
    ...(legal ? [{ ...legal, wide: true }] : []),
  ];

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.sitemap)}
      />
      <section aria-labelledby="titre-page" className="pt-4 pb-12 md:pt-9 md:pb-14">
        <Container>
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="flex max-w-[900px] flex-col gap-6.5">
            <Eyebrow>{content.hero.eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-h1 font-semibold">
              {content.hero.title}
            </h1>
            <Lead>{content.hero.lead}</Lead>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Pages du site">
        <Container className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <nav
              key={group.id}
              aria-labelledby={`plan-${group.id}`}
              className={cn('flex flex-col gap-5 rounded-card border border-line bg-paper p-6 md:p-8', group.wide && 'md:col-span-2')}
            >
              <h2 id={`plan-${group.id}`} className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
                {group.title}
              </h2>
              <ul className={cn('flex flex-col gap-3', group.wide && 'sm:grid sm:grid-cols-2 sm:gap-2.5')}>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <TextLink to={link.to}>{link.label}</TextLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <Card className="flex flex-col gap-5 border-brand-200 bg-mist p-6 md:col-span-2 md:p-8">
            <h2 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">{content.technical.title}</h2>
            <p className="text-[15px] text-muted">{content.technical.text}</p>
            <a href="/sitemap.xml" className="w-fit font-mono text-[12.5px] tracking-[0.02em] text-ink-soft hover:text-brand">
              {env.siteUrl.replace(/^https?:\/\//, '')}/sitemap.xml
            </a>
          </Card>
        </Container>
      </Section>
    </>
  );
}
