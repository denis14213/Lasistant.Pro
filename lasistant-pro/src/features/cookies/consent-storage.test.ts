import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_DURATION_DAYS, CONSENT_VERSION } from '@/content/cookies';
import { clearConsent, FULL_CONSENT, NO_CONSENT, readConsent, saveConsent } from './consent-storage';

/** Stockage du navigateur réduit au strict nécessaire (le test s'exécute dans Node). */
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, String(value)),
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

describe('consentement aux cookies', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: memoryStorage(), sessionStorage: memoryStorage() });
    return () => vi.unstubAllGlobals();
  });

  it('enregistre le choix et le relit', () => {
    const decidedAt = new Date('2026-10-01T10:00:00.000Z');
    saveConsent({ analytics: true, thirdParty: false }, decidedAt);
    expect(readConsent(decidedAt.getTime() + DAY_MS)).toEqual({
      version: CONSENT_VERSION,
      decidedAt: decidedAt.toISOString(),
      choices: { analytics: true, thirdParty: false },
    });
  });

  it('redemande le consentement après expiration', () => {
    const decidedAt = new Date('2026-01-01T10:00:00.000Z');
    saveConsent(FULL_CONSENT, decidedAt);
    expect(readConsent(decidedAt.getTime() + (CONSENT_DURATION_DAYS + 1) * DAY_MS)).toBeNull();
  });

  it('redemande le consentement quand le catalogue des cookies change de version', () => {
    window.localStorage.setItem(
      'lp_consent',
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        decidedAt: new Date().toISOString(),
        choices: FULL_CONSENT,
      }),
    );
    expect(readConsent()).toBeNull();
  });

  it('copie les choix : modifier l’objet d’origine ne change pas l’enregistrement', () => {
    const choices = { ...NO_CONSENT };
    const record = saveConsent(choices);
    choices.analytics = true;
    expect(record.choices.analytics).toBe(false);
    clearConsent();
    expect(readConsent()).toBeNull();
  });
});
