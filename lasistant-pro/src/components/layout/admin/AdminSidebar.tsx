import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useNavigate } from 'react-router';
import { bookingsQuery } from '@/api';
import { Avatar } from '@/components/admin/Avatar';
import { LogoMark } from '@/components/brand/Logo';
import { IconButton } from '@/components/ui';
import { IconSignOut } from '@/components/ui/icons-admin';
import { ADMIN_NAVIGATION, type AdminNavItem } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { isUnprocessed, upcomingAppointments } from '@/features/admin/requests/request-stats';
import { useAuth, useSession } from '@/features/auth/auth-context';
import { useToday } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { can, ROLE_LABELS } from '@/lib/permissions';
import { adminNavIcons } from './admin-nav-icons';

interface AdminSidebarProps {
  /** Appelé après un choix (ferme le tiroir sur mobile) */
  onNavigate?: () => void;
}

/**
 * Menu latéral du back-office : seules les rubriques autorisées pour le rôle sont affichées.
 */
/** Icône d'une rubrique : dessin plein quand la rubrique est active. */
function NavIcon({ icon, active }: { icon: AdminNavItem['icon']; active: boolean }) {
  const Glyph = adminNavIcons[icon];
  return <Glyph weight={active ? 'fill' : 'bold'} />;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const session = useSession();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [] } = useQuery({
    ...bookingsQuery(),
    enabled: can(session.role, 'requests:view'),
  });

  const today = useToday();
  const counters: Record<NonNullable<AdminNavItem['counter']>, number> = {
    newRequests: bookings.filter(isUnprocessed).length,
    upcomingAppointments: upcomingAppointments(bookings, today).length,
  };

  const groups = ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(session.role, item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col gap-1 px-3.5 pt-4.5 pb-4">
      <Link
        to={ROUTES.admin.dashboard}
        onClick={onNavigate}
        className="mb-1.5 flex items-center gap-2.5 border-b border-line px-2 pt-1 pb-4.5"
      >
        <LogoMark size={36} />
        <span className="flex flex-col leading-none">
          <span className="text-[17px] font-bold tracking-[-0.03em] whitespace-nowrap italic">
            <span className="text-brand">Lasistant</span>
            <span className="text-wordmark-green">.Pro</span>
          </span>
          <small className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Back-office
          </small>
        </span>
      </Link>

      <nav aria-label="Menu du back-office" className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label ?? 'principal'}>
            {group.label ? (
              <p className="px-2.5 pt-4 pb-1.5 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const count = item.counter ? counters[item.counter] : 0;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] font-medium text-ink-soft transition-colors hover:bg-cloud [&_svg]:size-4.5 [&_svg]:text-muted',
                          isActive &&
                            'bg-brand-soft font-semibold text-brand-dark hover:bg-brand-soft [&_svg]:text-brand',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Rubrique active : dessin plein, comme un onglet sélectionné. */}
                          <NavIcon icon={item.icon} active={isActive} />
                          {item.label}
                          {count > 0 ? (
                            <span
                              className={cn(
                                'ml-auto flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px] text-[11.5px] font-bold',
                                item.counter === 'newRequests'
                                  ? 'bg-brand text-white'
                                  : 'bg-neutral-soft text-ink-soft',
                              )}
                            >
                              {count}
                              <span className="sr-only">
                                {item.counter === 'newRequests'
                                  ? ' nouvelles demandes'
                                  : ' rendez-vous à venir'}
                              </span>
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line px-2 pt-3">
        <Avatar name={session.name} tone="dark" />
        <Link to={ROUTES.admin.account} onClick={onNavigate} className="group min-w-0 flex-1 leading-[1.3]">
          <strong className="block truncate text-sm font-semibold group-hover:text-brand">
            {session.name}
          </strong>
          <span className="text-[13px] text-muted">{ROLE_LABELS[session.role]}</span>
          <span className="sr-only"> : mon compte</span>
        </Link>
        <IconButton
          label="Se déconnecter"
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate(ROUTES.admin.login, { replace: true });
          }}
        >
          <IconSignOut aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}
