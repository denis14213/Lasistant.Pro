import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { CtaBand } from '@/components/marketing/CallToAction';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema, localBusinessSchema } from '@/components/seo/structured-data';
import { AccentTitle, Breadcrumbs, ButtonAnchor, Container, Eyebrow, Lead, Section } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { CONTACT_CONTENT } from '@/content/pages/public';
import { ContactCards } from '@/features/contact/ContactCards';
import { ContactForm } from '@/features/contact/ContactForm';
import { ContactMap } from '@/features/contact/ContactMap';
import { primaryEmail, useSiteSettings } from '@/features/settings/useSiteSettings';

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Contact' }];

/** Page « Contact » (cahier des charges § 6.10). */
export function Component() {
  const content = CONTACT_CONTENT;
  const settings = useSiteSettings();
  const email = primaryEmail(settings);

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={[
          breadcrumbTrailSchema(BREADCRUMBS, ROUTES.contact),
          ...(settings.seo.structuredData ? [localBusinessSchema(settings)] : []),
        ]}
      />
      <section aria-labelledby="titre-page" className="relative overflow-hidden pt-4 pb-14 md:pt-9 md:pb-22">
        <BrandSwoosh className="absolute -top-10 -right-24 z-0 size-[340px] md:-top-15 md:-right-35 md:size-[560px]" />
        <Container className="relative">
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="relative z-[2] grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="flex flex-col gap-7">
              <Eyebrow>{content.hero.eyebrow}</Eyebrow>
              <h1 id="titre-page" className="text-h1 font-semibold">
                <AccentTitle value={content.hero.title} />
              </h1>
              <Lead className="max-w-[540px]">{content.hero.lead}</Lead>
              <div className="mt-2">
                <ContactCards />
              </div>
            </div>
            <div className="rounded-[22px] bg-white px-5 py-6 shadow-raised md:rounded-[28px] md:p-9">
              <ContactForm titleId="formulaire-contact" />
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="sm" className="pt-0 md:pt-0" aria-label="Plan d’accès">
        <Container>
          <ContactMap />
        </Container>
      </Section>

      <Section spacing="md" aria-labelledby="partenaires">
        <Container>
          <CtaBand
            tone="sage"
            icon="partner"
            titleId="partenaires"
            title={content.partners.title}
            text={content.partners.text}
            actions={
              email ? (
                <ButtonAnchor
                  href={`mailto:${email}?subject=${encodeURIComponent('Partenariat')}`}
                  variant="success"
                  trailingIcon={<IconArrowRight />}
                >
                  {content.partners.cta}
                </ButtonAnchor>
              ) : null
            }
          />
        </Container>
      </Section>
    </>
  );
}
