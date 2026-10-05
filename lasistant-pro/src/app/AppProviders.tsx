import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { CookieConsentProvider } from '@/features/cookies/CookieConsentProvider';
import { ToastProvider } from '@/features/toasts/ToastProvider';
import { queryClient } from './query-client';

/**
 * Fournisseurs partagés par toute l'application, du plus général au plus spécifique :
 * cache des données, notifications, session du back-office, consentement aux cookies.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CookieConsentProvider>{children}</CookieConsentProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
