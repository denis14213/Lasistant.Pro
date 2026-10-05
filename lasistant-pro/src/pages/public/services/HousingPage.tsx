import { ClosingCta } from '@/components/marketing/CallToAction';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { HeroMedia } from '@/components/marketing/HeroMedia';
import { PageHero } from '@/components/marketing/PageHero';
import { StepsTimeline } from '@/components/marketing/Steps';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  ButtonAnchor,
  ButtonLink,
  Container,
  Eyebrow,
  Lead,
  Pill,
  ResponsiveImage,
  Section,
  SectionHeader,
  TextAnchor,
  TickList,
} from '@/components/ui';
import { IconArrowRight, IconCalendar, IconEmail, IconKey, IconPhone } from '@/components/ui/icons';
import { bookingFor, ROUTES } from '@/config/routes';
import { HOUSING_CONTENT } from '@/content/pages/services';
import { HousingSearchForm } from '@/features/housing/HousingSearchForm';
import { loadActiveService, useService } from '@/features/services/service-data';
import { primaryEmail, primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

const SLUG = 'logement-hebergement';

export const loader = () => loadActiveService(SLUG);

/** Page « Logement & hébergement » et formulaire de recherche (cahier des charges § 6.4). */
export function Component() {
  const content = HOUSING_CONTENT;
  const service = useService(SLUG);
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);
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
        structuredData={breadcrumbTrailSchema(breadcrumbs, ROUTES.housing)}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lead={content.hero.lead}
        actions={
          <>
            <ButtonAnchor href="#recherche" size="lg" trailingIcon={<IconArrowRight />}>
              Lancer ma recherche
            </ButtonAnchor>
            <ButtonLink to={bookingFor(service.id)} variant="outline" size="lg" icon={<IconCalendar />}>
              Réserver un échange
            </ButtonLink>
          </>
        }
        aside={
          <HeroMedia
            image={content.hero.image}
            alt="Salon lumineux d’un appartement meublé"
            float={{ icon: <IconKey />, title: content.hero.floatTitle, text: content.hero.floatText, tone: 'success' }}
          />
        }
      />

      <Section tone="paper" bordered aria-labelledby="profils">
        <Container>
          <SectionHeader eyebrow={content.profiles.eyebrow} titleId="profils" title={<AccentTitle value={content.profiles.title} />} />
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            {content.profiles.items.map((profile) => (
              <article key={profile.tag} className="flex flex-col overflow-hidden rounded-card border border-line bg-paper">
                <div className="aspect-[16/9] overflow-hidden bg-mist">
                  <ResponsiveImage
                    image={profile.image}
                    alt=""
                    sizes="(min-width: 768px) 600px, 100vw"
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3.5 p-6 md:p-8">
                  <span className="text-[12.5px] font-semibold tracking-[0.13em] text-success uppercase">{profile.tag}</span>
                  <h3 className="text-h3 font-semibold">{profile.title}</h3>
                  <p className="text-base text-muted">{profile.text}</p>
                  <TickList items={profile.points} />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="solutions">
        <Container>
          <SectionHeader
            eyebrow={content.solutions.eyebrow}
            titleId="solutions"
            title={<AccentTitle value={content.solutions.title} />}
            aside={<Lead className="text-lg md:text-lg">{content.solutions.lead}</Lead>}
          />
          <FeatureGrid items={content.solutions.items} marker="icon" tone="success" />
          <div className="mt-9 flex flex-wrap items-center gap-2.5">
            <span className="mr-2 text-[15px] text-muted">{content.solutions.criteriaLabel}</span>
            {content.solutions.criteria.map((criterion) => (
              <Pill key={criterion}>{criterion}</Pill>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="night" spacing="md" aria-labelledby="methode">
        <Container>
          <SectionHeader
            tone="dark"
            eyebrow={content.method.eyebrow}
            titleId="methode"
            title={<AccentTitle value={content.method.title} tone="light" />}
            className="md:mb-12"
          />
          <StepsTimeline steps={content.method.steps} columns={3} />
        </Container>
      </Section>

      <Section id="recherche" tone="mist" className="scroll-mt-24" aria-labelledby="recherche-titre">
        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="flex flex-col gap-7 lg:sticky lg:top-[140px]">
            <Eyebrow>{content.form.eyebrow}</Eyebrow>
            <h2 id="recherche-titre" className="text-h2 font-semibold">
              <AccentTitle value={content.form.title} />
            </h2>
            <Lead className="text-lg md:text-lg">{content.form.lead}</Lead>
            <TickList items={content.form.promises} />
            <div className="flex flex-col gap-3 rounded-box border border-line bg-paper p-6">
              <p className="text-[15px] font-semibold">Vous préférez en parler ?</p>
              {phone ? (
                <TextAnchor href={phoneHref(phone)} icon={<IconPhone />}>
                  {phone}
                </TextAnchor>
              ) : null}
              {email ? (
                <TextAnchor href={`mailto:${email}`} icon={<IconEmail />} className="break-all">
                  {email}
                </TextAnchor>
              ) : null}
            </div>
          </div>
          <div className="rounded-[22px] bg-white px-5 py-6 shadow-raised md:rounded-[28px] md:p-9">
            <HousingSearchForm titleId="recherche-titre" />
          </div>
        </Container>
      </Section>

      <ClosingCta to={bookingFor(service.id)} />
    </>
  );
}
