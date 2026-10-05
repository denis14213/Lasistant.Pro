import { servicesQuery, takenSlotsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  Breadcrumbs,
  ButtonAnchor,
  Callout,
  Container,
  Eyebrow,
  Lead,
  Pill,
  Section,
} from '@/components/ui';
import { IconClock, IconEmail, IconLock, IconPhone } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { BOOKING_CONTENT } from '@/content/pages/public';
import { BookingWizard } from '@/features/booking/BookingWizard';
import { primaryEmail, primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

export const loader = () => prefetch(servicesQuery(), takenSlotsQuery());

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Réservation en ligne' }];

/** Page « Réservation en ligne » (cahier des charges § 6.7). */
export function Component() {
  const content = BOOKING_CONTENT;
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.booking)}
      />
      <section aria-labelledby="titre-page" className="pt-4 pb-10 md:pt-9 md:pb-12">
        <Container>
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="flex max-w-[900px] flex-col gap-5">
              <Eyebrow>{content.hero.eyebrow}</Eyebrow>
              <h1 id="titre-page" className="text-[clamp(2.25rem,3.8vw,3.5rem)] max-[359px]:text-[min(2.25rem,9.3vw)] leading-[1.03] font-semibold tracking-[-0.036em]">
                <AccentTitle value={content.hero.title} />
              </h1>
              <Lead className="max-w-[640px]">{content.hero.lead}</Lead>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Pill icon={<IconClock />}>{content.hero.pills[0]}</Pill>
              <Pill icon={<IconLock />}>{content.hero.pills[1]}</Pill>
            </div>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Formulaire de réservation">
        <Container>
          {settings.booking.enabled ? (
            <BookingWizard />
          ) : (
            <Callout
              tone="warning"
              title="La réservation en ligne est momentanément indisponible"
              actions={
                <>
                  {phone ? (
                    <ButtonAnchor href={phoneHref(phone)} variant="dark" size="sm" icon={<IconPhone />}>
                      {phone}
                    </ButtonAnchor>
                  ) : null}
                  {email ? (
                    <ButtonAnchor href={`mailto:${email}`} variant="outline" size="sm" icon={<IconEmail />}>
                      Écrire un e-mail
                    </ButtonAnchor>
                  ) : null}
                </>
              }
            >
              <p>Notre équipe reste joignable par téléphone et par e-mail pour organiser votre premier échange.</p>
            </Callout>
          )}
        </Container>
      </Section>
    </>
  );
}
