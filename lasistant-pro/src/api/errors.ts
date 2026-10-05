import type { DataErrorCode } from '@/types';

/**
 * Erreur métier de la couche de données.
 * Le message est destiné au visiteur : il est affiché tel quel dans l'interface.
 */
export class DataError extends Error {
  readonly code: DataErrorCode;
  /** Horodatage ISO à partir duquel un nouvel essai est possible (limitation des envois) */
  readonly retryAt: string | null;

  constructor(code: DataErrorCode, message: string, options: { retryAt?: string } = {}) {
    super(message);
    this.name = 'DataError';
    this.code = code;
    this.retryAt = options.retryAt ?? null;
  }
}

export const DATA_ERROR_MESSAGES: Record<DataErrorCode, string> = {
  offline: 'Vous êtes hors connexion. Vos informations sont conservées : réessayez dès le retour du réseau.',
  rate_limited:
    'Plusieurs envois ont été effectués en peu de temps. Pour des raisons de sécurité, merci de patienter quelques minutes avant de réessayer.',
  not_found: 'Cet élément est introuvable. Il a peut-être été supprimé.',
  server: 'Un problème technique nous empêche d’enregistrer votre demande. Vos informations sont conservées.',
  validation: 'Certaines informations sont invalides. Vérifiez le formulaire.',
  forbidden: 'Votre rôle ne permet pas d’effectuer cette action.',
};

/** Message lisible pour n'importe quelle erreur (repli générique si l'erreur est inattendue). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DataError) return error.message;
  return DATA_ERROR_MESSAGES.server;
}

export function isDataError(error: unknown, code?: DataErrorCode): error is DataError {
  return error instanceof DataError && (code === undefined || error.code === code);
}
