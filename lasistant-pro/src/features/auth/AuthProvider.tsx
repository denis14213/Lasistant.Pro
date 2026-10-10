import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authBackend, queryKeys } from '@/api';
import { queryClient } from '@/app/query-client';
import type { AuthSession } from '@/types';
import { AuthContext, type AuthApi } from './auth-context';
import { attemptLogin, redeemRecoveryCode, verifyTwoFactor as verifyCode } from './auth-service';
import {
  clearSession,
  isSessionExpired,
  readSession,
  touchSession,
  updateStoredSession,
  writeSession,
} from './session-storage';

/** Données réservées à l'équipe, effacées du cache à la déconnexion. */
const PRIVATE_QUERY_KEYS = [
  queryKeys.bookings,
  queryKeys.team,
  queryKeys.account,
  queryKeys.media,
  queryKeys.emailTemplates,
];

/**
 * Session valide au démarrage : une session expirée, ou dont la session serveur
 * (Supabase Auth) n'existe plus, n'est pas restaurée.
 */
function initialSession(): AuthSession | null {
  const stored = readSession();
  if (!stored || isSessionExpired(stored) || !authBackend.hasActiveSession()) {
    clearSession();
    return null;
  }
  return stored;
}

/**
 * Fournit la session du back-office à toute l'application.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  const endSession = useCallback(() => {
    clearSession();
    setSession(null);
    // Les données personnelles du back-office ne restent pas en mémoire après la déconnexion
    // (une fois les pages protégées démontées par la redirection vers la connexion).
    setTimeout(() => {
      for (const queryKey of PRIVATE_QUERY_KEYS) queryClient.removeQueries({ queryKey });
    }, 0);
  }, []);

  // Session serveur terminée ailleurs (expiration, déconnexion d'un autre appareil…).
  useEffect(() => authBackend.onSignedOut(endSession), [endSession]);

  const logout = useCallback(() => {
    endSession();
    void authBackend.signOut();
  }, [endSession]);

  const touch = useCallback(() => {
    const current = readSession();
    if (current) setSession(touchSession(current));
  }, []);

  const api = useMemo<AuthApi>(() => {
    const open = (result: { session: AuthSession; remember: boolean } | null) => {
      if (!result) return false;
      writeSession(result.session, result.remember);
      setSession(result.session);
      return true;
    };
    return {
      session,
      login: async (email, password, remember) => {
        const result = await attemptLogin(email, password, remember);
        if (result.status === 'authenticated') open(result);
        return result;
      },
      verifyTwoFactor: async (code) => open(await verifyCode(code)),
      redeemRecoveryCode: async (code) => open(await redeemRecoveryCode(code)),
      logout,
      touch,
      updateIdentity: (identity) => {
        if (session) setSession(updateStoredSession({ ...session, ...identity }));
      },
    };
  }, [session, logout, touch]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}
