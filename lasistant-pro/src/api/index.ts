/**
 * Point d'entrée de la couche de données.
 * Les composants importent uniquement depuis « @/api » : la source réelle
 * (données simulées aujourd'hui, Supabase demain) reste un détail d'implémentation.
 */
export { DataError, getErrorMessage, isDataError } from './errors';
export { exportDatabase, getSeedDate, importDatabase, resetDatabase } from './mock/database';
export * from './queries';
export { accountRepository } from './repositories/account.repository';
export {
  articlesRepository,
  categoriesRepository,
  type ArticleDraft,
} from './repositories/articles.repository';
export { bookingsRepository } from './repositories/bookings.repository';
export { emailTemplatesRepository, type EmailTemplatePatch } from './repositories/email-templates.repository';
export { faqRepository } from './repositories/faq.repository';
export { mediaRepository, type MediaUpload } from './repositories/media.repository';
export { servicesRepository } from './repositories/services.repository';
export { settingsRepository } from './repositories/settings.repository';
export { teamRepository } from './repositories/team.repository';
