import { NavLink } from 'react-router';
import {
  IconArticles,
  IconCalendar,
  IconConversation,
  IconHome,
  IconServices,
  type AppIcon,
} from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/cn';

/**
 * Barre d'onglets du site sur téléphone (moins de 768 px), à la manière d'une application :
 * Accueil, Services, Réserver (au centre, en relief), Espace infos et Contact.
 * L'appel reste accessible par l'onglet Contact, le menu et le haut de page ; WhatsApp flotte
 * au-dessus de la barre. Sur tablette et ordinateur, la navigation de l'en-tête suffit.
 * Sa hauteur est fixée par la variable CSS « --mobile-nav-height » (src/styles/index.css).
 */

interface Tab {
  label: string;
  /** Libellé court sous 360 px (Galaxy Z Fold replié) ; le libellé complet reste le nom lu */
  shortLabel?: string;
  to: string;
  icon: AppIcon;
  /** L'onglet n'est actif que sur cette adresse exacte (Accueil) */
  end?: boolean;
}

const LEADING_TABS: Tab[] = [
  { label: 'Accueil', to: ROUTES.home, icon: IconHome, end: true },
  { label: 'Services', to: ROUTES.services, icon: IconServices },
];

const TRAILING_TABS: Tab[] = [
  { label: 'Espace infos', shortLabel: 'Infos', to: ROUTES.articles, icon: IconArticles },
  { label: 'Contact', to: ROUTES.contact, icon: IconConversation },
];

const TAB_LABEL = 'text-center text-[11px] leading-tight font-semibold max-[359px]:text-[10px]';

function TabLink({ tab }: { tab: Tab }) {
  const Glyph = tab.icon;
  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      aria-label={tab.shortLabel ? tab.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex min-h-[54px] flex-col items-center justify-end gap-1 rounded-xl px-0.5 pb-0.5 transition-colors',
          TAB_LABEL,
          isActive ? 'text-brand' : 'text-muted hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Onglet actif : pastille teintée et dessin plein, comme dans une application. */}
          <span
            className={cn(
              'flex h-8 w-14 max-w-full items-center justify-center rounded-full transition-colors',
              isActive && 'bg-brand-soft',
            )}
          >
            <Glyph className="size-6" weight={isActive ? 'fill' : 'regular'} />
          </span>
          {tab.shortLabel ? (
            <>
              <span className="max-[359px]:hidden">{tab.label}</span>
              <span className="hidden max-[359px]:inline">{tab.shortLabel}</span>
            </>
          ) : (
            tab.label
          )}
        </>
      )}
    </NavLink>
  );
}

/** Action principale : la réservation, en relief au centre de la barre. */
function BookingTab() {
  return (
    <NavLink
      to={ROUTES.booking}
      className={cn('group flex flex-col items-center gap-1 rounded-xl pb-0.5 font-bold text-brand', TAB_LABEL)}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              '-mt-6 flex size-[54px] items-center justify-center rounded-full bg-brand text-white shadow-[0_14px_26px_-12px_rgb(122_31_160/0.7)] ring-[5px] ring-paper transition-colors group-hover:bg-brand-dark',
              isActive && 'bg-brand-dark',
            )}
          >
            <IconCalendar className="size-6" />
          </span>
          Réserver
        </>
      )}
    </NavLink>
  );
}

export function MobileBottomNavigation() {
  return (
    <>
      {/* Espace réservé : la barre ne masque jamais le bas du pied de page. */}
      <div className="h-(--mobile-nav-height) md:hidden" aria-hidden />
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-paper/96 pt-[7px] pr-[env(safe-area-inset-right)] pb-[max(10px,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] shadow-[0_-14px_30px_-24px_rgb(23_21_28/0.35)] backdrop-blur-md md:hidden print:hidden"
      >
        <ul className="mx-auto grid max-w-[560px] grid-cols-5 items-end px-1">
          {LEADING_TABS.map((tab) => (
            <li key={tab.to}>
              <TabLink tab={tab} />
            </li>
          ))}
          <li className="flex justify-center">
            <BookingTab />
          </li>
          {TRAILING_TABS.map((tab) => (
            <li key={tab.to}>
              <TabLink tab={tab} />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
