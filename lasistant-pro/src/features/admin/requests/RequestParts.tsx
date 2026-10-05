import { Avatar } from '@/components/admin/Avatar';
import { Badge } from '@/components/ui';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONES } from '@/content/labels';
import type { Booking, BookingStatus } from '@/types';

/**
 * Éléments d'affichage communs aux listes de demandes.
 */

/** Badge de statut d'une demande (la couleur n'est jamais le seul repère : le libellé est toujours écrit). */
export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={BOOKING_STATUS_TONES[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>;
}

/** Demandeur : initiales, nom et référence. */
export function Requester({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={booking.fullName} />
      <div className="min-w-0">
        <strong className="block truncate text-sm font-semibold">{booking.fullName}</strong>
        <span className="font-mono text-[12.5px] text-muted">{booking.reference}</span>
      </div>
    </div>
  );
}
