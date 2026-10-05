import { describe, expect, it } from 'vitest';
import type { BookingAvailability } from '@/types';
import {
  dailySlots,
  firstAvailableDay,
  isOpenDay,
  isoWeekday,
  isSlotAvailable,
  lastBookableDay,
  slotsForDay,
  tunisInstant,
  type AvailabilityContext,
} from './availability';

/** Disponibilités de référence : du lundi au vendredi, 9 h – 12 h et 14 h – 17 h, échanges d'une heure. */
const AVAILABILITY: BookingAvailability = {
  enabled: true,
  durationMinutes: 60,
  openDays: [1, 2, 3, 4, 5],
  ranges: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' },
  ],
  minNoticeHours: 24,
  horizonDays: 30,
  closures: [],
};

/** Lundi 5 octobre 2026, 8 h à Tunis (7 h UTC). */
const MONDAY_8AM = Date.UTC(2026, 9, 5, 7, 0);

const context = (overrides: Partial<AvailabilityContext> = {}): AvailabilityContext => ({
  availability: AVAILABILITY,
  taken: [],
  now: MONDAY_8AM,
  ...overrides,
});

describe('créneaux de réservation', () => {
  it('découpe chaque plage horaire selon la durée des échanges', () => {
    expect(dailySlots(AVAILABILITY)).toEqual(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
    expect(dailySlots({ ...AVAILABILITY, durationMinutes: 90 })).toEqual([
      '09:00',
      '10:30',
      '14:00',
      '15:30',
    ]);
    expect(dailySlots({ ...AVAILABILITY, durationMinutes: 0 })).toEqual([]);
  });

  it('exprime les heures en heure de Tunisie (UTC+1, sans heure d’été)', () => {
    expect(new Date(tunisInstant('2026-10-14', '10:00')).toISOString()).toBe('2026-10-14T09:00:00.000Z');
    expect(new Date(tunisInstant('2026-07-14', '10:00')).toISOString()).toBe('2026-07-14T09:00:00.000Z');
  });

  it('numérote les jours de la semaine du lundi (1) au dimanche (7)', () => {
    expect(isoWeekday('2026-10-05')).toBe(1);
    expect(isoWeekday('2026-10-11')).toBe(7);
  });

  it('ferme les week-ends, les fermetures exceptionnelles et les jours hors horizon', () => {
    expect(isOpenDay('2026-10-06', context())).toBe(true);
    expect(isOpenDay('2026-10-10', context())).toBe(false);
    expect(
      isOpenDay('2026-10-06', context({ availability: { ...AVAILABILITY, closures: ['2026-10-06'] } })),
    ).toBe(false);
    expect(isOpenDay('2026-10-01', context())).toBe(false);
    expect(lastBookableDay(context())).toBe('2026-11-04');
    expect(isOpenDay('2026-11-05', context())).toBe(false);
    expect(isOpenDay('2026-10-06', context({ availability: { ...AVAILABILITY, enabled: false } }))).toBe(
      false,
    );
  });

  it('respecte le délai minimal et les créneaux déjà réservés', () => {
    // Lundi 10 h 30 à Tunis : avec 24 h de délai, rien avant mardi 10 h 30.
    const mondayMorning = Date.UTC(2026, 9, 5, 9, 30);
    const tuesday = slotsForDay(
      '2026-10-06',
      context({ now: mondayMorning, taken: [{ date: '2026-10-06', time: '14:00' }] }),
    );
    expect(tuesday.find((slot) => slot.time === '09:00')?.status).toBe('too-soon');
    expect(tuesday.find((slot) => slot.time === '10:00')?.status).toBe('too-soon');
    expect(tuesday.find((slot) => slot.time === '11:00')?.status).toBe('available');
    expect(tuesday.find((slot) => slot.time === '14:00')?.status).toBe('taken');
  });

  it('trouve le premier jour disposant d’un créneau libre', () => {
    expect(firstAvailableDay(context())).toBe('2026-10-06');
    const fullTuesday = dailySlots(AVAILABILITY).map((time) => ({ date: '2026-10-06', time }));
    expect(firstAvailableDay(context({ taken: fullTuesday }))).toBe('2026-10-07');
    expect(firstAvailableDay(context({ availability: { ...AVAILABILITY, openDays: [] } }))).toBeNull();
  });

  it('revérifie un créneau avant l’envoi', () => {
    expect(isSlotAvailable('2026-10-07', '10:00', context())).toBe(true);
    expect(
      isSlotAvailable('2026-10-07', '10:00', context({ taken: [{ date: '2026-10-07', time: '10:00' }] })),
    ).toBe(false);
    expect(isSlotAvailable('2026-10-07', '12:30', context())).toBe(false);
  });
});
