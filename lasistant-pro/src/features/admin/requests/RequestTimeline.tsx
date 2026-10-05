import type { ReactNode } from 'react';
import { IconEmail, IconSend, IconWeightScope } from '@/components/ui/icons';
import {
  IconAssigned,
  IconInbox,
  IconNote,
  IconNotification,
  IconPreview,
  IconStatus,
} from '@/components/ui/icons-admin';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import type { BookingEvent, BookingEventType } from '@/types';

const EVENT_STYLES: Record<BookingEventType, { icon: ReactNode; tone: string }> = {
  received: { icon: <IconInbox />, tone: 'bg-brand-soft text-brand' },
  email_sent: { icon: <IconEmail />, tone: 'bg-success-soft text-success' },
  notification_sent: { icon: <IconNotification />, tone: 'bg-info-soft text-info' },
  viewed: { icon: <IconPreview />, tone: 'bg-cloud text-muted' },
  status_changed: { icon: <IconStatus />, tone: 'bg-gold-soft text-gold-deep' },
  assigned: { icon: <IconAssigned />, tone: 'bg-cloud text-ink-soft' },
  reply_sent: { icon: <IconSend />, tone: 'bg-success-soft text-success' },
  note_added: { icon: <IconNote />, tone: 'bg-cloud text-ink-soft' },
};

/** Historique d'une demande (journal des actions, du plus ancien au plus récent). */
export function RequestTimeline({ events }: { events: BookingEvent[] }) {
  if (events.length === 0) return <p className="text-muted">Aucun événement enregistré.</p>;
  return (
    <ol className="flex flex-col">
      {events.map((event, index) => {
        const style = EVENT_STYLES[event.type];
        return (
          <li key={event.id} className="relative grid grid-cols-[30px_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
            {index < events.length - 1 ? (
              <span aria-hidden className="absolute top-[30px] bottom-0 left-[14.5px] w-px bg-line-strong" />
            ) : null}
            <span
              className={cn(
                'flex size-[30px] items-center justify-center rounded-full [&_svg]:size-4',
                style.tone,
              )}
              aria-hidden
            >
              <IconWeightScope weight="bold">{style.icon}</IconWeightScope>
            </span>
            <div>
              <p className="text-sm leading-[1.45]">
                {event.label}
                {event.actor ? (
                  <>
                    {' '}
                    · <strong className="font-semibold">{event.actor}</strong>
                  </>
                ) : null}
              </p>
              <time dateTime={event.createdAt} className="text-[12.5px] text-muted">
                {formatDateTime(event.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
