import { Outlet, ScrollRestoration } from 'react-router';
import { NavigationProgress } from '@/components/feedback/NavigationProgress';

/** Racine de l'application : commune au site public et au back-office. */
export function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
