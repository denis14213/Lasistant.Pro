import {
  BOOKING_STATUS_LABELS,
  CONTACT_PREFERENCE_LABELS,
  PROFILE_LABELS,
  SOURCE_LABELS,
} from '@/content/labels';
import { isoDateOf } from '@/lib/dates';
import { formatDateTime, formatShortDate } from '@/lib/format';
import { matchesQuery } from '@/lib/text';
import type { ApplicantProfile, Booking, BookingSource, BookingStatus, Service } from '@/types';
import { requestTopic } from './request-topic';

/**
 * Filtres de la liste des demandes, conservés dans l'adresse de la page
 * (partageables, et le bouton « Retour » retrouve la même sélection).
 */

export type PeriodFilter = 'tout' | '7' | '30' | 'mois';

export interface RequestFilters {
  status: BookingStatus | 'toutes';
  query: string;
  serviceId: string;
  profile: ApplicantProfile | 'tous';
  period: PeriodFilter;
  source: BookingSource | 'toutes';
  assignee: 'tous' | 'moi' | 'aucun';
}

export const DEFAULT_FILTERS: RequestFilters = {
  status: 'toutes',
  query: '',
  serviceId: 'tous',
  profile: 'tous',
  period: 'tout',
  source: 'toutes',
  assignee: 'tous',
};

const PARAMS: Record<keyof RequestFilters, string> = {
  status: 'statut',
  query: 'q',
  serviceId: 'service',
  profile: 'profil',
  period: 'periode',
  source: 'origine',
  assignee: 'assignation',
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export function readFilters(params: URLSearchParams): RequestFilters {
  return {
    status: oneOf(
      params.get(PARAMS.status),
      ['toutes', ...(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[])],
      'toutes',
    ),
    query: params.get(PARAMS.query) ?? '',
    serviceId: params.get(PARAMS.serviceId) ?? 'tous',
    profile: oneOf(
      params.get(PARAMS.profile),
      ['tous', ...(Object.keys(PROFILE_LABELS) as ApplicantProfile[])],
      'tous',
    ),
    period: oneOf(params.get(PARAMS.period), ['tout', '7', '30', 'mois'], 'tout'),
    source: oneOf(
      params.get(PARAMS.source),
      ['toutes', ...(Object.keys(SOURCE_LABELS) as BookingSource[])],
      'toutes',
    ),
    assignee: oneOf(params.get(PARAMS.assignee), ['tous', 'moi', 'aucun'], 'tous'),
  };
}

/** Paramètres d'adresse ; les valeurs par défaut sont omises pour garder une adresse lisible. */
export function writeFilters(filters: RequestFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAMS) as Array<keyof RequestFilters>) {
    const value = filters[key];
    if (value && value !== DEFAULT_FILTERS[key]) params.set(PARAMS[key], value);
  }
  return params;
}

function inPeriod(booking: Booking, period: PeriodFilter, now: number): boolean {
  if (period === 'tout') return true;
  if (period === 'mois')
    return isoDateOf(booking.createdAt).slice(0, 7) === isoDateOf(new Date(now).toISOString()).slice(0, 7);
  return now - new Date(booking.createdAt).getTime() <= Number(period) * 24 * 60 * 60 * 1000;
}

/** Applique tous les filtres sauf le statut (les compteurs des onglets en dépendent). */
export function filterRequests(
  bookings: Booking[],
  filters: RequestFilters,
  context: { now: number; userId: string; services: Service[] },
): Booking[] {
  return bookings.filter(
    (booking) =>
      (filters.serviceId === 'tous' || booking.serviceId === filters.serviceId) &&
      (filters.profile === 'tous' || booking.profile === filters.profile) &&
      (filters.source === 'toutes' || booking.source === filters.source) &&
      (filters.assignee === 'tous' ||
        (filters.assignee === 'moi' ? booking.assigneeId === context.userId : booking.assigneeId === null)) &&
      inPeriod(booking, filters.period, context.now) &&
      matchesQuery(
        [
          booking.fullName,
          booking.email,
          booking.reference,
          booking.phone ?? '',
          requestTopic(booking, context.services),
        ].join(' '),
        filters.query,
      ),
  );
}

/** Lignes de l'export CSV (ouvrable dans Excel). */
export function requestsToRows(bookings: Booking[], services: Service[]): string[][] {
  return [
    [
      'Référence',
      'Reçue le',
      'Demandeur',
      'E-mail',
      'Téléphone',
      'Pays',
      'Origine',
      'Service',
      'Profil',
      'Date souhaitée',
      'Heure',
      'Contact préféré',
      'Statut',
    ],
    ...bookings.map((booking) => [
      booking.reference,
      formatDateTime(booking.createdAt),
      booking.fullName,
      booking.email,
      booking.phone ?? '',
      booking.country ?? '',
      SOURCE_LABELS[booking.source],
      requestTopic(booking, services),
      booking.profile ? PROFILE_LABELS[booking.profile] : '',
      booking.requestedDate ? formatShortDate(booking.requestedDate) : '',
      booking.requestedTime ?? '',
      booking.contactPreference ? CONTACT_PREFERENCE_LABELS[booking.contactPreference] : '',
      BOOKING_STATUS_LABELS[booking.status],
    ]),
  ];
}
