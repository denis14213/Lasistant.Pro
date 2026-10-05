import { addDays, fromISODate, isoDateOf, toISODate } from '@/lib/dates';
import type { BookingAvailability } from '@/types';

/**
 * Calcul des créneaux proposés dans la réservation en ligne.
 *
 * Règles (réglables dans le back-office, rubrique Agenda) :
 * - jours d'ouverture et plages horaires ;
 * - durée d'un échange (un créneau commence toutes les « durée » minutes) ;
 * - délai minimal avant un rendez-vous et horizon de réservation ;
 * - jours de fermeture exceptionnelle ;
 * - créneaux déjà réservés.
 *
 * Toutes les heures sont exprimées en heure de Tunisie. La Tunisie n'applique pas
 * l'heure d'été : l'heure locale correspond à UTC+1 toute l'année.
 *
 * Fonctions pures (aucune lecture de l'heure système) : faciles à tester.
 */

const TUNIS_UTC_OFFSET_HOURS = 1;
const HOUR_MS = 60 * 60 * 1000;

export type SlotStatus = 'available' | 'taken' | 'too-soon';

export interface Slot {
  time: string;
  status: SlotStatus;
}

export interface AvailabilityContext {
  availability: BookingAvailability;
  /** Créneaux déjà réservés (date « AAAA-MM-JJ » et heure « HH:MM ») */
  taken: ReadonlyArray<{ date: string; time: string }>;
  /** Instant de référence, en millisecondes */
  now: number;
}

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Instant (en millisecondes) correspondant à une date et une heure de Tunisie. */
export function tunisInstant(isoDate: string, time: string): number {
  const [year = 1970, month = 1, day = 1] = isoDate.split('-').map(Number);
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hours - TUNIS_UTC_OFFSET_HOURS, minutes);
}

/** Jour de la semaine ISO : 1 = lundi … 7 = dimanche. */
export function isoWeekday(isoDate: string): number {
  const day = fromISODate(isoDate).getDay();
  return day === 0 ? 7 : day;
}

/** Heures de début des échanges sur une journée type. */
export function dailySlots({
  ranges,
  durationMinutes,
}: Pick<BookingAvailability, 'ranges' | 'durationMinutes'>): string[] {
  const slots: string[] = [];
  if (durationMinutes <= 0) return slots;
  for (const range of ranges) {
    const end = toMinutes(range.end);
    for (let start = toMinutes(range.start); start + durationMinutes <= end; start += durationMinutes) {
      slots.push(fromMinutes(start));
    }
  }
  return slots;
}

/** Date du jour en Tunisie. */
export function tunisToday(now: number): string {
  return isoDateOf(new Date(now).toISOString());
}

/** Dernier jour réservable (horizon de réservation). */
export function lastBookableDay({ availability, now }: AvailabilityContext): string {
  return toISODate(addDays(fromISODate(tunisToday(now)), availability.horizonDays));
}

/** Le jour est-il ouvert à la réservation (indépendamment des créneaux restants) ? */
export function isOpenDay(isoDate: string, context: AvailabilityContext): boolean {
  const { availability, now } = context;
  if (!availability.enabled) return false;
  if (!availability.openDays.includes(isoWeekday(isoDate))) return false;
  if (availability.closures.includes(isoDate)) return false;
  return isoDate >= tunisToday(now) && isoDate <= lastBookableDay(context);
}

/** Créneaux d'un jour et leur disponibilité ; liste vide si le jour est fermé. */
export function slotsForDay(isoDate: string, context: AvailabilityContext): Slot[] {
  if (!isOpenDay(isoDate, context)) return [];
  const takenTimes = new Set(context.taken.filter((slot) => slot.date === isoDate).map((slot) => slot.time));
  const earliest = context.now + context.availability.minNoticeHours * HOUR_MS;
  return dailySlots(context.availability).map((time) => ({
    time,
    status: takenTimes.has(time)
      ? 'taken'
      : tunisInstant(isoDate, time) < earliest
        ? 'too-soon'
        : 'available',
  }));
}

/** Au moins un créneau libre ce jour-là. */
export function hasAvailableSlot(isoDate: string, context: AvailabilityContext): boolean {
  return slotsForDay(isoDate, context).some((slot) => slot.status === 'available');
}

/** Premier jour proposant un créneau libre, ou null si aucun dans l'horizon. */
export function firstAvailableDay(context: AvailabilityContext): string | null {
  const last = lastBookableDay(context);
  for (let day = tunisToday(context.now); day <= last; day = toISODate(addDays(fromISODate(day), 1))) {
    if (hasAvailableSlot(day, context)) return day;
  }
  return null;
}

/** Le créneau choisi est-il toujours libre ? */
export function isSlotAvailable(isoDate: string, time: string, context: AvailabilityContext): boolean {
  return slotsForDay(isoDate, context).some((slot) => slot.time === time && slot.status === 'available');
}
