import type { RouteObject } from 'react-router';
import { servicesQuery } from '@/api';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { ROUTES } from '@/config/routes';
import { prefetch } from '../prefetch';
import { PublicRouteError } from '../errors/PublicRouteError';

/**
 * Pages du site public.
 * Chaque page est chargée à la demande (découpage du code) avec ses données.
 */
export const publicRoutes: RouteObject[] = [
  {
    Component: PublicLayout,
    // Menu des services et pied de page.
    loader: () => prefetch(servicesQuery()),
    children: [
      {
        errorElement: <PublicRouteError />,
        children: [
          { index: true, lazy: () => import('@/pages/public/home/HomePage') },
          { path: ROUTES.services, lazy: () => import('@/pages/public/services/ServicesPage') },
          {
            path: ROUTES.medicalAssistance,
            lazy: () => import('@/pages/public/services/MedicalAssistancePage'),
          },
          { path: ROUTES.housing, lazy: () => import('@/pages/public/services/HousingPage') },
          { path: ROUTES.patientSupport, lazy: () => import('@/pages/public/services/PatientSupportPage') },
          { path: ROUTES.about, lazy: () => import('@/pages/public/about/AboutPage') },
          { path: ROUTES.booking, lazy: () => import('@/pages/public/booking/BookingPage') },
          { path: ROUTES.bookingConfirmation, lazy: () => import('@/pages/public/booking/ConfirmationPage') },
          { path: ROUTES.articles, lazy: () => import('@/pages/public/articles/ArticlesPage') },
          { path: `${ROUTES.articles}/:slug`, lazy: () => import('@/pages/public/articles/ArticlePage') },
          { path: ROUTES.contact, lazy: () => import('@/pages/public/contact/ContactPage') },
          { path: ROUTES.faq, lazy: () => import('@/pages/public/faq/FaqPage') },
          { path: ROUTES.legalNotice, lazy: () => import('@/pages/public/legal/LegalNoticePage') },
          { path: ROUTES.privacy, lazy: () => import('@/pages/public/legal/PrivacyPage') },
          { path: ROUTES.cookies, lazy: () => import('@/pages/public/legal/CookiesPage') },
          { path: ROUTES.sitemap, lazy: () => import('@/pages/public/sitemap/SitemapPage') },
          { path: '*', lazy: () => import('@/pages/system/NotFoundPage') },
        ],
      },
    ],
  },
  // Écrans système autonomes (sans en-tête ni pied de page), consultables pour vérification.
  { path: ROUTES.maintenance, lazy: () => import('@/pages/system/MaintenancePage') },
  { path: ROUTES.offline, lazy: () => import('@/pages/system/OfflinePage') },
];
