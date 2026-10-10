import { dataSource } from '@/api/source';

/** Dépôts de la source de données active (voir `source.ts`). */
export const {
  accountRepository,
  articlesRepository,
  backupRepository,
  bookingsRepository,
  categoriesRepository,
  emailTemplatesRepository,
  faqRepository,
  mediaRepository,
  pagesRepository,
  servicesRepository,
  settingsRepository,
  teamRepository,
} = dataSource;
