import { useSuspenseQuery } from '@tanstack/react-query';
import { serviceBySlugQuery } from '@/api';
import { queryClient } from '@/app/query-client';
import { notFound, orNotFound } from '@/app/route-errors';
import type { Service } from '@/types';

/**
 * Données d'une page de service.
 * Un service désactivé dans le back-office n'est plus accessible : sa page renvoie une erreur 404.
 */

export async function loadActiveService(slug: string): Promise<null> {
  const service = await orNotFound(queryClient.ensureQueryData(serviceBySlugQuery(slug)));
  if (!service.active) notFound();
  return null;
}

export function useService(slug: string): Service {
  return useSuspenseQuery(serviceBySlugQuery(slug)).data;
}
