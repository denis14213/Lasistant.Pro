import { PAGE_DEFAULTS, PAGE_KEYS, type PageContents, type PageKey } from '@/content/pages';
import { mergeContent } from '@/lib/content-merge';
import type { PagesRepository } from '../../contracts';
import { logActivity } from '../activity';
import { mutateTables, readTable } from '../database';
import { simulateRead, simulateWrite } from '../network';

/**
 * Contenus des pages (base simulée) : seules les pages modifiées sont enregistrées.
 */
export const pagesRepository: PagesRepository = {
  async getAll() {
    return simulateRead(() => {
      const stored = readTable('pages');
      return Object.fromEntries(
        PAGE_KEYS.map((key) => [key, mergeContent(PAGE_DEFAULTS[key], stored[key]?.content)]),
      ) as PageContents;
    });
  },

  async list() {
    return simulateRead(() => {
      const stored = readTable('pages');
      return PAGE_KEYS.map((key: PageKey) => ({
        key,
        updatedAt: stored[key]?.updatedAt ?? null,
        updatedBy: stored[key]?.updatedBy ?? null,
      }));
    });
  },

  async update(key, content, actor) {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.pages[key] = { content, updatedAt: new Date().toISOString(), updatedBy: actor };
        logActivity(tables, actor, `Contenu de la page « ${key} » modifié`, 'content');
      }),
    );
  },
};
