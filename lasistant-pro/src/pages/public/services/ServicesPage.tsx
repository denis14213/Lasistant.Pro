import { useSuspenseQuery } from '@tanstack/react-query';
import { servicesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { CtaBand } from '@/components/marketing/CallToAction';
import { PageHero } from '@/components/marketing/PageHero';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import { ButtonAnchor, ButtonLink, Container, Section } from '@/components/ui';
import { IconArrowRight, IconCalendar, IconPhone } from '@/components/ui/icons';
import { bookingFor, ROUTES } from '@/config/routes';
import { usePageContent } from '@/features/content/usePageContent';
import { ServiceFinder } from '@/features/services/ServiceFinder';
import { ServiceRow } from '@/features/services/ServiceRow';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

export const loader = () => prefetch(servicesQuery());

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Nos services' }];

/** Page « Nos services » (cahier des charges § 6.2). */
export function Component() {
  const content = usePageContent('services');
  const { data: services } = useSuspenseQuery(servicesQuery());
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const pages = services.filter((service) => service.kind === 'page');

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.services)}
      />
      <PageHero
        breadcrumbs={BREADCRUMBS}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lead={content.hero.lead}
        actions={
          <>
            <ButtonLink to={ROUTES.booking} size="lg" trailingIcon={<IconArrowRight />}>
              Demander un accompagnement
            </ButtonLink>
            <ButtonLink to={bookingFor('echange-global')} variant="outline" size="lg" icon={<IconCalendar />}>
              Réserver un échange de 1 h
            </ButtonLink>
          </>
        }
        aside={<ServiceFinder />}
      />

      <Section tone="paper" bordered aria-label="Détail des services">
        <Container>
          {pages.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              position={index + 1}
              image={content.rowImages[service.slug as keyof typeof content.rowImages]}
              reversed={index % 2 === 1}
            />
          ))}
        </Container>
      </Section>

      <Section spacing="md" aria-labelledby="aide-choix">
        <Container>
          <CtaBand
            icon="orientation"
            titleId="aide-choix"
            title={content.help.title}
            text={content.help.text}
            actions={
              <>
                <ButtonLink to={bookingFor('echange-global')} variant="dark" trailingIcon={<IconArrowRight />}>
                  {content.help.cta.label}
                </ButtonLink>
                {phone ? (
                  <ButtonAnchor href={phoneHref(phone)} variant="outline" icon={<IconPhone />}>
                    Appeler
                  </ButtonAnchor>
                ) : null}
              </>
            }
          />
        </Container>
      </Section>
    </>
  );
}
