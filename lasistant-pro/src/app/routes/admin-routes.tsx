import type { RouteObject } from 'react-router';
import { allArticlesQuery, bookingsQuery, servicesQuery, teamQuery } from '@/api';
import type { AdminRouteHandle } from '@/components/layout/admin/AdminLayout';
import type { AuthScreenHandle } from '@/components/layout/admin/AuthLayout';
import { ROUTES } from '@/config/routes';
import { RequireAuth } from '@/features/auth/guards';
import { requireSession } from '@/features/auth/session-guards';
import { can } from '@/lib/permissions';
import { prefetch } from '../prefetch';

/**
 * Back-office : écrans de connexion puis pages protégées.
 * Chaque page déclare la permission nécessaire (`handle.permission`) ; le gabarit l'applique.
 * Les gabarits sont chargés à la demande, comme les pages : un visiteur du site public ne
 * télécharge ni le code ni les icônes du back-office.
 */

const authScreen = (handle: AuthScreenHandle) => handle;
const permission = (value: AdminRouteHandle['permission']): AdminRouteHandle => ({ permission: value });

export const adminRoutes: RouteObject[] = [
  {
    lazy: async () => ({ Component: (await import('@/components/layout/admin/AuthLayout')).AuthLayout }),
    children: [
      { path: ROUTES.admin.login, lazy: () => import('@/pages/admin/auth/LoginPage') },
      {
        path: ROUTES.admin.forgotPassword,
        lazy: () => import('@/pages/admin/auth/ForgotPasswordPage'),
        handle: authScreen({
          artTitle: {
            start: 'La sécurité de vos données et de celles des personnes accompagnées',
            accent: 'passe d’abord',
            end: '.',
          },
          artText:
            'Accès protégé : mot de passe robuste, double authentification et verrouillage après plusieurs échecs.',
        }),
      },
      {
        path: ROUTES.admin.forgotPasswordSent,
        lazy: () => import('@/pages/admin/auth/ForgotPasswordSentPage'),
      },
      {
        path: ROUTES.admin.resetPassword,
        lazy: () => import('@/pages/admin/auth/ResetPasswordPage'),
        handle: authScreen({ allowAuthenticated: true }),
      },
      { path: ROUTES.admin.twoFactor, lazy: () => import('@/pages/admin/auth/TwoFactorPage') },
      {
        path: ROUTES.admin.sessionExpired,
        lazy: async () => ({
          Component: (await import('@/pages/admin/auth/StatusPages')).SessionExpiredScreen,
        }),
      },
      {
        path: ROUTES.admin.linkExpired,
        lazy: async () => ({ Component: (await import('@/pages/admin/auth/StatusPages')).LinkExpiredScreen }),
      },
      {
        path: ROUTES.admin.locked,
        lazy: async () => ({
          Component: (await import('@/pages/admin/auth/StatusPages')).AccountLockedScreen,
        }),
      },
    ],
  },
  {
    Component: RequireAuth,
    // Aucune donnée du back-office n'est chargée sans session valide.
    loader: async (args) => {
      const session = requireSession(args);
      await Promise.all([
        prefetch(servicesQuery(true), teamQuery(), allArticlesQuery()),
        // Les demandes ne sont chargées que pour les rôles autorisés à les consulter.
        can(session.role, 'requests:view') ? prefetch(bookingsQuery()) : null,
      ]);
      return null;
    },
    children: [
      {
        lazy: async () => ({
          Component: (await import('@/components/layout/admin/AdminLayout')).AdminLayout,
        }),
        children: [
          {
            // Une erreur de chargement s'affiche dans le gabarit : le menu reste utilisable.
            lazy: async () => ({
              ErrorBoundary: (await import('../errors/AdminRouteError')).AdminRouteError,
            }),
            children: [
              {
                path: ROUTES.admin.dashboard,
                lazy: () => import('@/pages/admin/DashboardPage'),
                handle: permission('dashboard:view'),
              },
              {
                path: ROUTES.admin.requests,
                lazy: () => import('@/pages/admin/requests/RequestsPage'),
                handle: permission('requests:view'),
              },
              {
                path: `${ROUTES.admin.requests}/:id`,
                lazy: () => import('@/pages/admin/requests/RequestDetailPage'),
                handle: permission('requests:view'),
              },
              {
                path: ROUTES.admin.agenda,
                lazy: () => import('@/pages/admin/AgendaPage'),
                handle: permission('agenda:manage'),
              },
              {
                path: ROUTES.admin.services,
                lazy: () => import('@/pages/admin/ServicesPage'),
                handle: permission('services:manage'),
              },
              {
                path: ROUTES.admin.articles,
                lazy: () => import('@/pages/admin/articles/ArticlesAdminPage'),
                handle: permission('articles:manage'),
              },
              {
                // « nouveau » ou identifiant d'un article existant
                path: `${ROUTES.admin.articles}/:id`,
                lazy: () => import('@/pages/admin/articles/ArticleEditorPage'),
                handle: permission('articles:manage'),
              },
              {
                path: ROUTES.admin.pages,
                lazy: () => import('@/pages/admin/pages/PagesAdminPage'),
                handle: permission('pages:manage'),
              },
              {
                path: `${ROUTES.admin.pages}/:key`,
                lazy: () => import('@/pages/admin/pages/PageEditorPage'),
                handle: permission('pages:manage'),
              },
              {
                path: ROUTES.admin.media,
                lazy: () => import('@/pages/admin/MediaPage'),
                handle: permission('media:manage'),
              },
              {
                path: ROUTES.admin.settings,
                lazy: () => import('@/pages/admin/settings/IdentitySettingsPage'),
                handle: permission('settings:manage'),
              },
              {
                path: ROUTES.admin.seo,
                lazy: () => import('@/pages/admin/settings/SeoSettingsPage'),
                handle: permission('settings:manage'),
              },
              {
                path: ROUTES.admin.legal,
                lazy: () => import('@/pages/admin/settings/LegalSettingsPage'),
                handle: permission('settings:manage'),
              },
              {
                path: ROUTES.admin.emails,
                lazy: () => import('@/pages/admin/emails/EmailTemplatesPage'),
                handle: permission('email-templates:manage'),
              },
              {
                path: `${ROUTES.admin.emails}/:key/apercu`,
                lazy: () => import('@/pages/admin/emails/EmailPreviewPage'),
                handle: permission('email-templates:manage'),
              },
              {
                path: ROUTES.admin.users,
                lazy: () => import('@/pages/admin/UsersPage'),
                handle: permission('users:manage'),
              },
              // Accessible à tous les rôles : chacun gère son propre compte.
              { path: ROUTES.admin.account, lazy: () => import('@/pages/admin/AccountPage') },
              { path: `${ROUTES.admin.dashboard}/*`, lazy: () => import('@/pages/admin/AdminNotFoundPage') },
            ],
          },
        ],
      },
    ],
  },
];
