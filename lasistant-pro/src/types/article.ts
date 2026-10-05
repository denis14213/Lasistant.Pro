import type { SeoFields, Tone } from './common';
import type { ImageRef } from './media';

/**
 * Espace infos : articles et catégories (tables « articles » et « categories »).
 */

export type ArticleStatus = 'brouillon' | 'publie' | 'archive';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  sortOrder: number;
  tone: Tone;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /**
   * Contenu au format Markdown simplifié (titres « ## », listes, gras, liens,
   * encadrés « > » et bloc d'appel à l'action « ::cta »). Rendu sans HTML brut,
   * donc sans risque d'injection.
   */
  body: string;
  coverImage: ImageRef;
  coverAlt: string;
  categoryId: string;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number;
  author: string;
  tags: string[];
  /** Article mis à la une dans l'Espace infos */
  featured: boolean;
  seo: SeoFields;
  /** Utiliser l'image de couverture pour le partage (Open Graph) */
  useCoverForSharing: boolean;
}
