/**
 * Accès sécurisé au stockage du navigateur.
 * Le stockage peut être indisponible (navigation privée, quota atteint,
 * cookies bloqués) : chaque accès est protégé et n'interrompt jamais l'application.
 */

type StorageArea = 'local' | 'session';

function getArea(area: StorageArea): Storage | null {
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Lit une valeur JSON ; renvoie la valeur par défaut si absente ou illisible. */
export function readStorage<T>(key: string, fallback: T, area: StorageArea = 'local'): T {
  try {
    const raw = getArea(area)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Écrit une valeur JSON ; renvoie false si l'écriture a échoué. */
export function writeStorage<T>(key: string, value: T, area: StorageArea = 'local'): boolean {
  try {
    getArea(area)?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string, area: StorageArea = 'local'): void {
  try {
    getArea(area)?.removeItem(key);
  } catch {
    // Stockage indisponible : rien à supprimer.
  }
}
