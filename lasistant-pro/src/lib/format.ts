import { fromISODate, TUNIS_TIME_ZONE } from './dates';

/**
 * Formatage pour l'affichage (dates, téléphones, tailles de fichiers).
 * Tout est rédigé en français et exprimé en heure de Tunisie.
 */

const LOCALE = 'fr-FR';

/** « 14 oct. 2026 » à partir d'une date « AAAA-MM-JJ ». */
export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    fromISODate(isoDate),
  );
}

/** « mercredi 14 octobre 2026 » à partir d'une date « AAAA-MM-JJ ». */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromISODate(isoDate));
}

/** « mer. 14 oct. » à partir d'une date « AAAA-MM-JJ ». */
export function formatCompactDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }).format(
    fromISODate(isoDate),
  );
}

/** « 2 oct. · 09:42 » à partir d'un horodatage ISO. */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const day = new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  return `${day} · ${time}`;
}

/** « 2 octobre 2026 » à partir d'un horodatage ISO. */
export function formatPublicationDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TUNIS_TIME_ZONE,
  }).format(new Date(isoTimestamp));
}

const relativeFormatters = {
  long: new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }),
  short: new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto', style: 'short' }),
} as const;

/**
 * « il y a 25 minutes », « hier »… à partir d'un horodatage ISO.
 * Style « short » pour les tableaux : « il y a 4 h », « il y a 25 min ».
 */
export function formatRelative(
  isoTimestamp: string,
  now = new Date(),
  style: 'long' | 'short' = 'long',
): string {
  const formatter = relativeFormatters[style];
  const seconds = Math.round((new Date(isoTimestamp).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'à l’instant';
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return formatter.format(Math.round(seconds / 86400), 'day');
  return formatPublicationDate(isoTimestamp);
}

/** Lien d'appel cliquable : « +216 54 479 391 » → « tel:+21654479391 ». */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '').replace(/^00/, '+');
  return `tel:${digits}`;
}

/** Lien WhatsApp : « +216 54 479 391 » → « https://wa.me/21654479391 ». */
export function whatsappHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/** « 1,2 Mo », « 840 Ko ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} Mo`;
}

/** Pourcentage arrondi : 0,416 → « 42 % ». */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}

/** Durée lisible : 60 → « 1 h », 90 → « 1 h 30 », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`;
}

/** « mercredi 14 oct. 2026 » à partir d'une date « AAAA-MM-JJ ». */
export function formatDayDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fromISODate(isoDate));
}

/** « mercredi » à partir d'une date « AAAA-MM-JJ ». */
export function formatWeekday(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(fromISODate(isoDate));
}

/** « vendredi 2 octobre 2026 à 09:42 » à partir d'un horodatage ISO (heure de Tunisie). */
export function formatLongDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const day = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  return `${day} à ${time}`;
}

/** « Aujourd’hui · 10:02 », « Hier · 16:12 » ou « 30 sept. · 16:12 » (heure de Tunisie). */
export function formatDayAndTime(isoTimestamp: string, now = new Date()): string {
  const dayKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TUNIS_TIME_ZONE }).format(date);
  const date = new Date(isoTimestamp);
  const yesterday = new Date(now.getTime() - 86_400_000);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  if (dayKey(date) === dayKey(now)) return `Aujourd’hui · ${time}`;
  if (dayKey(date) === dayKey(yesterday)) return `Hier · ${time}`;
  return formatDateTime(isoTimestamp);
}

/** « 2 oct. 2026 à 11:05 » à partir d'un horodatage ISO (heure de Tunisie). */
export function formatShortDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const day = new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  return `${day} à ${time}`;
}
