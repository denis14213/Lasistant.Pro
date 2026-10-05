import type { QueryKey } from '@tanstack/react-query';
import { queryClient } from './query-client';

/** Description d'une requête issue de `api/queries` (clé et fonction de chargement). */
interface QueryDescriptor {
  queryKey: QueryKey;
}

/**
 * Préchargement des données d'une page depuis son chargeur de route (`loader`).
 * La navigation n'est terminée qu'une fois les données en cache : la page s'affiche
 * complète, sans écran de chargement intermédiaire. Les requêtes partent en parallèle.
 */
export async function prefetch<T extends QueryDescriptor[]>(...queries: T): Promise<null> {
  await Promise.all(queries.map((query) => queryClient.ensureQueryData(query)));
  return null;
}
