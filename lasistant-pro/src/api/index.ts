/**
 * Point d'entrée de la couche de données.
 * Les composants importent uniquement depuis « @/api » : la source réelle (base Supabase
 * en production, base simulée pour les tests) reste un détail d'implémentation.
 */
export type {
  ArticleDraft,
  EmailTemplatePatch,
  MediaUpload,
  PageRecord,
  PasswordResetOutcome,
  ResetLinkKind,
  SignInOutcome,
  TwoFactorDelivery,
} from './contracts';
export { DataError, getErrorMessage, isDataError } from './errors';
export * from './queries';
export {
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
} from './repositories';
export { authBackend, demoTools, subscribeToRequestChanges } from '@/api/source';
