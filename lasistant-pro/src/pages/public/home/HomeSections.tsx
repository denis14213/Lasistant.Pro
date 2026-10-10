import { useSuspenseQuery } from '@tanstack/react-query';
import { publishedArticlesQuery, servicesQuery } from '@/api';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { LogoMark } from '@/components/brand/Logo';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { FieldGallery } from '@/components/marketing/FieldGallery';
import { StepsTimeline } from '@/components/marketing/Steps';
import { ValuesStrip } from '@/components/marketing/ValuesStrip';
import {
  AccentTitle,
  ButtonLink,
  Container,
  Eyebrow,
  Icon,
  IconBox,
  Lead,
  ResponsiveImage,
  Section,
  SectionHeader,
  TextLink,
} from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { ArticleCard } from '@/features/articles/ArticleCard';
import { useCategoryLookup } from '@/features/articles/useCategoryLookup';
import { ContactChannels } from '@/features/contact/ContactChannels';
import { usePageContent } from '@/features/content/usePageContent';
import { QuickRequestForm } from '@/features/requests/QuickRequestForm';
import { ServiceCard } from '@/features/services/ServiceCard';

/**
 * Sections de la page d'accueil, dans l'ordre d'affichage.
 */

export function HomeServices() {
  const { services } = usePageContent('accueil');
  const { data } = useSuspenseQuery(servicesQuery());
  const pages = data.filter((service) => service.kind === 'page');
  return (
    <Section tone="paper" aria-labelledby="accueil-services">
      <Container>
        <SectionHeader
          eyebrow={services.eyebrow}
          titleId="accueil-services"
          title={<AccentTitle value={services.title} />}
          aside={
            <>
              <Lead className="text-lg md:text-lg">{services.lead}</Lead>
              <TextLink to={ROUTES.services} arrow>
                {services.linkLabel}
              </TextLink>
            </>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((service, index) => (
            <ServiceCard key={service.id} service={service} position={index + 1} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Moments réels d'accompagnement : aéroport, accueil, consultations, déplacements. */
export function HomeField() {
  const { field } = usePageContent('accueil');
  return (
    <Section aria-labelledby="accueil-terrain">
      <Container>
        <SectionHeader
          eyebrow={field.eyebrow}
          titleId="accueil-terrain"
          title={<AccentTitle value={field.title} />}
          aside={<Lead className="text-lg md:text-lg">{field.lead}</Lead>}
        />
        <FieldGallery items={field.items} layout="mosaic" />
      </Container>
    </Section>
  );
}

/** Raisons concrètes de faire confiance à l'équipe. */
export function HomeTrust() {
  const { trust } = usePageContent('accueil');
  return (
    <Section tone="paper" aria-labelledby="accueil-confiance">
      <Container>
        <SectionHeader
          eyebrow={trust.eyebrow}
          titleId="accueil-confiance"
          title={<AccentTitle value={trust.title} />}
          aside={
            <>
              <Lead className="text-lg md:text-lg">{trust.lead}</Lead>
              <TextLink to={ROUTES.about} arrow>
                {trust.linkLabel}
              </TextLink>
            </>
          }
        />
        <FeatureGrid items={trust.items} columns={3} />
      </Container>
    </Section>
  );
}

export function HomeEngagement() {
  const { engagement } = usePageContent('accueil');
  const { supportQuote, signature } = usePageContent('identite');
  return (
    <Section aria-labelledby="accueil-engagement">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-22">
        <div className="relative h-[400px] overflow-hidden rounded-[24px_24px_160px_24px] bg-mist md:h-[640px] md:rounded-[32px_32px_240px_32px]">
          <ResponsiveImage
            image={engagement.image}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="size-full object-cover"
          />
          <div className="absolute right-6 bottom-6 left-6 flex max-w-[360px] items-center gap-3.5 rounded-[20px] bg-white/94 px-5 py-4.5 backdrop-blur-sm">
            <IconBox icon="care" tone="success" className="size-[46px]" />
            <p className="text-[14.5px] leading-[1.4]">
              <strong className="block text-[15px] font-semibold">{engagement.badgeTitle}</strong>
              {engagement.badgeText}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <Eyebrow>{engagement.eyebrow}</Eyebrow>
          <h2
            id="accueil-engagement"
            className="text-[clamp(1.75rem,2.6vw,2.5rem)] max-[359px]:text-[min(1.75rem,9.3vw)] leading-[1.18] font-medium tracking-[-0.028em]"
          >
            <AccentTitle value={engagement.statement} />
          </h2>
          <Lead className="text-lg md:text-lg">{engagement.text}</Lead>
          <figure className="flex gap-4.5 rounded-[22px] bg-mist px-6 py-6 md:px-7 md:py-6.5">
            <span className="accent h-9 shrink-0 text-[72px] leading-[0.7] text-brand" aria-hidden>
              “
            </span>
            <div>
              <blockquote className="text-[17px] text-ink-soft italic">{supportQuote}</blockquote>
              <figcaption className="mt-3.5 flex items-center gap-3 text-sm font-semibold">
                <LogoMark size={30} />
                {signature}
              </figcaption>
            </div>
          </figure>
          <TextLink to={ROUTES.about} arrow>
            {engagement.linkLabel}
          </TextLink>
        </div>
      </Container>
    </Section>
  );
}

export function HomeJourney() {
  const { journey } = usePageContent('accueil');
  const { journey: steps } = usePageContent('identite');
  return (
    <Section tone="night" className="relative overflow-hidden" aria-labelledby="accueil-parcours">
      <BrandSwoosh className="absolute -top-30 -right-40 size-[620px] opacity-12" />
      <Container className="relative">
        <SectionHeader
          tone="dark"
          eyebrow={journey.eyebrow}
          titleId="accueil-parcours"
          title={<AccentTitle value={journey.title} tone="light" />}
          aside={
            <Lead tone="on-dark" className="text-lg md:text-lg">
              {journey.lead}
            </Lead>
          }
        />
        <StepsTimeline steps={steps} />
        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/12 pt-10 md:mt-18">
          <p className="text-xl font-medium tracking-[-0.01em]">{journey.ctaText}</p>
          <div className="flex flex-wrap gap-3 max-md:*:w-full">
            <ButtonLink to={journey.primaryCta.to} variant="light" trailingIcon={<IconArrowRight />}>
              {journey.primaryCta.label}
            </ButtonLink>
            <ButtonLink to={journey.secondaryCta.to} variant="outline-light">
              {journey.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function HomeAudiences() {
  const { audiences } = usePageContent('accueil');
  const { audiences: profiles } = usePageContent('identite');
  return (
    <Section aria-labelledby="accueil-publics">
      <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="flex flex-col gap-7 lg:sticky lg:top-[140px]">
          <Eyebrow>{audiences.eyebrow}</Eyebrow>
          <h2 id="accueil-publics" className="text-h2 font-semibold">
            <AccentTitle value={audiences.title} />
          </h2>
          <Lead className="text-lg md:text-lg">{audiences.lead}</Lead>
          <div className="h-[340px] overflow-hidden rounded-[28px_140px_28px_28px]">
            <ResponsiveImage
              image={audiences.image}
              sizes="(min-width: 1024px) 460px, 100vw"
              className="size-full object-cover object-[center_30%]"
            />
          </div>
        </div>
        <ul>
          {profiles.map((audience) => (
            <li
              key={audience.id}
              className="group grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-line py-5.5 first:border-t md:grid-cols-[56px_minmax(0,1fr)_auto] md:gap-x-7 md:py-7"
            >
              <span
                className="row-span-2 flex size-12 items-center justify-center self-start rounded-2xl bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white md:row-span-1 md:size-14 md:self-center"
                aria-hidden
              >
                <Icon name={audience.icon} weight="duotone" className="size-6 md:size-7" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold tracking-[-0.015em]">{audience.title}</h3>
                <p className="text-[15.5px] text-muted">{audience.need}</p>
              </div>
              <TextLink to={audience.cta.to} arrow className="col-start-2 md:col-start-auto">
                {audience.cta.label}
              </TextLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function HomeValues() {
  const { values } = usePageContent('accueil');
  return (
    <Section tone="paper" spacing="md" bordered className="border-b border-line" aria-labelledby="accueil-valeurs">
      <Container>
        <div className="mb-10 flex flex-col gap-5">
          <Eyebrow>{values.eyebrow}</Eyebrow>
          <h2 id="accueil-valeurs" className="text-[32px] leading-[1.15] font-semibold tracking-[-0.028em]">
            {values.title}
          </h2>
        </div>
        <ValuesStrip />
      </Container>
    </Section>
  );
}

export function HomeNews() {
  const { news } = usePageContent('accueil');
  const { data: articles } = useSuspenseQuery(publishedArticlesQuery());
  const categoryOf = useCategoryLookup();
  const latest = articles.slice(0, 3);
  if (latest.length === 0) return null;
  return (
    <Section aria-labelledby="accueil-actualites">
      <Container>
        <SectionHeader
          eyebrow={news.eyebrow}
          titleId="accueil-actualites"
          title={<AccentTitle value={news.title} />}
          aside={
            <ButtonLink to={ROUTES.articles} variant="outline" className="w-fit" trailingIcon={<IconArrowRight />}>
              {news.linkLabel}
            </ButtonLink>
          }
        />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {latest.map((article) => (
            <ArticleCard key={article.id} article={article} category={categoryOf(article.categoryId)} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function HomeContact() {
  const { contact } = usePageContent('accueil');
  return (
    <Section className="pt-0 md:pt-0" aria-labelledby="accueil-contact">
      <Container>
        <div className="relative grid grid-cols-1 items-start gap-9 overflow-hidden rounded-[28px] bg-plum px-5.5 py-10 text-white md:rounded-[40px] md:px-10 md:py-14 lg:grid-cols-2 lg:gap-16 lg:p-18">
          <BrandSwoosh secondBlade="green" className="absolute -right-30 -bottom-50 size-[620px] opacity-55" />
          <div className="relative flex flex-col gap-7">
            <Eyebrow tone="light">{contact.eyebrow}</Eyebrow>
            <h2 id="accueil-contact" className="text-h2 font-semibold">
              <AccentTitle value={contact.title} tone="light" />
            </h2>
            <Lead tone="on-dark" className="text-lg md:text-lg">
              {contact.lead}
            </Lead>
            <ContactChannels />
          </div>
          <div className="relative rounded-[22px] bg-white px-5 py-6 text-ink shadow-float md:rounded-[28px] md:p-9">
            <QuickRequestForm titleId="demande-rapide-titre" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
