import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './auth-context';
import { loginPathFor, REDIRECT_PARAM, safeRedirect } from './session-guards';

/**
 * Gardes React des routes du back-office (voir `session-guards.ts` pour les chargeurs).
 */

/** Garde réactive : déconnexion pendant la navigation, session fermée dans un autre onglet… */
export function RequireAuth() {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) return <Navigate to={loginPathFor(location.pathname + location.search)} replace />;
  return <Outlet />;
}

/** Les écrans de connexion ne sont pas proposés à un utilisateur déjà connecté. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();
  if (session) {
    const destination = new URLSearchParams(location.search).get(REDIRECT_PARAM);
    return <Navigate to={safeRedirect(destination)} replace />;
  }
  return <>{children}</>;
}
