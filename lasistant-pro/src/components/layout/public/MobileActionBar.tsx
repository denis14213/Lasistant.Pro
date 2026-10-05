import { ButtonAnchor, ButtonLink } from '@/components/ui';
import { IconPhone } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { phoneHref } from '@/lib/format';

/**
 * Barre d'action collante sur mobile (cahier des charges § 13) : « Appeler » et la demande
 * d'accompagnement. WhatsApp dispose de son propre bouton flottant (`WhatsAppButton`).
 */
export function MobileActionBar() {
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  return (
    <>
      {/* Espace réservé pour que la barre ne masque pas le bas de page */}
      <div className="h-[calc(76px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-[60] grid gap-2.5 border-t border-line bg-canvas/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden',
          phone ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-1',
        )}
      >
        {phone ? (
          <ButtonAnchor
            href={phoneHref(phone)}
            variant="outline"
            size="sm"
            className="min-h-[50px] max-[359px]:px-3.5"
            icon={<IconPhone />}
          >
            {/* Sous 360 px, seule l'icône reste visible : le bouton principal garde sa place. */}
            <span className="max-[359px]:sr-only">Appeler</span>
          </ButtonAnchor>
        ) : null}
        <ButtonLink to={ROUTES.booking} size="sm" className="min-h-[50px] px-3">
          Demander un accompagnement
        </ButtonLink>
      </div>
    </>
  );
}
