import { useSuspenseQuery } from '@tanstack/react-query';
import { pageContentsQuery } from '@/api';
import type { PageContents, PageKey } from '@/content/pages';

/**
 * Contenu d'une page du site, tel qu'enregistré dans la base (complété par la structure
 * d'origine). Les contenus sont préchargés par le chargeur racine : aucune attente ici.
 */
export function usePageContent<K extends PageKey>(key: K): PageContents[K] {
  const { data } = useSuspenseQuery({ ...pageContentsQuery(), select: (contents) => contents[key] });
  return data;
}
