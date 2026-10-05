import { isRouteErrorResponse } from 'react-router';
import { isDataError } from '@/api';

/**
 * Classement des erreurs de navigation, pour afficher l'écran adapté.
 */
export type ErrorKind = 'not-found' | 'offline' | 'technical';

/** Échec de chargement d'un fichier de l'application (réseau coupé ou nouvelle version publiée). */
function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(
      error.message,
    )
  );
}

export function classifyError(error: unknown): ErrorKind {
  if (isRouteErrorResponse(error) && error.status === 404) return 'not-found';
  if (isDataError(error, 'not_found')) return 'not-found';
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (offline || isDataError(error, 'offline') || isChunkLoadError(error)) return 'offline';
  return 'technical';
}
