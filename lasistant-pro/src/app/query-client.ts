import { QueryClient } from '@tanstack/react-query';
import { isDataError } from '@/api';

/**
 * Client de cache partagé par toute l'application (composants et chargeurs de routes).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Les contenus changent rarement : on évite des rechargements inutiles.
      staleTime: 60_000,
      // Une ressource introuvable ne réapparaîtra pas en réessayant.
      retry: (failureCount, error) => !isDataError(error, 'not_found') && failureCount < 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
