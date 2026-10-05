import type { SiteSettings } from '@/types';
import { logActivity } from '../mock/activity';
import { mutateTables, readTable } from '../mock/database';
import { simulateRead, simulateWrite } from '../mock/network';

/** Libellé du journal d'activité selon la rubrique modifiée (la première reconnue l'emporte). */
const SECTION_LABELS: Array<{ keys: Array<keyof SiteSettings>; label: string }> = [
  { keys: ['legal'], label: 'Informations légales mises à jour' },
  { keys: ['booking'], label: 'Disponibilités de réservation modifiées' },
  { keys: ['maintenance'], label: 'Mode maintenance modifié' },
  { keys: ['seo', 'analytics', 'backups'], label: 'Réglages SEO et mesure d’audience modifiés' },
  {
    keys: ['phones', 'emails', 'address', 'openingHours', 'facebook', 'whatsapp'],
    label: 'Coordonnées du site modifiées',
  },
];

function activityLabel(patch: Partial<SiteSettings>): string {
  const keys = Object.keys(patch) as Array<keyof SiteSettings>;
  return (
    SECTION_LABELS.find((section) => section.keys.some((key) => keys.includes(key)))?.label ??
    'Réglages du site modifiés'
  );
}

/**
 * Réglages du site (coordonnées, réservation, SEO, maintenance…).
 */
export const settingsRepository = {
  async get(): Promise<SiteSettings> {
    return simulateRead(() => readTable('settings'));
  },

  async update(patch: Partial<SiteSettings>, actor: string): Promise<SiteSettings> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.settings = {
          ...tables.settings,
          ...patch,
          updatedAt: new Date().toISOString(),
          updatedBy: actor,
        };
        logActivity(tables, actor, activityLabel(patch), 'settings');
        return tables.settings;
      }),
    );
  },
};
