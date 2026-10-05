import { data } from 'react-router';
import { isDataError } from '@/api';

/**
 * Erreurs de navigation levées par les chargeurs de routes.
 * Une ressource absente devient une vraie erreur 404, affichée par la page « introuvable ».
 */

export function notFound(): never {
  throw data('Page introuvable', { status: 404 });
}

/** Exécute un chargement ; une ressource introuvable est convertie en erreur 404. */
export async function orNotFound<T>(load: Promise<T>): Promise<T> {
  try {
    return await load;
  } catch (error) {
    if (isDataError(error, 'not_found')) notFound();
    throw error;
  }
}
