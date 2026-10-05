import { render } from '@testing-library/react';
import { Suspense, type ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AppProviders } from '@/app/AppProviders';
import { appRoutes } from '@/app/router';

/**
 * Rendus de test : mêmes fournisseurs que l'application (cache, notifications,
 * session, consentement) et routeur en mémoire.
 */

/** Affiche un composant isolé, dans un routeur (liens) et une zone de chargement (données). */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const router = createMemoryRouter(
    [{ path: '*', element: <Suspense fallback={<p>Chargement…</p>}>{ui}</Suspense> }],
    {
      initialEntries: [route],
    },
  );
  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}

/** Affiche l'application complète à une adresse donnée (chargeurs et pages réels). */
export function renderApp(route: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [route] });
  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}
