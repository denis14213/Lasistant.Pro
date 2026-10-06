import { useEffect, useRef, type RefObject } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/admin/Avatar';
import { IconArticles, IconCalendar } from '@/components/ui/icons';
import { IconNotification } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import type { AdminNotification } from '@/features/admin/notifications/useAdminNotifications';
import { cn } from '@/lib/cn';

interface NotificationsPanelProps {
  items: AdminNotification[];
  onMarkAllRead: () => void;
  onClose: () => void;
  /** Bouton d'ouverture : un clic dessus ne doit pas être traité comme un clic extérieur */
  anchorRef: RefObject<HTMLElement | null>;
}

/**
 * Panneau des notifications, ouvert depuis la cloche de la barre supérieure.
 * Se ferme avec Échap, par un clic à l'extérieur ou en choisissant une notification.
 */
export function NotificationsPanel({ items, onMarkAllRead, onClose, anchorRef }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !anchorRef.current?.contains(target)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        anchorRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      tabIndex={-1}
      className="fixed top-[70px] right-4 z-[60] w-[410px] max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-line bg-paper text-sm leading-[1.45] shadow-float outline-none md:right-6"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5.5 py-4">
        <h2 className="text-base font-semibold tracking-[-0.01em]">Notifications</h2>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-[13.5px] font-semibold text-brand hover:underline"
        >
          Tout marquer comme lu
        </button>
      </div>
      {items.length === 0 ? (
        <p className="flex items-center gap-3 px-5.5 py-8 text-muted">
          <IconNotification className="size-4.5" aria-hidden />
          Aucune notification pour le moment.
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.to}
                onClick={onClose}
                className={cn(
                  'grid grid-cols-[36px_minmax(0,1fr)_10px] items-start gap-3 border-b border-line px-4.5 py-3.5 transition-colors hover:bg-smoke',
                  item.unread && 'bg-brand-wash',
                )}
              >
                {item.kind === 'appointment' || item.kind === 'article' ? (
                  <span
                    className="flex size-[34px] items-center justify-center rounded-full bg-neutral-soft text-neutral"
                    aria-hidden
                  >
                    {item.kind === 'appointment' ? (
                      <IconCalendar className="size-4" />
                    ) : (
                      <IconArticles className="size-4" />
                    )}
                  </span>
                ) : (
                  <Avatar name={item.subject} tone={item.kind === 'overdue' ? 'gold' : undefined} />
                )}
                <span>
                  <span className="block">
                    <strong className="font-semibold">{item.title}</strong> · {item.subject}
                  </span>
                  <span className="text-[13px] text-muted">{item.meta}</span>
                </span>
                {item.unread ? (
                  <span className="mt-1.5 size-2 rounded-full bg-brand-bright">
                    <span className="sr-only">Non lue</span>
                  </span>
                ) : (
                  <span />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5.5 py-3.5 text-[13.5px]">
        <Link
          to={ROUTES.admin.requests}
          onClick={onClose}
          className="font-semibold text-brand hover:underline"
        >
          Voir toutes les demandes
        </Link>
        <Link
          to={ROUTES.admin.account}
          onClick={onClose}
          className="font-semibold text-brand hover:underline"
        >
          Réglages des notifications
        </Link>
      </div>
    </div>
  );
}
