import { useCallback, useSyncExternalStore } from 'react';

/**
 * Indique si une requête média correspond à l'écran, et suit ses changements
 * (rotation du téléphone, redimensionnement de la fenêtre).
 * Hors navigateur (tests, rendu serveur), la requête est considérée comme fausse.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
