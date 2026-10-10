import { FAQ_CATEGORIES } from '@/content/faq';
import type { FaqCategory, FaqItem } from '@/types';
import type { FaqRepository } from '../../contracts';
import { readTable } from '../database';
import { simulateRead } from '../network';

/**
 * Questions fréquentes.
 */
export const faqRepository: FaqRepository = {
  async list(): Promise<{ categories: FaqCategory[]; items: FaqItem[] }> {
    return simulateRead(() => ({
      categories: [...FAQ_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder),
      items: readTable('faq').sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },
};
