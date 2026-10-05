import { PREVIEW_BOOKING } from '@/content/demo/email-preview';
import type { Booking } from '@/types';

/** Demande fictive pour les tests ; seuls les champs utiles au test sont précisés. */
export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return { ...PREVIEW_BOOKING, ...overrides };
}

/** Horodatage ISO situé `hours` heures avant `now`. */
export function hoursBefore(now: number, hours: number): string {
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}
