import { BOOKING_STATUS_LABELS } from '@/content/labels';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Booking, BookingEvent, BookingInput, BookingStatus, InternalNote } from '@/types';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';
import { createId, mutateTables, readTable, type MockTables } from '../mock/database';
import { simulateRead, simulateWrite } from '../mock/network';

/**
 * Demandes et réservations (table « bookings ») et leur historique.
 */

/* Limitation du nombre d'envois (protection anti-spam, cahier des charges § 11.4). */
const RATE_LIMIT_KEY = 'lp-submissions';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function assertRateLimit(): void {
  const now = Date.now();
  const recent = readStorage<number[]>(RATE_LIMIT_KEY, [], 'session').filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = Math.min(...recent);
    throw new DataError('rate_limited', DATA_ERROR_MESSAGES.rate_limited, {
      retryAt: new Date(oldest + RATE_LIMIT_WINDOW_MS).toISOString(),
    });
  }
  writeStorage(RATE_LIMIT_KEY, [...recent, now], 'session');
}

function nextReference(bookings: Booking[]): string {
  const max = bookings.reduce((highest, booking) => {
    const number = Number(booking.reference.split('-').pop());
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);
  return `LP-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`;
}

function pushEvent(
  tables: MockTables,
  bookingId: string,
  type: BookingEvent['type'],
  label: string,
  actor: string | null,
): BookingEvent {
  const event: BookingEvent = {
    id: createId('ev'),
    bookingId,
    type,
    label,
    actor,
    createdAt: new Date().toISOString(),
  };
  tables.bookingEvents.push(event);
  return event;
}

function findBooking(tables: MockTables, id: string): Booking {
  const booking = tables.bookings.find((item) => item.id === id);
  if (!booking) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
  return booking;
}

/** Statuts qui réservent un créneau dans l'agenda. */
const SLOT_HOLDING_STATUSES: BookingStatus[] = ['nouveau', 'en_cours', 'confirme'];

export const bookingsRepository = {
  async list(): Promise<Booking[]> {
    return simulateRead(() => readTable('bookings').sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async getById(id: string): Promise<Booking> {
    return simulateRead(() => {
      const booking = readTable('bookings').find((item) => item.id === id);
      if (!booking) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return booking;
    });
  },

  /** Recherche par référence (page de confirmation publique : aucune donnée de tiers). */
  async getByReference(reference: string): Promise<Booking | null> {
    return simulateRead(() => readTable('bookings').find((item) => item.reference === reference) ?? null);
  },

  /** Créneaux déjà pris : seules la date et l'heure sont exposées, jamais l'identité. */
  async listTakenSlots(): Promise<Array<{ date: string; time: string }>> {
    return simulateRead(() =>
      readTable('bookings')
        .filter(
          (item) => item.requestedDate && item.requestedTime && SLOT_HOLDING_STATUSES.includes(item.status),
        )
        .map((item) => ({ date: item.requestedDate as string, time: item.requestedTime as string })),
    );
  },

  /** Enregistre une nouvelle demande et journalise les e-mails automatiques. */
  async create(input: BookingInput): Promise<Booking> {
    return simulateWrite(() => {
      assertRateLimit();
      return mutateTables((tables) => {
        const now = new Date().toISOString();
        const booking: Booking = {
          ...input,
          id: createId('bk'),
          reference: nextReference(tables.bookings),
          status: 'nouveau',
          assigneeId: null,
          consentAt: now,
          createdAt: now,
          updatedAt: now,
        };
        tables.bookings.push(booking);
        const notificationAddress =
          tables.settings.emails.find((entry) => entry.receivesNotifications)?.value ?? 'l’équipe';
        pushEvent(tables, booking.id, 'received', 'Demande reçue via le site', null);
        pushEvent(tables, booking.id, 'email_sent', `E-mail de confirmation envoyé à ${booking.email}`, null);
        pushEvent(
          tables,
          booking.id,
          'notification_sent',
          `Notification envoyée à ${notificationAddress}`,
          null,
        );
        return booking;
      });
    });
  },

  /** Demande saisie par l'équipe (reçue par téléphone, par e-mail…) : pas de limitation d'envoi. */
  async createFromTeam(
    input: BookingInput,
    actor: string,
    status: BookingStatus = 'nouveau',
  ): Promise<Booking> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const now = new Date().toISOString();
        const booking: Booking = {
          ...input,
          id: createId('bk'),
          reference: nextReference(tables.bookings),
          status,
          assigneeId: null,
          consentAt: now,
          createdAt: now,
          updatedAt: now,
        };
        tables.bookings.push(booking);
        pushEvent(tables, booking.id, 'received', 'Demande saisie par l’équipe', actor);
        if (status !== 'nouveau') {
          pushEvent(tables, booking.id, 'status_changed', `Statut : ${BOOKING_STATUS_LABELS[status]}`, actor);
        }
        return booking;
      }),
    );
  },

  async updateStatus(id: string, status: BookingStatus, actor: string): Promise<Booking> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const booking = findBooking(tables, id);
        booking.status = status;
        booking.updatedAt = new Date().toISOString();
        pushEvent(tables, id, 'status_changed', `Statut modifié : ${BOOKING_STATUS_LABELS[status]}`, actor);
        if (status === 'confirme') {
          pushEvent(
            tables,
            id,
            'email_sent',
            `E-mail « Rendez-vous confirmé » envoyé à ${booking.email}`,
            null,
          );
        }
        return booking;
      }),
    );
  },

  async assign(id: string, assignee: { id: string; name: string } | null, actor: string): Promise<Booking> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const booking = findBooking(tables, id);
        booking.assigneeId = assignee?.id ?? null;
        booking.updatedAt = new Date().toISOString();
        pushEvent(
          tables,
          id,
          'assigned',
          assignee ? `Demande assignée à ${assignee.name}` : 'Demande désassignée',
          actor,
        );
        return booking;
      }),
    );
  },

  /** Trace la première consultation d'une demande par un membre de l'équipe. */
  async markViewed(id: string, actor: string): Promise<void> {
    return simulateRead(() => {
      mutateTables((tables) => {
        const alreadyViewed = tables.bookingEvents.some(
          (event) => event.bookingId === id && event.type === 'viewed' && event.actor === actor,
        );
        if (!alreadyViewed) pushEvent(tables, id, 'viewed', 'Demande consultée', actor);
      });
    });
  },

  async listEvents(bookingId: string): Promise<BookingEvent[]> {
    return simulateRead(() =>
      readTable('bookingEvents')
        .filter((event) => event.bookingId === bookingId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  },

  async listNotes(bookingId: string): Promise<InternalNote[]> {
    return simulateRead(() =>
      readTable('notes')
        .filter((note) => note.bookingId === bookingId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async addNote(bookingId: string, text: string, author: string): Promise<InternalNote> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const note: InternalNote = {
          id: createId('note'),
          bookingId,
          author,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        tables.notes.push(note);
        pushEvent(tables, bookingId, 'note_added', 'Note interne ajoutée', author);
        return note;
      }),
    );
  },

  /** Trace l'envoi d'une réponse standard (l'envoi réel sera assuré côté serveur en phase 2). */
  async logReply(
    bookingId: string,
    subject: string,
    recipient: string,
    actor: string,
  ): Promise<BookingEvent> {
    return simulateWrite(() =>
      mutateTables((tables) =>
        pushEvent(tables, bookingId, 'reply_sent', `E-mail « ${subject} » envoyé à ${recipient}`, actor),
      ),
    );
  },
};
