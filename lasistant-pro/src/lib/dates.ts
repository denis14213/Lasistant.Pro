/**
 * Utilitaires de dates.
 * Convention : les dates de rendez-vous sont stockées au format « AAAA-MM-JJ »
 * et les heures au format « HH:MM », toujours exprimées en heure de Tunisie.
 * Les horodatages (création, modification) sont des chaînes ISO 8601.
 */

export const TUNIS_TIME_ZONE = 'Africa/Tunis';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Date « AAAA-MM-JJ » d'un objet Date, dans le fuseau local. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convertit « AAAA-MM-JJ » en Date locale à midi (évite les décalages de fuseau). */
export function fromISODate(value: string): Date {
  const [y = 1970, m = 1, d = 1] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addMonths(date: Date, months: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
  return copy;
}

/** Lundi de la semaine contenant la date (la semaine commence le lundi en France et en Tunisie). */
export function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  const day = (copy.getDay() + 6) % 7; // 0 = lundi
  return addDays(copy, -day);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

/** Différence en jours calendaires entre deux dates. */
export function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

/** Numéro de semaine ISO 8601 (1 à 53). */
export function isoWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = (target.getTime() - firstThursday.getTime()) / MS_PER_DAY;
  return 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

/**
 * Horodatage ISO décalé de quelques jours par rapport à maintenant, à une heure donnée
 * (données de démonstration).
 * Pour le jour même, une heure pas encore atteinte est placée juste avant l'instant présent :
 * aucune donnée n'est datée dans le futur et l'ordre chronologique est conservé.
 */
export function isoDaysAgo(days: number, time = '10:00', now = new Date()): string {
  const [h = 10, min = 0] = time.split(':').map(Number);
  if (days === 0) {
    const midnight = startOfDay(now).getTime();
    const target = midnight + (h * 60 + min) * 60_000;
    const limit = now.getTime() - 5 * 60_000;
    if (target <= limit) return new Date(target).toISOString();
    const ratio = (target - limit) / (midnight + MS_PER_DAY - limit);
    return new Date(limit + ratio * 4 * 60_000).toISOString();
  }
  const date = addDays(now, -days);
  date.setHours(h, min, 0, 0);
  return date.toISOString();
}

/** Date « AAAA-MM-JJ » située N jours après aujourd'hui. */
export function isoDateInDays(days: number, now = new Date()): string {
  return toISODate(addDays(now, days));
}

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TUNIS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Date « AAAA-MM-JJ », en heure de Tunisie, d'un horodatage ISO. */
export function isoDateOf(timestamp: string): string {
  return isoDateFormatter.format(new Date(timestamp));
}
