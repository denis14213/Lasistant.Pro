import type { DataSource } from '../contracts';
import { accountRepository } from './repositories/account.repository';
import { articlesRepository, categoriesRepository } from './repositories/articles.repository';
import { backupRepository } from './repositories/backup.repository';
import { bookingsRepository } from './repositories/bookings.repository';
import { emailTemplatesRepository } from './repositories/email-templates.repository';
import { faqRepository } from './repositories/faq.repository';
import { mediaRepository } from './repositories/media.repository';
import { pagesRepository } from './repositories/pages.repository';
import { servicesRepository } from './repositories/services.repository';
import { settingsRepository } from './repositories/settings.repository';
import { teamRepository } from './repositories/team.repository';

/**
 * Source de données simulée dans le navigateur : réservée aux tests automatisés
 * (et au développement hors ligne avec VITE_DATA_SOURCE=mock). Jamais incluse en production.
 */
export const mockDataSource: DataSource = {
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
