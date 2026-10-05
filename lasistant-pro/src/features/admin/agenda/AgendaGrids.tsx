import { Link } from 'react-router';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/cn';
import { fromISODate } from '@/lib/dates';
import { formatLongDate } from '@/lib/format';
import type { Booking, BookingAvailability, Service } from '@/types';
import { requestTopic } from '../requests/request-topic';
import { appointmentsByCell, isBookableHour, isConfirmed, monthGrid } from './agenda-utils';

const weekdayShort = (day: string) =>
  fromISODate(day)
    .toLocaleDateString('fr-FR', { weekday: 'short' })
    .replace('.', '')
    .replace(/^./, (letter) => letter.toUpperCase());

interface GridProps {
  bookings: Booking[];
  services: Service[];
  availability: BookingAvailability;
  today: string;
}

/** Vignette d'un rendez-vous (confirmé en vert, à confirmer en orange). */
function AppointmentChip({
  booking,
  services,
  compact = false,
}: {
  booking: Booking;
  services: Service[];
  compact?: boolean;
}) {
  const confirmed = isConfirmed(booking);
  return (
    <Link
      to={ROUTES.admin.request(booking.id)}
      className={cn(
        'block overflow-hidden rounded-[9px] border text-xs leading-[1.3] transition-shadow hover:shadow-soft',
        compact ? 'px-2 py-1' : 'absolute inset-1 px-2.5 py-[7px]',
        confirmed
          ? 'border-success-line bg-success-soft text-success-dark'
          : 'border-warning-line bg-warning-soft text-warning',
      )}
    >
      <b className="block truncate text-[12.5px] font-semibold">
        {compact ? `${booking.requestedTime} · ` : ''}
        {booking.fullName}
      </b>
      {compact ? null : (
        <span className="block truncate">
          {confirmed ? '' : 'À confirmer · '}
          {requestTopic(booking, services)}
        </span>
      )}
    </Link>
  );
}

interface TimeGridProps extends GridProps {
  days: string[];
  hours: string[];
}

/** Grille horaire (vues jour et semaine). */
export function TimeGrid({ days, hours, bookings, services, availability, today }: TimeGridProps) {
  const cells = appointmentsByCell(bookings, days);
  return (
    <div className="relative overflow-x-auto">
      <div
        role="grid"
        aria-label="Agenda des rendez-vous"
        className="grid grid-cols-1"
        style={{
          gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))`,
          minWidth: days.length > 1 ? 64 + days.length * 96 : 0,
        }}
      >
        <div role="row" className="contents">
          <div role="columnheader" className="border-b border-line">
            <span className="sr-only">Heure</span>
          </div>
          {days.map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={formatLongDate(day)}
              className="border-b border-l border-line px-2.5 py-3 text-center text-[13px] leading-[1.2] text-muted"
            >
              {weekdayShort(day)}
              <b
                className={cn(
                  'mx-auto mt-1 flex size-[34px] items-center justify-center text-xl tracking-[-0.02em] text-ink',
                  day === today && 'rounded-full bg-brand text-base text-white',
                )}
              >
                {Number(day.slice(8))}
              </b>
            </div>
          ))}
        </div>
        {hours.map((hour) => (
          <div role="row" key={hour} className="contents">
            <div
              role="rowheader"
              className="h-16 -translate-y-2 border-b border-neutral-soft px-2.5 text-right text-xs text-muted"
            >
              {hour}
            </div>
            {days.map((day) => {
              const appointments = cells.get(`${day} ${hour}`) ?? [];
              const bookable = isBookableHour(day, hour, availability);
              return (
                <div
                  role="gridcell"
                  key={day}
                  aria-label={`${formatLongDate(day)}, ${hour}${bookable ? '' : ', hors disponibilités'}`}
                  className={cn(
                    'relative h-16 border-b border-l border-b-neutral-soft border-l-line p-[3px]',
                    !bookable && 'hatch-muted',
                  )}
                >
                  {appointments.slice(0, 1).map((booking) => (
                    <AppointmentChip key={booking.id} booking={booking} services={services} />
                  ))}
                  {appointments.length > 1 ? (
                    <span className="absolute right-1.5 bottom-1 rounded-full bg-ink px-1.5 text-[11px] font-bold text-white">
                      +{appointments.length - 1}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Calendrier mensuel avec les rendez-vous de chaque jour. */
export function MonthGridView({
  anchor,
  bookings,
  services,
  availability,
  today,
}: GridProps & { anchor: string }) {
  const weeks = monthGrid(anchor);
  const month = anchor.slice(0, 7);
  const allDays = weeks.flat();
  const cells = appointmentsByCell(bookings, allDays);
  const byDay = (day: string) =>
    [...cells.entries()]
      .filter(([key]) => key.startsWith(day))
      .flatMap(([, items]) => items)
      .sort((a, b) => (a.requestedTime ?? '').localeCompare(b.requestedTime ?? ''));

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
        <thead>
          <tr>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((label) => (
              <th
                key={label}
                scope="col"
                className="border-b border-line py-2.5 text-[13px] font-medium text-muted"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((day) => {
                const items = byDay(day);
                const outside = day.slice(0, 7) !== month;
                const closed = !isBookableHour(day, availability.ranges[0]?.start ?? '09:00', availability);
                return (
                  <td
                    key={day}
                    className={cn(
                      'h-28 border border-line p-1.5 align-top',
                      outside && 'bg-smoke text-subtle',
                      closed && !outside && 'hatch-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'mb-1 inline-flex size-7 items-center justify-center rounded-full text-[13px] font-semibold',
                        day === today && 'bg-brand text-white',
                      )}
                    >
                      {Number(day.slice(8))}
                    </span>
                    <div className="flex flex-col gap-1">
                      {items.slice(0, 2).map((booking) => (
                        <AppointmentChip key={booking.id} booking={booking} services={services} compact />
                      ))}
                      {items.length > 2 ? (
                        <span className="text-xs font-semibold text-muted">+{items.length - 2} autres</span>
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
