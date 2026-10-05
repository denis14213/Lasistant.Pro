import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { Logo } from '@/components/brand/Logo';
import { AccentTitle, ButtonAnchor, Eyebrow, ToValidate } from '@/components/ui';
import { IconClock, IconEmail, IconFacebook, IconMaintenance, IconPhone } from '@/components/ui/icons';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { formatPublicationDate, phoneHref } from '@/lib/format';
import type { SiteSettings } from '@/types';
import { facebookHref, primaryEmail, primaryPhone } from '../settings/useSiteSettings';

/**
 * Page de maintenance : affichée à tous les visiteurs lorsque le mode maintenance est
 * activé dans le back-office (l'équipe connectée continue de voir le site).
 */
export function MaintenanceScreen({ settings }: { settings: SiteSettings }) {
  const content = SYSTEM_PAGES_CONTENT.maintenance;
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-plum text-white">
      <BrandSwoosh secondBlade="green" className="absolute -top-50 -right-55 size-[820px] opacity-55" />
      <BrandSwoosh secondBlade="none" className="absolute -bottom-75 -left-65 size-[700px] opacity-12" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10 md:py-6">
        <Logo tone="light" framed showTagline />
        <ButtonAnchor
          href={facebookHref(settings)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline-light"
          size="sm"
          icon={<IconFacebook />}
        >
          Suivez-nous
        </ButtonAnchor>
      </header>

      <main id="contenu" className="relative z-10 flex flex-1 items-center justify-center px-5 pt-6 pb-16">
        <div className="flex max-w-[720px] flex-col items-center gap-7 text-center">
          <span className="flex size-[88px] items-center justify-center rounded-full bg-white/10">
            <IconMaintenance className="size-9" aria-hidden />
          </span>
          <Eyebrow tone="light">{content.eyebrow}</Eyebrow>
          <h1 className="text-[clamp(2.5rem,5vw,4.25rem)] leading-none font-semibold tracking-[-0.04em] max-[359px]:text-[min(2.5rem,9.3vw)]">
            <AccentTitle value={content.title} tone="light" />
          </h1>
          <p className="max-w-[600px] text-lead text-on-plum">{settings.maintenance.message}</p>
          <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium">
            <IconClock className="size-4" aria-hidden />
            Retour prévu :{' '}
            {settings.maintenance.returnAt ? (
              formatPublicationDate(settings.maintenance.returnAt)
            ) : (
              <ToValidate>date et heure à préciser</ToValidate>
            )}
          </p>
          <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-card border border-white/15 bg-white/5 px-6 py-5.5 text-left">
            <div>
              <p className="font-semibold">{content.contactTitle}</p>
              <p className="text-sm text-on-plum">{content.contactText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {phone ? (
                <ButtonAnchor href={phoneHref(phone)} variant="light" size="sm" icon={<IconPhone />}>
                  {phone}
                </ButtonAnchor>
              ) : null}
              {email ? (
                <ButtonAnchor href={`mailto:${email}`} variant="outline-light" size="sm" icon={<IconEmail />}>
                  Écrire
                </ButtonAnchor>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex flex-wrap justify-between gap-3 px-5 py-5 text-[13.5px] text-on-dark-muted md:px-10">
        <span>© {new Date().getFullYear()} LASISTANT.PRO</span>
        <span>
          {settings.address.street}, {settings.address.country}
        </span>
      </footer>
    </div>
  );
}
