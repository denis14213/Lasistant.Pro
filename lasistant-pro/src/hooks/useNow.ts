import { useSyncExternalStore } from 'react';
import { isoDateOf } from '@/lib/dates';

/**
 * Heure courante, rafraîchie à intervalle régulier (comptes à rebours, durées relatives, date du jour).
 * L'horloge est traitée comme une source externe : le rendu reste pur et prévisible.
 * Un composant n'est réaffiché que si la valeur observée change (seconde, minute ou jour).
 */

function createClock<T>(intervalMs: number, read: () => T) {
  const listeners = new Set<() => void>();
  let timer: number | null = null;
  return {
    subscribe(callback: () => void): () => void {
      listeners.add(callback);
      timer ??= window.setInterval(() => listeners.forEach((listener) => listener()), intervalMs);
      return () => {
        listeners.delete(callback);
        if (listeners.size === 0 && timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      };
    },
    getSnapshot: read,
  };
}

const secondClock = createClock(1000, () => Math.floor(Date.now() / 1000) * 1000);
const minuteClock = createClock(15_000, () => Math.floor(Date.now() / 60_000) * 60_000);
const dayClock = createClock(60_000, () => isoDateOf(new Date().toISOString()));

/** Horodatage courant (en millisecondes), mis à jour chaque seconde. */
export function useNow(): number {
  return useSyncExternalStore(secondClock.subscribe, secondClock.getSnapshot, secondClock.getSnapshot);
}

/** Horodatage courant arrondi à la minute (durées relatives « il y a 5 min »). */
export function useCurrentMinute(): number {
  return useSyncExternalStore(minuteClock.subscribe, minuteClock.getSnapshot, minuteClock.getSnapshot);
}

/** Date du jour en Tunisie (« AAAA-MM-JJ ») ; change uniquement à minuit. */
export function useToday(): string {
  return useSyncExternalStore(dayClock.subscribe, dayClock.getSnapshot, dayClock.getSnapshot);
}

/** Temps restant avant l'échéance, au format « 04:58 » ; null une fois l'échéance passée. */
export function useCountdown(targetIso: string | null): string | null {
  const now = useNow();
  if (!targetIso) return null;
  const remaining = Math.max(0, Math.ceil((new Date(targetIso).getTime() - now) / 1000));
  if (remaining === 0) return null;
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
