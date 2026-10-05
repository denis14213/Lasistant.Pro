import { createBrowserRouter, type RouteObject } from 'react-router';
import { settingsQuery } from '@/api';
import { PageLoader } from '@/components/feedback/PageLoader';
import { RootError } from './errors/RootError';
import { prefetch } from './prefetch';
import { RootLayout } from './RootLayout';
import { adminRoutes } from './routes/admin-routes';
import { publicRoutes } from './routes/public-routes';

/**
 * Plan de navigation de l'application (mode « données » de React Router) :
 * les chargeurs préparent les données avant l'affichage de chaque page.
 * Les routes sont exportées seules pour être réutilisées par les tests (routeur en mémoire).
 */
export const appRoutes: RouteObject[] = [
  {
    id: 'racine',
    Component: RootLayout,
    // Réglages du site : coordonnées, réservation, maintenance… utilisés partout.
    loader: () => prefetch(settingsQuery()),
    HydrateFallback: () => <PageLoader label="Chargement du site…" />,
    errorElement: <RootError />,
    children: [...publicRoutes, ...adminRoutes],
  },
];

export const router = createBrowserRouter(appRoutes);
