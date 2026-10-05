import { createContext, useContext } from 'react';
import type { ConsentChoices, ConsentRecord } from './consent-storage';

export interface CookieConsentApi {
  /** Choix enregistré (null tant que le visiteur n'a pas décidé) */
  record: ConsentRecord | null;
  /** Choix effectifs : tout est refusé tant qu'aucune décision n'est prise */
  choices: ConsentChoices;
  hasDecided: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (choices: ConsentChoices) => void;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
}

export const CookieConsentContext = createContext<CookieConsentApi | null>(null);

export function useCookieConsent(): CookieConsentApi {
  const context = useContext(CookieConsentContext);
  if (!context)
    throw new Error('useCookieConsent doit être utilisé à l’intérieur de <CookieConsentProvider>.');
  return context;
}
