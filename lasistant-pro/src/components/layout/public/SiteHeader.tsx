import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { servicesQuery } from '@/api';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink, IconBox, IconButton } from '@/components/ui';
import { IconArrowRight, IconChevronDown, IconEmail, IconFacebook, IconMenu, IconPhone } from '@/components/ui/icons';
import { MAIN_NAVIGATION } from '@/config/navigation';
import { ROUTES, servicePath } from '@/config/routes';
import { facebookHref, primaryEmail, primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { phoneHref } from '@/lib/format';
import { MobileMenu } from './MobileMenu';

/**
 * En-tête du site public : barre utilitaire (contacts directs) puis en-tête collant
 * avec logo, navigation, méga-menu des services et action principale.
 */
export function SiteHeader() {
  const settings = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);

  return (
    <>
      {/* Barre utilitaire (masquée sur mobile, où la barre d'onglets et le menu prennent le relais) */}
      <div className="hidden bg-night text-[13.5px] text-on-dark md:block">
        <div className="container-site flex min-h-[42px] items-center justify-between gap-6">
          <p className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-success-bright" aria-hidden />
            Assistance médicale, hébergement et accompagnement en Tunisie
          </p>
          <div className="flex items-center gap-5.5">
            {phone ? (
              <a href={phoneHref(phone)} className="inline-flex items-center gap-2 text-white/95 hover:text-white hover:underline">
                <IconPhone className="size-4" aria-hidden />
                {phone}
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="hidden items-center gap-2 text-white/95 hover:text-white hover:underline lg:inline-flex">
                <IconEmail className="size-4" aria-hidden />
                {email}
              </a>
            ) : null}
            <a
              href={facebookHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/95 hover:text-white hover:underline"
            >
              <IconFacebook className="size-4" />
              {settings.facebook.label}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 pt-[env(safe-area-inset-top)] backdrop-blur-md backdrop-saturate-150">
        <div className="container-site flex min-h-[68px] items-center gap-3 md:min-h-[84px] xl:gap-7">
          <Link to={ROUTES.home} aria-label="LASISTANT.PRO, retour à l’accueil" className="shrink-0">
            {/* Accroche masquée entre 1200 et 1400 px : la navigation complète a besoin de la place. */}
            <Logo showTagline="desktop" taglineClassName="xl:max-[87.5rem]:hidden" />
          </Link>

          <nav aria-label="Navigation principale" className="mx-auto hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {MAIN_NAVIGATION.map((item) =>
                item.servicesMenu ? (
                  <ServicesMenuItem key={item.to} label={item.label} />
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={navLinkClasses}>
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2.5 xl:ml-0">
            <ButtonLink to={ROUTES.booking} size="sm" className="hidden md:inline-flex">
              Demander un accompagnement
            </ButtonLink>
            <IconButton
              label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className="xl:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <IconMenu aria-hidden />
            </IconButton>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[15.5px] font-medium whitespace-nowrap text-ink-soft transition-colors hover:bg-ink/5',
    isActive && 'bg-brand-soft font-semibold text-brand-dark hover:bg-brand-soft',
  );
}

/** Lien « Services » et son méga-menu (ouvert au survol et au focus clavier). */
function ServicesMenuItem({ label }: { label: string }) {
  const { data: services = [] } = useQuery(servicesQuery());
  const pages = services.filter((service) => service.kind === 'page' && service.showInMenu);

  return (
    <li className="group/services relative">
      <NavLink to={ROUTES.services} className={navLinkClasses}>
        {label}
        <IconChevronDown
          className="size-4 transition-transform group-focus-within/services:rotate-180 group-hover/services:rotate-180"
          aria-hidden
        />
      </NavLink>
      <div className="invisible absolute top-full left-1/2 w-[880px] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within/services:visible group-focus-within/services:opacity-100 group-hover/services:visible group-hover/services:opacity-100">
        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.1fr)] gap-3 rounded-[22px] border border-line bg-paper p-4 shadow-raised">
          {pages.map((service) => (
            <Link
              key={service.id}
              to={servicePath(service.slug)}
              className="flex flex-col gap-2.5 rounded-2xl p-4 transition-colors hover:bg-mist"
            >
              <IconBox icon={service.icon} tone={service.iconTone} size="sm" />
              <span className="font-semibold">{service.title}</span>
              <span className="text-sm text-muted">{service.summary}</span>
            </Link>
          ))}
          <div className="flex flex-col justify-between gap-3 rounded-[18px] bg-plum p-5.5 text-white">
            <div>
              <p className="font-semibold">Vous hésitez ?</p>
              <p className="mt-1 text-sm text-on-plum">Réservez un échange de 1 h avec notre équipe.</p>
            </div>
            <ButtonLink to={ROUTES.booking} variant="light" size="sm" trailingIcon={<IconArrowRight />} className="w-fit">
              Réserver
            </ButtonLink>
          </div>
        </div>
      </div>
    </li>
  );
}
