import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useMatches } from 'react-router';
import { NetworkStatusBanner } from '@/components/feedback/NetworkStatusBanner';
import { PageLoader } from '@/components/feedback/PageLoader';
import { RouteFocus, SkipLink } from '@/components/feedback/RouteFocus';
import { IconButton } from '@/components/ui';
import { IconClose } from '@/components/ui/icons';
import { useSession } from '@/features/auth/auth-context';
import { ForbiddenView } from '@/features/auth/ForbiddenView';
import { useIdleLogout } from '@/features/auth/useIdleLogout';
import { can, type Permission } from '@/lib/permissions';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

/** Informations déclarées par chaque route du back-office. */
export interface AdminRouteHandle {
  /** Permission nécessaire pour afficher la page */
  permission?: Permission;
}

/** Permission exigée par la page affichée (la plus spécifique l'emporte). */
function useRequiredPermission(): Permission | undefined {
  const matches = useMatches();
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle as AdminRouteHandle | undefined;
    if (handle?.permission) return handle.permission;
  }
  return undefined;
}

/**
 * Gabarit du back-office : menu latéral (tiroir sur mobile), barre supérieure et contenu.
 * Le contrôle d'accès par rôle est appliqué ici, pour toutes les pages.
 */
export function AdminLayout() {
  useIdleLogout();
  const session = useSession();
  const permission = useRequiredPermission();
  const allowed = !permission || can(session.role, permission);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-cloud text-[14.5px] leading-normal">
      <SkipLink />
      <NetworkStatusBanner context="admin" />
      <aside
        aria-label="Navigation du back-office"
        className="fixed inset-y-0 left-0 z-30 hidden w-[252px] border-r border-line bg-white lg:block"
      >
        <AdminSidebar />
      </aside>
      <AdminDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex min-h-dvh flex-col lg:pl-[252px]">
        <AdminTopbar onOpenMenu={() => setDrawerOpen(true)} />
        <main id="contenu" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {allowed ? (
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          ) : (
            <ForbiddenView />
          )}
        </main>
      </div>
      <RouteFocus />
    </div>
  );
}

/** Menu latéral en tiroir sur mobile et tablette (fenêtre modale native). */
function AdminDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  // Synchronise l'état React avec l'ouverture native de la fenêtre.
  // Le tiroir se referme aussi à chaque choix dans le menu (voir « onNavigate »).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Menu du back-office"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-0 h-dvh max-h-dvh w-[min(300px,88vw)] max-w-none bg-white p-0 lg:hidden"
    >
      {open ? (
        <div className="relative h-full">
          <IconButton
            label="Fermer le menu"
            variant="ghost"
            size="sm"
            className="absolute top-4 right-3 z-10"
            onClick={onClose}
          >
            <IconClose aria-hidden />
          </IconButton>
          <AdminSidebar onNavigate={onClose} />
        </div>
      ) : null}
    </dialog>
  );
}
