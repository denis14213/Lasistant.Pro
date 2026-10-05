import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { categoriesQuery } from '@/api';
import type { Category } from '@/types';

/**
 * Accès aux catégories par identifiant (étiquettes des cartes d'article).
 * Les catégories désactivées restent résolues : un article ancien garde son étiquette.
 */
export function useCategoryLookup(): (categoryId: string) => Category | undefined {
  const { data: categories } = useSuspenseQuery(categoriesQuery(true));
  return useMemo(() => {
    const byId = new Map(categories.map((category) => [category.id, category]));
    return (categoryId: string) => byId.get(categoryId);
  }, [categories]);
}
