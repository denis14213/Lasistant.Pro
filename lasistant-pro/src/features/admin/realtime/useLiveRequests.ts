import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys, subscribeToRequestChanges } from '@/api';

/** Délai de regroupement : une rafale de changements ne provoque qu'un seul rafraîchissement. */
const REFRESH_DELAY_MS = 400;

/**
 * Back-office en temps réel : une nouvelle demande, un changement de statut ou une note
 * ajoutée par un collègue rafraîchissent les listes, la fiche et les notifications.
 */
export function useLiveRequests(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeToRequestChanges(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      }, REFRESH_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [queryClient]);
}
