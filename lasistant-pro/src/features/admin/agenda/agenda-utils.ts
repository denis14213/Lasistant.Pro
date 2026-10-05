import { addDays, fromISODate, startOfWeek, toISODate } from '@/lib/dates';
import type { Booking, BookingAvailability, BookingStatus } from '@/types';
import { isoWeekday } from '@/features/booking/availability';

/**
 * Calculs de l'agenda du back-office (vues jour, semaine et mois). Fonctions pures.
 */

export type AgendaView = 'jour' | 'semaine' | 'mois';

/** Statuts affichés dans l'agenda et leur présentation. */
export const AGENDA_STATUSES: BookingStatus[] = ['confirme', 'en_cours', 'nouveau'];

export function isConfirmed(booking: Booking): boolean {
  return booking.status === 'confirme';
}

/** Jours affichés par la vue semaine : jours d'ouverture de la semaine (lundi → dimanche). */
export function weekDays(anchor: string, openDays: number[]): string[] {
  const monday = startOfWeek(fromISODate(anchor));
  return Array.from({ length: 7 }, (_, index) => toISODate(addDays(monday, index))).filter((day) =>
    openDays.includes(isoWeekday(day)),
  );
}

/** Heures pleines couvrant toutes les plages horaires (lignes de la grille). */
export function agendaHours(ranges: BookingAvailability['ranges']): string[] {
  if (ranges.length === 0) return [];
  const toHour = (time: string) => Number(time.split(':')[0] ?? 0);
  const first = Math.min(...ranges.map((range) => toHour(range.start)));
  const last = Math.max(...ranges.map((range) => toHour(range.end) - (range.end.endsWith(':00') ? 1 : 0)));
  return Array.from(
    { length: Math.max(0, last - first + 1) },
    (_, index) => `${String(first + index).padStart(2, '0')}:00`,
  );
}

/** L'heure est-elle proposée à la réservation ce jour-là ? */
export function isBookableHour(day: string, hour: string, availability: BookingAvailability): boolean {
  if (!availability.openDays.includes(isoWeekday(day)) || availability.closures.includes(day)) return false;
  return availability.ranges.some((range) => hour >= range.start && hour < range.end);
}

/** Rendez-vous (confirmés ou à confirmer) d'une liste de jours, indexés par « date heure ». */
export function appointmentsByCell(bookings: Booking[], days: string[]): Map<string, Booking[]> {
  const cells = new Map<string, Booking[]>();
  for (const booking of bookings) {
    if (!booking.requestedDate || !booking.requestedTime) continue;
    if (!AGENDA_STATUSES.includes(booking.status) || !days.includes(booking.requestedDate)) continue;
    const key = `${booking.requestedDate} ${booking.requestedTime.slice(0, 2)}:00`;
    cells.set(key, [...(cells.get(key) ?? []), booking]);
  }
  return cells;
}

/** Semaines (lundi → dimanche) couvrant un mois, pour la vue mois. */
export function monthGrid(anchor: string): string[][] {
  const first = fromISODate(`${anchor.slice(0, 7)}-01`);
  const month = anchor.slice(0, 7);
  const weeks: string[][] = [];
  let cursor = startOfWeek(first);
  while (toISODate(cursor).slice(0, 7) <= month) {
    weeks.push(Array.from({ length: 7 }, (_, index) => toISODate(addDays(cursor, index))));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

/** Décale la date de référence selon la vue (jour, semaine ou mois). */
export function shiftAnchor(anchor: string, view: AgendaView, direction: 1 | -1): string {
  const date = fromISODate(anchor);
  if (view === 'jour') return toISODate(addDays(date, direction));
  if (view === 'semaine') return toISODate(addDays(date, 7 * direction));
  return toISODate(new Date(date.getFullYear(), date.getMonth() + direction, 1, 12));
}
