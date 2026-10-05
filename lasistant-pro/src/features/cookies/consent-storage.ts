import { CONSENT_DURATION_DAYS, CONSENT_VERSION } from '@/content/cookies';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';

/**
 * Enregistrement du consentement aux cookies (cookie « lp_consent »).
 * Le choix expire au bout de six mois ou lorsque le catalogue des cookies change de version.
 */

export interface ConsentChoices {
  analytics: boolean;
  thirdParty: boolean;
}

export interface ConsentRecord {
  version: number;
  decidedAt: string;
  choices: ConsentChoices;
}

const STORAGE_KEY = 'lp_consent';
const DAY_MS = 24 * 60 * 60 * 1000;

export const NO_CONSENT: ConsentChoices = { analytics: false, thirdParty: false };
export const FULL_CONSENT: ConsentChoices = { analytics: true, thirdParty: true };

/** Consentement valide en cours, ou null s'il doit être (re)demandé. */
export function readConsent(now = Date.now()): ConsentRecord | null {
  const record = readStorage<ConsentRecord | null>(STORAGE_KEY, null);
  if (!record || record.version !== CONSENT_VERSION) return null;
  const age = now - new Date(record.decidedAt).getTime();
  if (!Number.isFinite(age) || age > CONSENT_DURATION_DAYS * DAY_MS) return null;
  return record;
}

export function saveConsent(choices: ConsentChoices, now = new Date()): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: now.toISOString(),
    choices: { ...choices },
  };
  writeStorage(STORAGE_KEY, record);
  return record;
}

export function clearConsent(): void {
  removeStorage(STORAGE_KEY);
}
