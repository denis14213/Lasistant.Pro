import { FAQ_CATEGORIES } from '@/content/faq';
import type { FaqCategory, FaqItem } from '@/types';
import { readTable } from '../mock/database';
import { simulateRead } from '../mock/network';

/**
 * Questions fréquentes.
 */
export const faqRepository = {
  async list(): Promise<{ categories: FaqCategory[]; items: FaqItem[] }> {
    return simulateRead(() => ({
      categories: [...FAQ_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder),
      items: readTable('faq').sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },
};
