import { describe, expect, it } from 'vitest';
import { hoursBefore, makeBooking } from '@/test/fixtures';
import {
  countByService,
  isOverdue,
  receivedInPreviousPeriod,
  receivedWithin,
  upcomingAppointments,
  weeklyCounts,
} from './request-stats';
import {
  DEFAULT_FILTERS,
  filterRequests,
  readFilters,
  requestsToRows,
  writeFilters,
} from './request-filters';

/** Dimanche 4 octobre 2026, 12 h UTC. */
const NOW = Date.UTC(2026, 9, 4, 12, 0);

describe('indicateurs des demandes', () => {
  it('signale une demande nouvelle non traitée depuis plus de 24 h', () => {
    expect(isOverdue(makeBooking({ status: 'nouveau', createdAt: hoursBefore(NOW, 30) }), NOW)).toBe(true);
    expect(isOverdue(makeBooking({ status: 'nouveau', createdAt: hoursBefore(NOW, 3) }), NOW)).toBe(false);
    expect(isOverdue(makeBooking({ status: 'en_cours', createdAt: hoursBefore(NOW, 30) }), NOW)).toBe(false);
  });

  it('liste les rendez-vous à venir dans l’ordre chronologique', () => {
    const later = makeBooking({
      id: 'b',
      status: 'confirme',
      requestedDate: '2026-10-08',
      requestedTime: '09:00',
    });
    const sooner = makeBooking({
      id: 'a',
      status: 'en_cours',
      requestedDate: '2026-10-05',
      requestedTime: '15:00',
    });
    const past = makeBooking({
      id: 'c',
      status: 'confirme',
      requestedDate: '2026-10-01',
      requestedTime: '10:00',
    });
    const cancelled = makeBooking({
      id: 'd',
      status: 'annule',
      requestedDate: '2026-10-06',
      requestedTime: '10:00',
    });
    expect(
      upcomingAppointments([later, past, cancelled, sooner], '2026-10-04').map((booking) => booking.id),
    ).toEqual(['a', 'b']);
  });

  it('compare la période en cours à la précédente', () => {
    const bookings = [
      makeBooking({ id: 'recent', createdAt: hoursBefore(NOW, 24) }),
      makeBooking({ id: 'previous', createdAt: hoursBefore(NOW, 24 * 10) }),
      makeBooking({ id: 'old', createdAt: hoursBefore(NOW, 24 * 20) }),
    ];
    expect(receivedWithin(bookings, 7, NOW).map((booking) => booking.id)).toEqual(['recent']);
    expect(receivedInPreviousPeriod(bookings, 7, NOW).map((booking) => booking.id)).toEqual(['previous']);
  });

  it('compte les demandes par semaine et par service', () => {
    const bookings = [
      makeBooking({ createdAt: '2026-10-01T09:00:00.000Z', serviceId: 'logement-hebergement' }),
      makeBooking({ createdAt: '2026-10-02T09:00:00.000Z', serviceId: 'logement-hebergement' }),
      makeBooking({ createdAt: '2026-09-23T09:00:00.000Z', serviceId: 'assistance-medicale' }),
    ];
    const weeks = weeklyCounts(bookings, 3, NOW);
    expect(weeks.map((week) => [week.start, week.count, week.current])).toEqual([
      ['2026-09-14', 0, false],
      ['2026-09-21', 1, false],
      ['2026-09-28', 2, true],
    ]);
    expect(countByService(bookings)).toEqual([
      { serviceId: 'logement-hebergement', count: 2 },
      { serviceId: 'assistance-medicale', count: 1 },
    ]);
  });
});

describe('filtres de la liste des demandes', () => {
  it('lit et écrit les filtres dans l’adresse, sans les valeurs par défaut', () => {
    const filters = readFilters(new URLSearchParams('statut=nouveau&q=kone&periode=7&profil=inconnu'));
    expect(filters).toEqual({ ...DEFAULT_FILTERS, status: 'nouveau', query: 'kone', period: '7' });
    expect(writeFilters(filters).toString()).toBe('statut=nouveau&q=kone&periode=7');
    expect(writeFilters(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('combine recherche, origine, période et assignation', () => {
    const context = { now: NOW, userId: 'usr-operateur-1', services: [] };
    const bookings = [
      makeBooking({
        id: 'mine',
        fullName: 'Awa Koné',
        email: 'awa.kone@exemple.com',
        assigneeId: 'usr-operateur-1',
        createdAt: hoursBefore(NOW, 2),
      }),
      makeBooking({
        id: 'free',
        fullName: 'Karim Ben Salah',
        email: 'karim@exemple.com',
        assigneeId: null,
        source: 'contact',
        createdAt: hoursBefore(NOW, 2),
      }),
      makeBooking({
        id: 'old',
        fullName: 'Awa Diallo',
        email: 'a.diallo@exemple.com',
        assigneeId: null,
        createdAt: hoursBefore(NOW, 24 * 40),
      }),
    ];
    const ids = (overrides: Partial<typeof DEFAULT_FILTERS>) =>
      filterRequests(bookings, { ...DEFAULT_FILTERS, ...overrides }, context).map((booking) => booking.id);
    expect(ids({ query: 'awa kone' })).toEqual(['mine']);
    expect(ids({ query: 'AWA' })).toEqual(['mine', 'old']);
    expect(ids({ source: 'contact' })).toEqual(['free']);
    expect(ids({ period: '30' })).toEqual(['mine', 'free']);
    expect(ids({ assignee: 'moi' })).toEqual(['mine']);
    expect(ids({ assignee: 'aucun' })).toEqual(['free', 'old']);
  });

  it('prépare l’export CSV avec une ligne d’en-tête', () => {
    const rows = requestsToRows([makeBooking()], []);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.[0]).toBe('Référence');
    expect(rows[1]?.[0]).toBe('LP-2026-0148');
    expect(rows[1]?.at(-1)).toBe('Nouveau');
  });
});
