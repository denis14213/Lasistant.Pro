import type { DataSource } from '../contracts';
import { accountRepository } from './repositories/account.repository';
import { backupRepository } from './repositories/backup.repository';
import { bookingsRepository } from './repositories/bookings.repository';
import {
  articlesRepository,
  categoriesRepository,
  emailTemplatesRepository,
  faqRepository,
  servicesRepository,
  settingsRepository,
} from './repositories/content.repository';
import { mediaRepository } from './repositories/media.repository';
import { pagesRepository } from './repositories/pages.repository';
import { teamRepository } from './repositories/team.repository';

/** Source de données de production : la base Supabase du projet LASISTANT.PRO. */
export const supabaseDataSource: DataSource = {
  settingsRepository,
  servicesRepository,
  articlesRepository,
  categoriesRepository,
  faqRepository,
  bookingsRepository,
  teamRepository,
  accountRepository,
  mediaRepository,
  emailTemplatesRepository,
  pagesRepository,
  backupRepository,
};
