import { FunctionsHttpError } from '@supabase/supabase-js';
import type { DataErrorCode } from '@/types';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';
import { getSupabase } from './client';
import { toDataError } from './errors';

/**
 * Appel des Edge Functions (opérations qui exigent la clé secrète, côté serveur uniquement).
 * Réponse attendue : { data } en cas de succès, { error: { code, message } } sinon.
 */

const KNOWN_CODES: readonly DataErrorCode[] = [
  'validation',
  'forbidden',
  'not_found',
  'rate_limited',
  'server',
];

export async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  let response: { data: { data?: T } | null; error: unknown };
  try {
    response = await getSupabase().functions.invoke<{ data?: T }>(name, { body });
  } catch (error) {
    throw toDataError(error);
  }

  if (response.error) {
    if (response.error instanceof FunctionsHttpError) {
      const payload = (await response.error.context.json().catch(() => null)) as {
        error?: { code?: string; message?: string; retryAt?: string | null };
      } | null;
      const code = payload?.error?.code;
      const message = payload?.error?.message;
      const retryAt = payload?.error?.retryAt ?? undefined;
      if (code === 'unauthorized') {
        throw new DataError('forbidden', message ?? 'Votre session a expiré. Reconnectez-vous.');
      }
      const known = KNOWN_CODES.find((candidate) => candidate === code);
      if (known) throw new DataError(known, message ?? DATA_ERROR_MESSAGES[known], { retryAt });
    }
    throw toDataError(response.error);
  }
  if (!response.data || response.data.data === undefined) {
    throw new DataError('server', DATA_ERROR_MESSAGES.server);
  }
  return response.data.data;
}
