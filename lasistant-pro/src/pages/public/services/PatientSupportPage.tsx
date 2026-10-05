import { ClosingCta } from '@/components/marketing/CallToAction';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { HeroMedia } from '@/components/marketing/HeroMedia';
import { PageHero } from '@/components/marketing/PageHero';
import { NumberedSteps } from '@/components/marketing/Steps';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  ButtonAnchor,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Lead,
  ResponsiveImage,
  Section,
  SectionHeader,
  Tag,
  TickList,
  ToValidate,
} from '@/components/ui';
import { IconArrival, IconArrowRight, IconExcluded, IconPhone, IconWarning } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { PATIENT_SUPPORT_CONTENT } from '@/content/pages/services';
import { loadActiveService, useService } from '@/features/services/service-data';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

const SLUG = 'accompagnement-des-malades';

export const loader = () => loadActiveService(SLUG);

/** Page « Accompagnement des malades » (cahier des charges § 6.5). */
export function Component() {
  const content = PATIENT_SUPPORT_CONTENT;
  const service = useService(SLUG);
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
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
        structuredData={breadcrumbTrailSchema(breadcrumbs, ROUTES.patientSupport)}
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
            {phone ? (
              <ButtonAnchor href={phoneHref(phone)} variant="outline" size="lg" icon={<IconPhone />}>
                Nous appeler
              </ButtonAnchor>
            ) : null}
          </>
        }
        aside={
          <HeroMedia
            image={content.hero.image}
            alt="Un couple âgé se promène dans un jardin arboré"
            objectPosition="center 58%"
            float={{ icon: <IconArrival />, title: content.hero.floatTitle, text: content.hero.floatText, tone: 'gold' }}
          />
        }
      />

      <Section tone="paper" bordered aria-labelledby="engagement">
        <Container>
          <SectionHeader eyebrow={content.pillars.eyebrow} titleId="engagement" title={<AccentTitle value={content.pillars.title} />} />
          <FeatureGrid items={content.pillars.items} />
        </Container>
      </Section>

      <Section aria-labelledby="personnes-agees">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="flex flex-col gap-7">
            <Eyebrow>{content.seniors.eyebrow}</Eyebrow>
            <h2 id="personnes-agees" className="text-h2 font-semibold">
              <AccentTitle value={content.seniors.title} />
            </h2>
            <Lead className="text-lg md:text-lg">{content.seniors.text}</Lead>
            <TickList
              items={content.seniors.points.map((point) =>
                'pending' in point ? (
                  <>
                    {point.label} <ToValidate>{point.pending}</ToValidate>
                  </>
                ) : (
                  point.label
                ),
              )}
            />
            <ButtonLink to={service.ctaHref} className="w-fit max-md:w-full" trailingIcon={<IconArrowRight />}>
              {service.ctaLabel}
            </ButtonLink>
          </div>
          <div className="relative h-[340px] overflow-hidden rounded-[160px_24px_24px_24px] md:h-[580px] md:rounded-[220px_32px_32px_32px]">
            <ResponsiveImage
              image={content.seniors.image}
              alt="Une soignante échange avec une patiente âgée souriante"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="size-full object-cover"
            />
          </div>
        </Container>
      </Section>

      <Section tone="mist" aria-labelledby="perimetre">
        <Container>
          <SectionHeader
            eyebrow={content.scope.eyebrow}
            titleId="perimetre"
            title={<AccentTitle value={content.scope.title} />}
            aside={
              <Tag tone="gold" icon={<IconWarning />} className="w-fit">
                {content.scope.pendingLabel}
              </Tag>
            }
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-5 p-6 md:p-8">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">Inclus</h3>
              <TickList items={content.scope.included} spacing="lg" />
            </Card>
            <Card className="flex flex-col gap-5 p-6 md:p-8">
              <h3 className="text-2xl font-semibold tracking-[-0.02em]">Non inclus</h3>
              <ul className="flex flex-col gap-3.5">
                {content.scope.excluded.map((item) => {
                  const pending = 'pending' in item ? item.pending : null;
                  return (
                    <li key={item.label || pending} className="flex items-start gap-3 text-[15.5px] text-ink-soft">
                      <IconExcluded className="mt-[3px] size-4 shrink-0 text-muted" aria-hidden />
                      <span>
                        {item.label}
                        {item.label && pending ? ' ' : null}
                        {pending ? <ToValidate>{pending}</ToValidate> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      <Section spacing="md" aria-labelledby="deroulement">
        <Container>
          <SectionHeader
            eyebrow={content.steps.eyebrow}
            titleId="deroulement"
            title={content.steps.title}
            titleClassName="text-[clamp(1.875rem,2.8vw,2.5rem)] max-[359px]:text-[min(1.875rem,9.3vw)]"
            className="md:mb-11"
          />
          <NumberedSteps steps={content.steps.items} />
        </Container>
      </Section>

      <ClosingCta to={service.ctaHref} />
    </>
  );
}
