import type { ArticleDraft } from '@/api';
import type { Article } from '@/types';

/** Données modifiables d'un article (pour un enregistrement partiel : archivage, statut…). */
export function toDraft(article: Article): ArticleDraft {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt,
    categoryId: article.categoryId,
    status: article.status,
    seo: article.seo,
    useCoverForSharing: article.useCoverForSharing,
  };
}

/** Nombre de mots d'un contenu Markdown (balisage exclu). */
export function wordCount(body: string): number {
  return body
    .replace(/::\w+/g, ' ')
    .replace(/[#>*_[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}
