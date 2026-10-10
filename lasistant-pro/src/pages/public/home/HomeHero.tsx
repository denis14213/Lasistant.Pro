import { Link } from 'react-router';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { AccentTitle, ButtonLink, Container, Eyebrow, Lead, ResponsiveImage, Tag } from '@/components/ui';
import { IconArrowRight, IconCalendar, IconClock, IconConversation } from '@/components/ui/icons';
import { bookingFor, ROUTES } from '@/config/routes';
import { QuickStartBar } from '@/features/booking/QuickStartBar';
import { usePageContent } from '@/features/content/usePageContent';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { formatDuration, phoneHref } from '@/lib/format';

/** Premier écran de l'accueil : promesse, actions principales et démarrage rapide. */
export function HomeHero() {
  const { hero } = usePageContent('accueil');
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  return (
    <section aria-labelledby="titre-accueil" className="relative overflow-hidden pt-5 pb-14 md:pt-12 md:pb-22">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          <div className="relative z-[2] flex flex-col gap-5.5 pt-2 md:gap-7.5 md:pt-6 md:pb-10">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 id="titre-accueil" className="text-[2.75rem] leading-none font-semibold tracking-[-0.042em] max-[359px]:text-[2.125rem] md:text-display">
              <AccentTitle value={hero.title} />
            </h1>
            <Lead className="max-w-[540px]">{hero.lead}</Lead>
            <div className="flex flex-wrap gap-3 max-md:*:w-full">
              <ButtonLink to={hero.primaryCta.to} size="lg" trailingIcon={<IconArrowRight />}>
                {hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink to={bookingFor('echange-global')} variant="outline" size="lg" icon={<IconCalendar />}>
                {hero.secondaryCta.label}
              </ButtonLink>
            </div>
            <p className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 text-[15px] text-muted">
              Besoin d’en parler ?
              {phone ? (
                <a href={phoneHref(phone)} className="border-b border-line-strong font-semibold text-ink hover:border-ink">
                  {phone}
                </a>
              ) : null}
              <span aria-hidden>·</span>
              <Link to={ROUTES.contact} className="border-b border-line-strong font-semibold text-ink hover:border-ink">
                Nous contacter
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-x-4.5 gap-y-2 border-t border-line pt-6.5 text-[14.5px] font-medium text-ink-soft">
              <span className="mr-1 text-xs font-semibold tracking-[0.14em] text-muted uppercase">{hero.audienceLabel}</span>
              {hero.audiences.map((audience) => (
                <span
                  key={audience}
                  className="inline-flex items-center gap-2 before:size-[5px] before:rounded-full before:bg-success-bright before:content-['']"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-3.5 md:block md:h-[600px] lg:h-[640px]">
            <BrandSwoosh className="absolute -top-10 -right-22 z-0 size-[340px] md:-top-[70px] md:-right-[110px] md:size-[620px]" />
            <div className="relative z-[1] h-[380px] overflow-hidden rounded-[170px_24px_24px_24px] bg-mist shadow-float md:absolute md:top-0 md:right-0 md:h-[596px] md:w-[88%] md:rounded-[280px_36px_36px_36px]">
              <ResponsiveImage
                image={hero.image}
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="size-full object-cover object-[58%_center]"
              />
            </div>
            <figure className="absolute bottom-[84px] left-0 z-[2] hidden w-[224px] rounded-[22px] bg-white p-2 shadow-raised md:block lg:bottom-[236px] xl:bottom-[84px]">
              <ResponsiveImage
                image={hero.insetImage}
                sizes="224px"
                className="h-[138px] w-full rounded-[15px] object-cover"
              />
              <figcaption className="px-2 pt-3 pb-1.5 text-[13.5px] leading-[1.35] font-semibold">{hero.insetCaption}</figcaption>
            </figure>
            <div className="relative z-[3] flex flex-col gap-3 rounded-[24px] bg-white p-5.5 shadow-raised md:absolute md:right-7 md:bottom-0 md:w-[300px]">
              <div className="flex items-center justify-between">
                <Tag tone="success">{hero.bookingCard.tag}</Tag>
                <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft">
                  <IconClock className="size-4" aria-hidden />
                  {formatDuration(settings.booking.durationMinutes)}
                </span>
              </div>
              <p className="text-lg leading-[1.25] font-semibold tracking-[-0.015em]">{hero.bookingCard.title}</p>
              <p className="flex items-center gap-2 text-sm text-muted">
                <IconConversation className="size-4" aria-hidden />
                {hero.bookingCard.mode}
              </p>
              <ButtonLink to={bookingFor('echange-global')} variant="dark" size="sm" className="w-fit" trailingIcon={<IconArrowRight />}>
                {hero.bookingCard.cta}
              </ButtonLink>
            </div>
          </div>
        </div>

        <QuickStartBar />
      </Container>
    </section>
  );
}
