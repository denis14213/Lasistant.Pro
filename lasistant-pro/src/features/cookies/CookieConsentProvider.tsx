import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useToast } from '@/features/toasts/toast-context';
import { CookieConsentContext, type CookieConsentApi } from './consent-context';
import { FULL_CONSENT, NO_CONSENT, readConsent, saveConsent, type ConsentChoices } from './consent-storage';

/**
 * Gestion du consentement aux cookies pour toute l'application.
 * Aucun cookie non essentiel n'est déposé avant un choix explicite du visiteur.
 */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [record, setRecord] = useState(() => readConsent());
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);

  const apply = useCallback(
    (choices: ConsentChoices) => {
      setRecord(saveConsent(choices));
      setPreferencesOpen(false);
      const message =
        choices.analytics && choices.thirdParty
          ? 'Merci ! Tous les cookies ont été acceptés.'
          : !choices.analytics && !choices.thirdParty
            ? 'Choix enregistré : cookies essentiels uniquement.'
            : 'Vos préférences ont été enregistrées.';
      toast.success(message);
    },
    [toast],
  );

  const api = useMemo<CookieConsentApi>(
    () => ({
      record,
      choices: record?.choices ?? NO_CONSENT,
      hasDecided: record !== null,
      acceptAll: () => apply(FULL_CONSENT),
      rejectAll: () => apply(NO_CONSENT),
      save: apply,
      isPreferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [record, isPreferencesOpen, apply],
  );

  return <CookieConsentContext.Provider value={api}>{children}</CookieConsentContext.Provider>;
}
