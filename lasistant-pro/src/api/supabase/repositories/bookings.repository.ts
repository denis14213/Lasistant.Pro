import type { BookingsRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { getSupabase } from '../client';
import type { InsertRow, Row } from '../database.types';
import { ensureOk, guard, toDataError, unwrap } from '../errors';
import {
  fromBookingInput,
  toBooking,
  toBookingConfirmation,
  toBookingEvent,
  toInternalNote,
  toSubmissionPayload,
} from '../mappers';
import { BUCKETS, SIGNED_URL_TTL_SECONDS, storagePath } from '../storage';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Demandes et réservations (table « bookings ») et leur historique.
 *
 * - Les visiteurs n'écrivent jamais directement dans la table : la fonction `submit_booking`
 *   contrôle les données, limite les envois (5 par adresse IP sur 10 minutes), vérifie le
 *   créneau et attribue la référence.
 * - L'historique (« booking_events ») est tenu par la base : changement de statut,
 *   assignation et note ajoutent automatiquement leur ligne, avec l'auteur de l'action.
 */
export const bookingsRepository: BookingsRepository = {
  async list() {
    const result = await guard(() =>
      getSupabase().from('bookings').select('*').order('created_at', { ascending: false }),
    );
    return unwrap(result).map(toBooking);
  },

  async getById(id) {
    if (!UUID_PATTERN.test(id)) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
    const result = await guard(() => getSupabase().from('bookings').select('*').eq('id', id).maybeSingle());
    return toBooking(unwrap(result));
  },

  async getConfirmation(reference, key) {
    if (!UUID_PATTERN.test(key)) return null;
    const result = await guard(() =>
      getSupabase().rpc('booking_confirmation', { p_reference: reference, p_key: key }),
    );
    if (result.error) throw toDataError(result.error);
    return result.data ? toBookingConfirmation(result.data) : null;
  },

  async listTakenSlots() {
    const result = await guard(() => getSupabase().rpc('taken_slots'));
    return unwrap(result).map((slot) => ({ date: slot.slot_date, time: slot.slot_time }));
  },

  async create(input) {
    const result = await guard(() =>
      getSupabase().rpc('submit_booking', { p_booking: toSubmissionPayload(input) }),
    );
    return toBooking(unwrap(result) as unknown as Row<'bookings'>);
  },

  async uploadAttachment(file) {
    const path = storagePath('demandes', file.name, true);
    const result = await guard(() =>
      getSupabase().storage.from(BUCKETS.documents).upload(path, file, {
        contentType: file.type,
        upsert: false,
      }),
    );
    ensureOk(result);
    return path;
  },

  async attachmentUrl(path) {
    const result = await guard(() =>
      getSupabase().storage.from(BUCKETS.documents).createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
    );
    return result.error ? null : result.data.signedUrl;
  },

  /** Demande reçue par téléphone ou par e-mail, saisie par l'équipe (sans limitation d'envoi). */
  async createFromTeam(input, _actor, status = 'nouveau') {
    // Référence, dates et historique sont fixés par la base (colonnes non modifiables).
    const row = { ...fromBookingInput(input), status } as InsertRow<'bookings'>;
    const result = await guard(() => getSupabase().from('bookings').insert(row).select('*').single());
    return toBooking(unwrap(result, { duplicate: 'Ce créneau est déjà réservé par une autre demande.' }));
  },

  async updateStatus(id, status) {
    const result = await guard(() =>
      getSupabase().from('bookings').update({ status }).eq('id', id).select('*').single(),
    );
    return toBooking(unwrap(result, { duplicate: 'Ce créneau est déjà réservé par une autre demande.' }));
  },

  async assign(id, assignee) {
    const result = await guard(() =>
      getSupabase()
        .from('bookings')
        .update({ assignee_id: assignee?.id ?? null })
        .eq('id', id)
        .select('*')
        .single(),
    );
    return toBooking(unwrap(result));
  },

  async markViewed(id) {
    ensureOk(await guard(() => getSupabase().rpc('mark_booking_viewed', { p_booking_id: id })));
  },

  async listEvents(bookingId) {
    const result = await guard(() =>
      getSupabase()
        .from('booking_events')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true }),
    );
    return unwrap(result).map(toBookingEvent);
  },

  async listNotes(bookingId) {
    const result = await guard(() =>
      getSupabase()
        .from('internal_notes')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false }),
    );
    return unwrap(result).map(toInternalNote);
  },

  /** L'auteur de la note est la personne connectée (fixé par la base). */
  async addNote(bookingId, text) {
    const result = await guard(() =>
      getSupabase()
        .from('internal_notes')
        .insert({ booking_id: bookingId, text: text.trim() })
        .select('*')
        .single(),
    );
    return toInternalNote(unwrap(result));
  },

  async logReply(bookingId, subject, recipient) {
    const result = await guard(() =>
      getSupabase().rpc('log_booking_reply', {
        p_booking_id: bookingId,
        p_subject: subject,
        p_recipient: recipient,
      }),
    );
    return toBookingEvent(unwrap(result));
  },
};
