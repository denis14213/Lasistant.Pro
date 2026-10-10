import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { servicesQuery } from '@/api';
import { Logo } from '@/components/brand/Logo';
import { ToValidate } from '@/components/ui';
import { IconAddress, IconEmail, IconFacebook, IconInfo, IconPhone } from '@/components/ui/icons';
import { FOOTER_COMPANY_LINKS, LEGAL_LINKS } from '@/config/navigation';
import { ROUTES, servicePath } from '@/config/routes';
import { activeEntries, facebookHref, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';
import { usePageContent } from '@/features/content/usePageContent';

/**
 * Pied de page : toutes les coordonnées proviennent des réglages du site
 * (une modification dans le back-office est visible immédiatement ici).
 */
export function SiteFooter() {
  const settings = useSiteSettings();
  const { medicalDisclaimer } = usePageContent('identite');
  const { data: services = [] } = useQuery(servicesQuery());
  const pages = services.filter((service) => service.kind === 'page' && service.showInMenu);
  const { address } = settings;
  const addressComplete = address.validated && address.postalCode && address.city;

  return (
    <footer className="relative overflow-hidden bg-night text-[15px] leading-relaxed text-on-dark">
      <div className="container-site">
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:gap-14 md:py-24 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex max-w-[360px] flex-col gap-5.5">
            <Link to={ROUTES.home} aria-label="LASISTANT.PRO, retour à l’accueil" className="w-fit">
              <Logo tone="light" framed showTagline />
            </Link>
            <p>{settings.description}</p>
            <a
              href={facebookHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-fit items-center gap-2.5 rounded-full border border-white/20 pr-4.5 pl-2 font-medium text-white transition-colors hover:border-white"
            >
              {/* Logo plein : le « f » se découpe dans un disque blanc, comme la marque officielle. */}
              <IconFacebook weight="fill" className="size-[30px] text-white" />
              Facebook · {settings.facebook.label}
            </a>
          </div>

          <FooterColumn title="Services">
            {pages.map((service) => (
              <li key={service.id}>
                <Link to={servicePath(service.slug)} className="hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to={ROUTES.booking} className="hover:text-white">
                Réservation en ligne
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Lasistant.Pro">
            {FOOTER_COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            {activeEntries(settings.phones).map((phone) => (
              <li key={phone.id}>
                <a href={phoneHref(phone.value)} className="flex items-start gap-2.5 hover:text-white">
                  <IconPhone className="mt-1 size-4 shrink-0 text-on-dark-muted" aria-hidden />
                  <span>
                    <span className="whitespace-nowrap">{phone.value}</span>
                    {phone.label ? (
                      <span className="ml-2 text-[12.5px] text-on-dark-muted">{phone.label}</span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
            {activeEntries(settings.emails).map((email) => (
              <li key={email.id}>
                <a href={`mailto:${email.value}`} className="flex items-start gap-2.5 break-all hover:text-white">
                  <IconEmail className="mt-1 size-4 shrink-0 text-on-dark-muted" aria-hidden />
                  {email.value}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <IconAddress className="mt-1 size-4 shrink-0 text-on-dark-muted" aria-hidden />
              <span>
                {address.street}
                {addressComplete ? `, ${address.postalCode} ${address.city}` : ''}, {address.country}
                {addressComplete ? null : (
                  <>
                    <br />
                    <ToValidate className="text-xs">adresse complète à valider</ToValidate>
                  </>
                )}
              </span>
            </li>
          </FooterColumn>
        </div>

        <p
          aria-hidden
          className="mb-[-14px] pt-3 text-[clamp(4.5rem,13.4vw,12.25rem)] leading-[0.78] font-bold tracking-[-0.065em] whitespace-nowrap text-night-mark italic select-none"
        >
          Lasistant.Pro
        </p>
      </div>

      <div className="container-site">
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-4 border-t border-white/10 py-6 text-[13.5px] text-on-dark-muted">
          <p>© {new Date().getFullYear()} LASISTANT.PRO. Tous droits réservés.</p>
          <p className="flex items-center gap-2.5">
            <IconInfo className="size-4" aria-hidden />
            {medicalDisclaimer}
          </p>
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-5.5 text-[12.5px] font-semibold tracking-[0.16em] text-white uppercase">{title}</h2>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}
