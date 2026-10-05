import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { servicesQuery } from '@/api';
import { Logo } from '@/components/brand/Logo';
import { ButtonAnchor, ButtonLink, IconBox, IconButton } from '@/components/ui';
import { IconArrowRight, IconChevronRight, IconClose, IconEmail, IconFacebook, IconPhone } from '@/components/ui/icons';
import { MAIN_NAVIGATION } from '@/config/navigation';
import { ROUTES, servicePath } from '@/config/routes';
import { facebookHref, primaryEmail, primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { phoneHref } from '@/lib/format';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Menu plein écran (mobile et tablette), fondé sur <dialog> pour le piège du focus.
 * Se referme automatiquement à chaque changement de page.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const settings = useSiteSettings();
  const { data: services = [] } = useQuery(servicesQuery());
  const pages = services.filter((service) => service.kind === 'page' && service.showInMenu);
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Fermeture à la navigation.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <dialog
      ref={ref}
      id="menu-mobile"
      aria-label="Menu principal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-[440px] bg-canvas p-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] text-ink"
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex min-h-[68px] items-center justify-between border-b border-line px-5">
          <Logo size="sm" />
          <IconButton label="Fermer le menu" onClick={onClose}>
            <IconClose aria-hidden />
          </IconButton>
        </div>

        <nav aria-label="Menu principal" className="px-5 py-3">
          <ul className="flex flex-col">
            {MAIN_NAVIGATION.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-[-0.025em]',
                      isActive && 'text-brand',
                    )
                  }
                >
                  {item.mobileLabel ?? item.label}
                  <IconChevronRight className="size-4.5" aria-hidden />
                </NavLink>
                {item.servicesMenu ? (
                  <ul className="flex flex-col border-b border-line py-1.5 pl-4">
                    {pages.map((service) => (
                      <li key={service.id}>
                        <NavLink
                          to={servicePath(service.slug)}
                          className="flex items-center gap-3 py-2.5 text-[16.5px] font-medium text-ink-soft"
                        >
                          <IconBox icon={service.icon} tone={service.iconTone} size="xs" />
                          {service.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 border-t border-line bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <ButtonLink to={ROUTES.booking} block trailingIcon={<IconArrowRight />}>
            Demander un accompagnement
          </ButtonLink>
          {phone ? (
            <ButtonAnchor href={phoneHref(phone)} variant="outline" block icon={<IconPhone />}>
              Appeler le {phone}
            </ButtonAnchor>
          ) : null}
          <div className="flex flex-col gap-1.5 pt-2 text-[14.5px] text-muted">
            {email ? (
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 py-1.5 text-ink-soft">
                <IconEmail className="size-4" aria-hidden />
                {email}
              </a>
            ) : null}
            <a
              href={facebookHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-1.5 text-ink-soft"
            >
              <IconFacebook className="size-4" />
              Facebook · {settings.facebook.label}
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
