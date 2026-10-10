import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { LogoMark } from '@/components/brand/Logo';
import { ClosingCta } from '@/components/marketing/CallToAction';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { FieldGallery } from '@/components/marketing/FieldGallery';
import { HeroMedia } from '@/components/marketing/HeroMedia';
import { PageHero } from '@/components/marketing/PageHero';
import { ValuesStrip } from '@/components/marketing/ValuesStrip';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionHeader,
  Tag,
  TextLink,
  ToValidate,
} from '@/components/ui';
import { IconAddress, IconArrowRight, IconCamera, IconHistory } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { MapPlaceholder } from '@/features/contact/MapPlaceholder';
import { usePageContent } from '@/features/content/usePageContent';
import { useSiteSettings } from '@/features/settings/useSiteSettings';

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'À propos' }];

/** Page « À propos » (cahier des charges § 6.6). */
export function Component() {
  const content = usePageContent('a-propos');
  const { signature } = usePageContent('identite');
  const settings = useSiteSettings();

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.about)}
      />
      <PageHero
        breadcrumbs={BREADCRUMBS}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lead={content.hero.lead}
        actions={
          <>
            <ButtonLink to={ROUTES.contact} size="lg" trailingIcon={<IconArrowRight />}>
              Nous contacter
            </ButtonLink>
            <ButtonLink to={ROUTES.services} variant="outline" size="lg">
              Nos services
            </ButtonLink>
          </>
        }
        aside={
          <HeroMedia
            image={content.hero.image}
            float={{ icon: <IconAddress />, title: content.hero.floatTitle, text: settings.address.street }}
          />
        }
      />

      <Section tone="night" className="relative overflow-hidden" aria-labelledby="mission">
        <BrandSwoosh className="absolute -bottom-55 -left-45 size-[640px] opacity-14" />
        <Container className="relative flex max-w-[calc(55rem+4rem)] flex-col items-center gap-7 text-center">
          <Eyebrow tone="light">{content.mission.eyebrow}</Eyebrow>
          <h2
            id="mission"
            className="text-[clamp(1.875rem,3vw,2.875rem)] max-[359px]:text-[min(1.875rem,9.3vw)] leading-[1.18] font-medium tracking-[-0.028em]"
          >
            <AccentTitle value={content.mission.statement} tone="light" />
          </h2>
          <p className="flex items-center justify-center gap-3 text-sm font-semibold text-white">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-white p-1">
              <LogoMark size={26} />
            </span>
            {signature}
          </p>
        </Container>
      </Section>

      <Section aria-labelledby="histoire">
        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="flex flex-col gap-7">
            <Eyebrow>{content.story.eyebrow}</Eyebrow>
            <h2 id="histoire" className="text-h2 font-semibold">
              <AccentTitle value={content.story.title} />
            </h2>
            <Lead className="text-lg md:text-lg">{content.story.text}</Lead>
          </div>
          <div className="placeholder-hatch flex min-h-[320px] flex-col items-center justify-center gap-2.5 rounded-box p-10 text-center text-sm font-semibold">
            <IconHistory className="size-7 text-gold-deep" aria-hidden />
            <p className="text-base">
              <span className="sr-only">À fournir : </span>
              {content.story.placeholderTitle}
            </p>
            <p className="max-w-[420px] font-medium">{content.story.placeholderText}</p>
          </div>
        </Container>
      </Section>

      <Section tone="paper" bordered aria-labelledby="approche">
        <Container>
          <SectionHeader eyebrow={content.approach.eyebrow} titleId="approche" title={<AccentTitle value={content.approach.title} />} />
          <FeatureGrid items={content.approach.items} columns={3} />
        </Container>
      </Section>

      <Section spacing="md" className="border-b border-line" aria-labelledby="valeurs">
        <Container>
          <div className="mb-10 flex flex-col gap-5">
            <Eyebrow>{content.values.eyebrow}</Eyebrow>
            <h2 id="valeurs" className="text-[32px] leading-[1.15] font-semibold tracking-[-0.028em]">
              {content.values.title}
            </h2>
          </div>
          <ValuesStrip />
        </Container>
      </Section>

      <Section tone="paper" bordered aria-labelledby="identite">
        <Container>
          <SectionHeader
            eyebrow={content.identity.eyebrow}
            titleId="identite"
            title={<AccentTitle value={content.identity.title} />}
            aside={<Lead className="text-lg md:text-lg">{content.identity.text}</Lead>}
          />
          <FieldGallery items={content.identity.items} />
        </Container>
      </Section>

      <Section aria-labelledby="zone">
        <Container>
          <Card className="grid grid-cols-1 overflow-hidden lg:grid-cols-2">
            <div className="flex flex-col gap-7 px-5.5 py-8 md:p-14">
              <Eyebrow>{content.zone.eyebrow}</Eyebrow>
              <h2 id="zone" className="text-h2 font-semibold">
                <AccentTitle value={content.zone.title} />
              </h2>
              <Lead className="text-lg md:text-lg">{content.zone.text}</Lead>
              <p className="text-[13.5px] text-muted">
                Villes et zones couvertes : <ToValidate>{content.zone.pending}</ToValidate>
              </p>
              <TextLink to={ROUTES.contact} arrow>
                {content.zone.linkLabel}
              </TextLink>
            </div>
            <MapPlaceholder layout="about" className="min-h-[420px] rounded-none">
              <p>Carte interactive affichée une fois l’adresse complète validée.</p>
            </MapPlaceholder>
          </Card>
        </Container>
      </Section>

      <Section tone="paper" bordered aria-labelledby="equipe">
        <Container>
          <SectionHeader
            eyebrow={content.team.eyebrow}
            titleId="equipe"
            title={<AccentTitle value={content.team.title} />}
            aside={
              <Tag tone="gold" icon={<IconCamera />} className="w-fit">
                {content.team.pendingLabel}
              </Tag>
            }
          />
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {content.team.members.map((member, index) => (
              <li key={index} className="flex flex-col gap-5">
                <div className="placeholder-hatch flex aspect-[4/5] flex-col items-center justify-center gap-2.5 rounded-[24px] text-sm font-semibold">
                  <IconCamera className="size-7 text-gold-deep" aria-hidden />
                  Photo à fournir
                </div>
                <div>
                  <p className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
                    {member.name ?? <ToValidate>Prénom Nom</ToValidate>}
                  </p>
                  <p className="mt-1 text-[15px] text-muted">
                    {member.role ? `Fonction : ${member.role}` : <ToValidate>Fonction</ToValidate>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <ClosingCta />
    </>
  );
}
