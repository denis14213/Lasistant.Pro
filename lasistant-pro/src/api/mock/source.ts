import { DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/content/demo/team';
import type { AuthBackend, DataSource, DemoTools } from '../contracts';
import { mockAuthBackend } from './auth';
import { getSeedDate, resetDatabase } from './database';
import { mockDataSource } from './index';

/**
 * Remplace `api/source.ts` quand VITE_DATA_SOURCE=mock (tests automatisés, travail hors ligne).
 * Mêmes exports, mêmes types : le reste de l'application ne voit aucune différence.
 */
export const dataSource: DataSource = mockDataSource;

export const authBackend: AuthBackend = mockAuthBackend;

/** La base simulée vit dans cet onglet : aucun changement extérieur à écouter. */
export const subscribeToRequestChanges: (onChange: () => void) => () => void = () => () => undefined;

export const demoTools: DemoTools | null = {
  reset: resetDatabase,
  seededAt: getSeedDate,
  credentials: {
    emails: ['admin@lasistant.pro', 'contenus@lasistant.pro', 'operateur1@lasistant.pro'],
    password: DEMO_PASSWORD,
    twoFactorCode: DEMO_TWO_FACTOR_CODE,
  },
};
