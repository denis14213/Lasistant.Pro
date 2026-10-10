import { faqQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { ClosingCta } from '@/components/marketing/CallToAction';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { FieldGallery } from '@/components/marketing/FieldGallery';
import { HeroMedia } from '@/components/marketing/HeroMedia';
import { PageHero } from '@/components/marketing/PageHero';
import { VerticalSteps } from '@/components/marketing/Steps';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  ButtonLink,
  Callout,
  Card,
  Container,
  Eyebrow,
  FeatureIcon,
  Lead,
  Pill,
  ResponsiveImage,
  Section,
  SectionHeader,
  TickList,
  ToValidate,
} from '@/components/ui';
import { IconArrowRight, IconCalendar, IconClock, IconConversation, IconInfo } from '@/components/ui/icons';
import { bookingFor, ROUTES } from '@/config/routes';
import { usePageContent } from '@/features/content/usePageContent';
import { FaqExcerpt } from '@/features/faq/FaqExcerpt';
import { RelatedServiceCard } from '@/features/services/RelatedServiceCard';
import { loadActiveService, useService } from '@/features/services/service-data';

const SLUG = 'assistance-medicale';

export async function loader() {
  await Promise.all([loadActiveService(SLUG), prefetch(faqQuery())]);
  return null;
}

/** Page « Assistance médicale » (cahier des charges § 6.3). */
export function Component() {
  const content = usePageContent('assistance-medicale');
  const service = useService(SLUG);
  const breadcrumbs = [
    { label: 'Accueil', to: ROUTES.home },
    { label: 'Nos services', to: ROUTES.services },
    { label: service.title },
  ];

  return (
    <>
      <Seo
        title={service.seo.title}
        description={service.seo.description}
        structuredData={breadcrumbTrailSchema(breadcrumbs, ROUTES.medicalAssistance)}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lead={content.hero.lead}
        actions={
          <>
            <ButtonLink to={service.ctaHref} size="lg" trailingIcon={<IconArrowRight />}>
              {service.ctaLabel}
            </ButtonLink>
            <ButtonLink to={bookingFor('echange-global')} variant="outline" size="lg" icon={<IconCalendar />}>
              Réserver un échange
            </ButtonLink>
          </>
        }
        note={
          <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-white py-2 pr-4 pl-2.5 text-sm text-ink-soft">
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <IconInfo className="size-4" aria-hidden />
            </span>
            {content.hero.note}
          </p>
        }
        aside={
          <HeroMedia
            image={content.hero.image}
            objectPosition="60% center"
            float={{ icon: <IconClock />, title: content.hero.floatTitle, text: content.hero.floatText }}
          />
        }
      />

      <Section spacing="sm" className="pt-0 md:pt-0" aria-label="Avertissement">
        <Container>
          <Callout tone="warning" icon={<IconInfo />} title={content.role.title} className="md:items-center md:px-8 md:py-7">
            <p>{content.role.text}</p>
          </Callout>
        </Container>
      </Section>

      <Section tone="paper" bordered aria-labelledby="ce-que-nous-faisons">
        <Container>
          <SectionHeader
            eyebrow={content.features.eyebrow}
            titleId="ce-que-nous-faisons"
            title={<AccentTitle value={content.features.title} />}
            aside={<Lead className="text-lg md:text-lg">{content.features.lead}</Lead>}
          />
          <FeatureGrid items={content.features.items} marker="icon" />
        </Container>
      </Section>

      <Section aria-labelledby="terrain">
        <Container>
          <SectionHeader
            eyebrow={content.field.eyebrow}
            titleId="terrain"
            title={<AccentTitle value={content.field.title} />}
            aside={<Lead className="text-lg md:text-lg">{content.field.lead}</Lead>}
          />
          <FieldGallery items={content.field.items} />
        </Container>
      </Section>

      <Section tone="paper" bordered aria-labelledby="preparation">
        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="flex flex-col gap-7">
            <Eyebrow>{content.preparation.eyebrow}</Eyebrow>
            <h2 id="preparation" className="text-h2 font-semibold">
              <AccentTitle value={content.preparation.title} />
            </h2>
            <Lead className="max-w-[560px] text-lg md:text-lg">{content.preparation.lead}</Lead>
            <VerticalSteps
              className="mt-4"
              steps={content.preparation.steps}
              firstStepMeta={
                <>
                  <Pill icon={<IconClock />}>1 h</Pill>
                  <Pill icon={<IconConversation />}>E-mail ou téléphone</Pill>
                </>
              }
            />
          </div>
          <aside className="lg:sticky lg:top-[140px]">
            <Card className="flex flex-col gap-5 p-6 shadow-raised md:p-8">
              <FeatureIcon icon="checklist" />
              <h3 className="text-2xl leading-[1.15] font-semibold tracking-[-0.02em]">{content.preparation.checklistTitle}</h3>
              <p className="text-[15px] text-muted">{content.preparation.checklistIntro}</p>
              <TickList items={content.preparation.checklist} />
              <Callout tone="privacy" size="sm">
                {content.preparation.privacyNote}
              </Callout>
              <ButtonLink to={bookingFor(service.id)} block trailingIcon={<IconArrowRight />}>
                Réserver mon premier échange
              </ButtonLink>
            </Card>
          </aside>
        </Container>
      </Section>

      <Section tone="sage" aria-labelledby="assistance-domicile">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="relative h-[340px] overflow-hidden rounded-[24px_160px_24px_24px] md:h-[560px] md:rounded-[32px_220px_32px_32px]">
            <ResponsiveImage
              image={content.homeCare.image}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-7">
            <Eyebrow tone="success">{content.homeCare.eyebrow}</Eyebrow>
            <h2 id="assistance-domicile" className="text-h2 font-semibold">
              <AccentTitle value={content.homeCare.title} tone="success" />
            </h2>
            <Lead className="text-lg md:text-lg">{content.homeCare.text}</Lead>
            <TickList
              items={content.homeCare.qualities}
              spacing="lg"
              className="md:grid md:grid-cols-2 md:gap-x-8 [&_li]:font-semibold [&_li]:text-ink"
            />
            <p className="text-[13.5px] text-muted">
              <ToValidate>{content.homeCare.pending}</ToValidate>
            </p>
          </div>
        </Container>
      </Section>

      <Section spacing="md" aria-labelledby="services-complementaires">
        <Container>
          <h2 id="services-complementaires" className="mb-7 text-h3 font-semibold">
            {content.relatedTitle}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {content.related.map((related) => (
              <RelatedServiceCard key={related.to} {...related} />
            ))}
          </div>
        </Container>
      </Section>

      <FaqExcerpt categoryId={content.faqCategory} title={content.faqTitle} />
      <ClosingCta to={service.ctaHref} />
    </>
  );
}
