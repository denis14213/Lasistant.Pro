import { env } from '@/config/env';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';

/**
 * Simulation du réseau en phase statique.
 * - Les lectures sont immédiates : le site s'affiche sans attente.
 * - Les écritures subissent une latence configurable (VITE_MOCK_LATENCY_MS)
 *   pour rendre visibles les états « Envoi en cours… ».
 * - Hors connexion, les écritures échouent comme le ferait une vraie API.
 */

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function assertOnline(): void {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new DataError('offline', DATA_ERROR_MESSAGES.offline);
  }
}

/** Lecture simulée : renvoie le résultat au prochain tour de boucle. */
export async function simulateRead<T>(read: () => T): Promise<T> {
  await Promise.resolve();
  return read();
}

/** Écriture simulée : vérifie la connexion, attend la latence configurée, puis applique. */
export async function simulateWrite<T>(write: () => T): Promise<T> {
  assertOnline();
  const latency = env.isTest ? 0 : env.mockLatencyMs;
  if (latency > 0) await wait(latency);
  assertOnline();
  return write();
}
