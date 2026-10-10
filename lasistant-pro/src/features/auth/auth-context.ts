import { createContext, useContext } from 'react';
import type { AuthSession } from '@/types';
import type { LoginResult } from './auth-service';

export interface AuthApi {
  session: AuthSession | null;
  login: (email: string, password: string, remember: boolean) => Promise<LoginResult>;
  /** Code reçu par e-mail après le mot de passe */
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logout: () => void;
  /** Signale une activité de l'utilisateur (prolonge la session) */
  touch: () => void;
  /** Met à jour le nom et l'adresse affichés après modification du profil */
  updateIdentity: (identity: { name: string; email: string }) => void;
}

export const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  return context;
}

/** Session obligatoire (pages protégées par <RequireAuth>). */
export function useSession(): AuthSession {
  const { session } = useAuth();
  if (!session) throw new Error('Aucune session ouverte : la page doit être protégée par <RequireAuth>.');
  return session;
}
