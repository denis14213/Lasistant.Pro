import type { ReactNode } from 'react';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import {
  AccentTitle,
  ButtonAnchor,
  ButtonLink,
  Container,
  FeatureIcon,
  Lead,
  Section,
} from '@/components/ui';
import { IconArrowRight, IconPhone } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { phoneHref } from '@/lib/format';
import type { AccentText, IconName } from '@/types';
import { usePageContent } from '@/features/content/usePageContent';

/**
 * Appels à l'action de fin de page.
 */

interface CtaBandProps {
  icon: IconName;
  title: string;
  text: ReactNode;
  actions: ReactNode;
  titleId?: string;
  /** « sage » : variante verte (partenariats) */
  tone?: 'paper' | 'sage';
}

/** Bandeau clair : icône d'identité, question et actions (« Vous ne savez pas quel service choisir ? »). */
export function CtaBand({ icon, title, text, actions, titleId, tone = 'paper' }: CtaBandProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-8 rounded-[32px] border px-5.5 py-7 md:px-12 md:py-11',
        tone === 'sage' ? 'border-success-line bg-sage' : 'border-line bg-paper',
      )}
    >
      <div className="flex items-start gap-5.5">
        <FeatureIcon icon={icon} size="xl" tone={tone === 'sage' ? 'success' : 'brand'} className="mt-0.5" />
        <div className="flex flex-col gap-3">
          <h2 id={titleId} className="text-h3 font-semibold">
            {title}
          </h2>
          <p className="max-w-[620px] text-muted">{text}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  );
}

interface ClosingCtaProps {
  title?: AccentText;
  text?: string;
  /** Destination de l'action principale (réservation par défaut) */
  to?: string;
}

/** Panneau prune de fin de page : réservation et appel direct. */
export function ClosingCta({ title, text, to = ROUTES.booking }: ClosingCtaProps) {
  const settings = useSiteSettings();
  const { closingCta } = usePageContent('identite');
  const phone = primaryPhone(settings);
  return (
    <Section spacing="lg" className="pt-0 md:pt-0" aria-labelledby="appel-final">
      <Container>
        <div className="relative grid grid-cols-1 items-center gap-9 overflow-hidden rounded-[28px] bg-plum px-5.5 py-10 text-white md:rounded-[40px] md:px-10 md:py-14 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:px-16 lg:py-15">
          <BrandSwoosh
            secondBlade="green"
            className="absolute -right-30 -bottom-65 size-[620px] opacity-55"
          />
          <div className="relative flex flex-col gap-5">
            <h2
              id="appel-final"
              className="text-[clamp(1.875rem,2.8vw,2.625rem)] leading-[1.08] font-semibold tracking-[-0.032em] max-[359px]:text-[min(1.875rem,9.3vw)]"
            >
              <AccentTitle value={title ?? closingCta.title} tone="light" />
            </h2>
            <Lead tone="on-dark" className="text-lg md:text-lg">
              {text ?? closingCta.text}
            </Lead>
          </div>
          <div className="relative flex flex-wrap gap-3 max-md:*:w-full">
            <ButtonLink to={to} variant="light" size="lg" trailingIcon={<IconArrowRight />}>
              {closingCta.primaryLabel}
            </ButtonLink>
            {phone ? (
              <ButtonAnchor href={phoneHref(phone)} variant="outline-light" size="lg" icon={<IconPhone />}>
                {phone}
              </ButtonAnchor>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
