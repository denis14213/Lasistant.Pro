import { addDays, fromISODate, isoDateOf, isoWeekNumber, startOfWeek, toISODate } from '@/lib/dates';
import type { Booking, BookingStatus } from '@/types';

/**
 * Indicateurs calculés à partir des demandes (tableau de bord, menu, notifications).
 * Fonctions pures : faciles à tester et à remplacer par des requêtes agrégées en phase 2.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Statuts d'un rendez-vous encore à venir dans l'agenda. */
export const UPCOMING_STATUSES: BookingStatus[] = ['nouveau', 'en_cours', 'confirme'];

export function isUnprocessed(booking: Booking): boolean {
  return booking.status === 'nouveau';
}

/** Demande non traitée reçue il y a plus de 24 h. */
export function isOverdue(booking: Booking, now: number): boolean {
  return isUnprocessed(booking) && now - new Date(booking.createdAt).getTime() > DAY_MS;
}

/** Rendez-vous à venir (à partir d'aujourd'hui), dans l'ordre chronologique. */
export function upcomingAppointments(bookings: Booking[], today: string): Booking[] {
  return bookings
    .filter(
      (booking) =>
        booking.requestedDate !== null &&
        booking.requestedTime !== null &&
        booking.requestedDate >= today &&
        (booking.status === 'confirme' || booking.status === 'en_cours'),
    )
    .sort((a, b) =>
      `${a.requestedDate} ${a.requestedTime}`.localeCompare(`${b.requestedDate} ${b.requestedTime}`),
    );
}

/** Demandes reçues dans les N derniers jours. */
export function receivedWithin(bookings: Booking[], days: number, now: number): Booking[] {
  return bookings.filter((booking) => now - new Date(booking.createdAt).getTime() <= days * DAY_MS);
}

/** Demandes reçues entre N et 2N jours (période de comparaison). */
export function receivedInPreviousPeriod(bookings: Booking[], days: number, now: number): Booking[] {
  return bookings.filter((booking) => {
    const age = now - new Date(booking.createdAt).getTime();
    return age > days * DAY_MS && age <= 2 * days * DAY_MS;
  });
}

export interface WeekCount {
  week: number;
  /** Lundi de la semaine (« AAAA-MM-JJ ») */
  start: string;
  count: number;
  current: boolean;
}

/** Nombre de demandes par semaine sur les N dernières semaines (la dernière est la semaine en cours). */
export function weeklyCounts(bookings: Booking[], weeks: number, now: number): WeekCount[] {
  const currentMonday = startOfWeek(fromISODate(isoDateOf(new Date(now).toISOString())));
  return Array.from({ length: weeks }, (_, index) => {
    const monday = addDays(currentMonday, (index - weeks + 1) * 7);
    const start = toISODate(monday);
    const end = toISODate(addDays(monday, 7));
    const count = bookings.filter((booking) => {
      const day = isoDateOf(booking.createdAt);
      return day >= start && day < end;
    }).length;
    return { week: isoWeekNumber(monday), start, count, current: index === weeks - 1 };
  });
}

/** Répartition des demandes par service, de la plus fréquente à la moins fréquente. */
export function countByService(bookings: Booking[]): Array<{ serviceId: string | null; count: number }> {
  const counts = new Map<string | null, number>();
  for (const booking of bookings) counts.set(booking.serviceId, (counts.get(booking.serviceId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([serviceId, count]) => ({ serviceId, count }))
    .sort((a, b) => b.count - a.count);
}
