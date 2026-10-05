import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession } from '@/types';
import { AuthContext, type AuthApi } from './auth-context';
import { attemptLogin, verifyTwoFactor as verifyCode } from './auth-service';
import {
  clearSession,
  isSessionExpired,
  readSession,
  touchSession,
  updateStoredSession,
  writeSession,
} from './session-storage';

/** Session valide au démarrage (une session expirée n'est pas restaurée). */
function initialSession(): AuthSession | null {
  const stored = readSession();
  if (!stored || isSessionExpired(stored)) {
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

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const touch = useCallback(() => {
    const current = readSession();
    if (current) setSession(touchSession(current));
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      session,
      login: attemptLogin,
      verifyTwoFactor: async (code) => {
        const result = await verifyCode(code);
        if (!result) return false;
        writeSession(result.session, result.remember);
        setSession(result.session);
        return true;
      },
      logout,
      touch,
      updateIdentity: (identity) => {
        if (session) setSession(updateStoredSession({ ...session, ...identity }));
      },
    }),
    [session, logout, touch],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}
