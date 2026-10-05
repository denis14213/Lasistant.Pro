import { slugify } from '@/lib/text';
import type { Article, Category } from '@/types';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';
import { createId, mutateTables, readTable } from '../mock/database';
import { simulateRead, simulateWrite } from '../mock/network';

/** Données saisies dans l'éditeur d'article. */
export type ArticleDraft = Omit<
  Article,
  'id' | 'updatedAt' | 'author' | 'publishedAt' | 'readingMinutes' | 'tags' | 'featured'
> & {
  id?: string;
};

const byPublicationDesc = (a: Article, b: Article) =>
  (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');

/** Temps de lecture estimé (environ 200 mots par minute). */
function readingTime(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
}

/**
 * Articles de l'Espace infos (table « articles »).
 */
export const articlesRepository = {
  /** Articles publiés, du plus récent au plus ancien (site public). */
  async listPublished(): Promise<Article[]> {
    return simulateRead(() =>
      readTable('articles')
        .filter((article) => article.status === 'publie')
        .sort(byPublicationDesc),
    );
  },

  async getPublishedBySlug(slug: string): Promise<Article> {
    return simulateRead(() => {
      const article = readTable('articles').find((item) => item.slug === slug && item.status === 'publie');
      if (!article) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return article;
    });
  },

  /** Tous les articles, y compris brouillons et archives (back-office). */
  async listAll(): Promise<Article[]> {
    return simulateRead(() => readTable('articles').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  },

  async getById(id: string): Promise<Article> {
    return simulateRead(() => {
      const article = readTable('articles').find((item) => item.id === id);
      if (!article) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return article;
    });
  },

  /**
   * Crée ou met à jour un article (« author » : nom affiché comme auteur).
   * La date de publication est fixée à la première publication.
   */
  async save(draft: ArticleDraft, author: string): Promise<Article> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const now = new Date().toISOString();
        const existing = draft.id ? tables.articles.find((item) => item.id === draft.id) : undefined;
        const slugTaken = tables.articles.some((item) => item.slug === draft.slug && item.id !== draft.id);
        if (slugTaken) {
          throw new DataError('validation', 'Ce slug est déjà utilisé par un autre article.');
        }
        if (existing) {
          Object.assign(existing, draft, {
            author,
            updatedAt: now,
            readingMinutes: readingTime(draft.body),
            publishedAt: existing.publishedAt ?? (draft.status === 'publie' ? now : null),
          });
          return existing;
        }
        const article: Article = {
          ...draft,
          id: createId('art'),
          author,
          tags: [],
          featured: false,
          updatedAt: now,
          readingMinutes: readingTime(draft.body),
          publishedAt: draft.status === 'publie' ? now : null,
        };
        tables.articles.unshift(article);
        return article;
      }),
    );
  },

  async remove(id: string): Promise<void> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.articles = tables.articles.filter((item) => item.id !== id);
      }),
    );
  },
};

/**
 * Catégories de l'Espace infos (table « categories »).
 */
export const categoriesRepository = {
  async list(includeInactive = false): Promise<Category[]> {
    return simulateRead(() =>
      readTable('categories')
        .filter((category) => includeInactive || category.active)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },

  async create(name: string): Promise<Category> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const slug = slugify(name);
        if (tables.categories.some((item) => item.slug === slug)) {
          throw new DataError('validation', 'Une catégorie porte déjà ce nom.');
        }
        const category: Category = {
          id: createId('cat'),
          name: name.trim(),
          slug,
          description: '',
          active: true,
          sortOrder: tables.categories.length + 1,
          tone: 'neutral',
        };
        tables.categories.push(category);
        return category;
      }),
    );
  },

  async setActive(id: string, active: boolean): Promise<Category> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const category = tables.categories.find((item) => item.id === id);
        if (!category) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        category.active = active;
        return category;
      }),
    );
  },
};
