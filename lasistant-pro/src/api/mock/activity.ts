import type { ActivityKind } from '@/types';
import { createId, type MockTables } from './database';

/** Nombre d'entrées conservées dans le journal simulé. */
const ACTIVITY_RETENTION = 200;

/**
 * Consigne une action sensible dans le journal d'activité de l'équipe
 * (affiché dans « Mon compte › Activité récente »).
 * Phase 2 : table « activity_log » alimentée côté serveur.
 */
export function logActivity(tables: MockTables, actor: string, label: string, kind: ActivityKind): void {
  tables.activity.push({ id: createId('act'), actor, label, kind, createdAt: new Date().toISOString() });
  if (tables.activity.length > ACTIVITY_RETENTION)
    tables.activity.splice(0, tables.activity.length - ACTIVITY_RETENTION);
}
