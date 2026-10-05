import { RouterProvider } from 'react-router/dom';
import { AppProviders } from './AppProviders';
import { router } from './router';

/** Application complète : fournisseurs partagés et navigation. */
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
