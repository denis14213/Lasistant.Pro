import { queryOptions } from '@tanstack/react-query';
import type { EmailTemplateKey } from '@/types';
import {
  accountRepository,
  articlesRepository,
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

/**
 * Requêtes de lecture (TanStack Query).
 *
 * Chaque requête est décrite une seule fois ici, puis réutilisée :
 * - par les chargeurs de routes (`loader`), qui préchargent les données avant l'affichage ;
 * - par les composants (`useQuery` / `useSuspenseQuery`), qui lisent le cache.
 * Les clés commencent toutes par le nom de l'entité : invalider `['bookings']`
 * rafraîchit donc toutes les vues liées aux demandes.
 */

export const queryKeys = {
  settings: ['settings'] as const,
  services: ['services'] as const,
  articles: ['articles'] as const,
  categories: ['categories'] as const,
  faq: ['faq'] as const,
  bookings: ['bookings'] as const,
  team: ['team'] as const,
  account: ['account'] as const,
  media: ['media'] as const,
  emailTemplates: ['email-templates'] as const,
  pages: ['pages'] as const,
};

export const settingsQuery = () =>
  queryOptions({ queryKey: queryKeys.settings, queryFn: () => settingsRepository.get() });

export const servicesQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: [...queryKeys.services, { includeInactive }],
    queryFn: () => servicesRepository.list({ includeInactive }),
  });

export const serviceBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: [...queryKeys.services, 'slug', slug],
    queryFn: () => servicesRepository.getBySlug(slug),
  });

export const publishedArticlesQuery = () =>
  queryOptions({
    queryKey: [...queryKeys.articles, 'published'],
    queryFn: () => articlesRepository.listPublished(),
  });

export const articleBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: [...queryKeys.articles, 'slug', slug],
    queryFn: () => articlesRepository.getPublishedBySlug(slug),
  });

export const allArticlesQuery = () =>
  queryOptions({ queryKey: [...queryKeys.articles, 'all'], queryFn: () => articlesRepository.listAll() });

export const articleByIdQuery = (id: string) =>
  queryOptions({
    queryKey: [...queryKeys.articles, 'id', id],
    queryFn: () => articlesRepository.getById(id),
  });

export const categoriesQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: [...queryKeys.categories, { includeInactive }],
    queryFn: () => categoriesRepository.list(includeInactive),
  });

export const faqQuery = () => queryOptions({ queryKey: queryKeys.faq, queryFn: () => faqRepository.list() });

export const bookingsQuery = () =>
  queryOptions({ queryKey: [...queryKeys.bookings, 'list'], queryFn: () => bookingsRepository.list() });

export const bookingQuery = (id: string) =>
  queryOptions({
    queryKey: [...queryKeys.bookings, 'id', id],
    queryFn: () => bookingsRepository.getById(id),
  });

/** Récapitulatif public d'une demande (page de confirmation) : référence et clé secrète. */
export const bookingConfirmationQuery = (reference: string, key: string) =>
  queryOptions({
    queryKey: [...queryKeys.bookings, 'confirmation', reference, key],
    queryFn: () => bookingsRepository.getConfirmation(reference, key),
  });

export const bookingEventsQuery = (id: string) =>
  queryOptions({
    queryKey: [...queryKeys.bookings, 'id', id, 'events'],
    queryFn: () => bookingsRepository.listEvents(id),
  });

export const bookingNotesQuery = (id: string) =>
  queryOptions({
    queryKey: [...queryKeys.bookings, 'id', id, 'notes'],
    queryFn: () => bookingsRepository.listNotes(id),
  });

export const takenSlotsQuery = () =>
  queryOptions({
    queryKey: [...queryKeys.bookings, 'taken-slots'],
    queryFn: () => bookingsRepository.listTakenSlots(),
  });

export const teamQuery = () =>
  queryOptions({ queryKey: queryKeys.team, queryFn: () => teamRepository.list() });

export const mediaQuery = () =>
  queryOptions({ queryKey: queryKeys.media, queryFn: () => mediaRepository.list() });

export const emailTemplatesQuery = () =>
  queryOptions({ queryKey: queryKeys.emailTemplates, queryFn: () => emailTemplatesRepository.list() });

export const emailTemplateQuery = (key: EmailTemplateKey) =>
  queryOptions({
    queryKey: [...queryKeys.emailTemplates, key],
    queryFn: () => emailTemplatesRepository.getByKey(key),
  });

export const accountQuery = (userId: string) =>
  queryOptions({ queryKey: [...queryKeys.account, userId], queryFn: () => accountRepository.get(userId) });

// Sessions et activité changent au fil des actions : relues à chaque ouverture de « Mon compte ».
export const accountSessionsQuery = (userId: string) =>
  queryOptions({
    queryKey: [...queryKeys.account, userId, 'sessions'],
    queryFn: () => accountRepository.listSessions(userId),
    staleTime: 0,
  });

export const accountActivityQuery = (userId: string) =>
  queryOptions({
    queryKey: [...queryKeys.account, userId, 'activity'],
    queryFn: () => accountRepository.activity(userId),
    staleTime: 0,
  });

/** Contenus de toutes les pages : préchargés avec les réglages, utilisés partout (pied de page…). */
export const pageContentsQuery = () =>
  queryOptions({ queryKey: [...queryKeys.pages, 'contents'], queryFn: () => pagesRepository.getAll() });

/** Dernières modifications des pages (back-office). */
export const pagesQuery = () =>
  queryOptions({ queryKey: [...queryKeys.pages, 'list'], queryFn: () => pagesRepository.list() });
