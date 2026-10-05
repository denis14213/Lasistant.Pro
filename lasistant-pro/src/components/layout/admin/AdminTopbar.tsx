import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { getSeedDate, resetDatabase } from '@/api';
import { queryClient } from '@/app/query-client';
import { Avatar } from '@/components/admin/Avatar';
import { Button, ButtonAnchor, Dialog, IconButton } from '@/components/ui';
import { IconExternalLink, IconInfo, IconMenu, IconSearch } from '@/components/ui/icons';
import { IconNotification, IconRestore } from '@/components/ui/icons-admin';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useAdminNotifications } from '@/features/admin/notifications/useAdminNotifications';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { formatDateTime } from '@/lib/format';
import { NotificationsPanel } from './NotificationsPanel';

interface AdminTopbarProps {
  onOpenMenu: () => void;
}

/**
 * Barre supérieure du back-office : recherche (Ctrl K), données de démonstration,
 * accès au site, notifications et utilisateur connecté.
 */
export function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
  const session = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const notifications = useAdminNotifications();

  // Raccourci clavier : Ctrl K (ou ⌘ K) place le curseur dans la recherche.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `${ROUTES.admin.requests}?q=${encodeURIComponent(trimmed)}` : ROUTES.admin.requests);
  };

  const resetDemo = () => {
    resetDatabase();
    queryClient.clear();
    setDemoOpen(false);
    toast.success('Données de démonstration réinitialisées.');
    navigate(ROUTES.admin.dashboard, { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-[68px] flex-wrap items-center gap-3.5 border-b border-line bg-white/86 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md md:px-8">
      <IconButton label="Ouvrir le menu" className="lg:hidden" onClick={onOpenMenu}>
        <IconMenu aria-hidden />
      </IconButton>

      <form role="search" onSubmit={onSearch} className="max-w-[440px] min-w-0 flex-1 sm:min-w-[200px]">
        <label className="flex h-[42px] items-center gap-2.5 rounded-[10px] border border-transparent bg-cloud px-3.5 text-muted focus-within:border-brand focus-within:bg-white focus-within:shadow-focus">
          <IconSearch className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Rechercher une demande</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une demande, un contact…"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder md:text-[14.5px]"
          />
          <kbd className="hidden rounded-md border border-line bg-white px-[7px] py-0.5 font-sans text-xs text-muted md:inline">
            Ctrl K
          </kbd>
        </label>
      </form>

      {env.dataSource === 'mock' ? (
        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="hidden h-[30px] items-center gap-2 rounded-full bg-gold-soft px-3 text-[12.5px] font-semibold text-gold-dark transition-colors hover:bg-gold-line md:inline-flex"
        >
          <IconInfo className="size-4" aria-hidden />
          Données de démonstration
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <ButtonAnchor
          href={ROUTES.home}
          target="_blank"
          rel="noopener"
          variant="outline"
          shape="rounded"
          size="sm"
          trailingIcon={<IconExternalLink />}
          className="max-sm:hidden"
        >
          Voir le site<span className="sr-only"> (nouvel onglet)</span>
        </ButtonAnchor>
        <span className="relative">
          <IconButton
            ref={bellRef}
            label={
              notifications.unreadCount > 0
                ? `Notifications, ${notifications.unreadCount} nouvelle${notifications.unreadCount > 1 ? 's' : ''}`
                : 'Notifications'
            }
            aria-expanded={notificationsOpen}
            className="size-[38px] rounded-[10px]"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <IconNotification aria-hidden />
          </IconButton>
          {notifications.unreadCount > 0 ? (
            <span
              className="pointer-events-none absolute top-[7px] right-2 size-2 rounded-full bg-brand-bright shadow-[0_0_0_2px_#fff]"
              aria-hidden
            />
          ) : null}
        </span>
        {/* Sur téléphone, le compte reste accessible depuis le menu : la barre tient sur une ligne. */}
        <Avatar name={session.name} tone="dark" className="max-sm:hidden" />
      </div>

      {notificationsOpen ? (
        <NotificationsPanel
          items={notifications.items}
          anchorRef={bellRef}
          onMarkAllRead={notifications.markAllRead}
          onClose={() => setNotificationsOpen(false)}
        />
      ) : null}

      <Dialog
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        size="sm"
        title="Données de démonstration"
        description="Le back-office fonctionne pour l’instant sans base de données : les demandes, contenus et réglages sont enregistrés dans ce navigateur."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setDemoOpen(false)}>
              Fermer
            </Button>
            <Button variant="danger" shape="rounded" icon={<IconRestore />} onClick={resetDemo}>
              Réinitialiser les données
            </Button>
          </>
        }
      >
        <p className="text-[14.5px] text-muted">
          Données créées le {formatDateTime(getSeedDate())}. La réinitialisation restaure les contenus
          d’origine et efface les demandes envoyées depuis le site sur cet appareil.
        </p>
      </Dialog>
    </header>
  );
}
