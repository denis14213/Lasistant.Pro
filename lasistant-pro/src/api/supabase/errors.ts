import { DATA_ERROR_MESSAGES, DataError } from '../errors';

/**
 * Traduction des erreurs Supabase en `DataError` (message affichable tel quel).
 *
 * Erreurs métier : les fonctions de la base lèvent `message` = code (validation, forbidden,
 * rate_limited, not_found) et `detail` = texte destiné à l'utilisateur.
 * Erreurs techniques : codes PostgreSQL / PostgREST / HTTP, traduits en messages génériques.
 */

/** Messages propres à l'opération, pour les erreurs d'intégrité courantes. */
export interface ErrorContext {
  /** Doublon (contrainte d'unicité) */
  duplicate?: string;
  /** Élément encore utilisé ailleurs (clé étrangère) */
  inUse?: string;
  /** Élément introuvable */
  notFound?: string;
}

interface RawError {
  code?: string;
  message?: string;
  details?: string;
  status?: number;
  name?: string;
}

const BUSINESS_CODES = ['validation', 'forbidden', 'rate_limited', 'not_found'] as const;

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export function toDataError(error: unknown, context: ErrorContext = {}): DataError {
  if (error instanceof DataError) return error;
  if (isOffline()) return new DataError('offline', DATA_ERROR_MESSAGES.offline);

  const raw = (typeof error === 'object' && error !== null ? error : {}) as RawError;
  const message = raw.message ?? '';
  const details = raw.details?.trim() || undefined;

  const business = BUSINESS_CODES.find((code) => code === message);
  if (business === 'rate_limited') {
    return new DataError('rate_limited', DATA_ERROR_MESSAGES.rate_limited, { retryAt: details });
  }
  if (business) return new DataError(business, details ?? DATA_ERROR_MESSAGES[business]);

  switch (raw.code) {
    case '23505':
      return new DataError('validation', context.duplicate ?? 'Cet élément existe déjà.');
    case '23503':
      return new DataError(
        'validation',
        context.inUse ?? 'Cet élément est encore utilisé ailleurs : il ne peut pas être supprimé.',
      );
    case '23514':
    case '23502':
    case '22P02':
    case '22001':
      return new DataError('validation', DATA_ERROR_MESSAGES.validation);
    case 'PGRST116':
      return new DataError('not_found', context.notFound ?? DATA_ERROR_MESSAGES.not_found);
    case '42501':
      return new DataError('forbidden', DATA_ERROR_MESSAGES.forbidden);
    case 'PGRST301':
    case 'PGRST302':
      return new DataError('forbidden', 'Votre session a expiré. Reconnectez-vous pour continuer.');
    default:
      break;
  }
  if (raw.status === 401 || raw.status === 403) {
    return new DataError('forbidden', DATA_ERROR_MESSAGES.forbidden);
  }
  return new DataError('server', DATA_ERROR_MESSAGES.server);
}

/** Résultat d'une requête Supabase : les données, ou une `DataError`. */
export function unwrap<T>(result: { data: T | null; error: unknown }, context?: ErrorContext): T {
  if (result.error) throw toDataError(result.error, context);
  if (result.data === null)
    throw new DataError('not_found', context?.notFound ?? DATA_ERROR_MESSAGES.not_found);
  return result.data;
}

/** Variante pour les opérations sans contenu de retour. */
export function ensureOk(result: { error: unknown }, context?: ErrorContext): void {
  if (result.error) throw toDataError(result.error, context);
}

/** Appel réseau protégé : les exceptions (réseau coupé…) deviennent des `DataError`. */
export async function guard<T>(operation: () => PromiseLike<T>, context?: ErrorContext): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toDataError(error, context);
  }
}
