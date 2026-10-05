import { env } from '@/config/env';

/**
 * Mesure d'audience respectueuse de la vie privée (cahier des charges § 10 et § 13).
 * Inactive tant que l'outil n'est pas activé dans le back-office ET que le visiteur
 * n'a pas accepté les cookies d'audience. Aucune donnée personnelle n'est transmise.
 *
 * Phase 2 : brancher ici l'outil retenu (chargement du script après consentement).
 */

/** Actions mesurées : envoi d'un formulaire ou ouverture d'une conversation WhatsApp. */
export type ConversionName = 'reservation' | 'logement' | 'demande_rapide' | 'contact' | 'whatsapp';

let enabled = false;

export function configureAnalytics({
  settingsEnabled,
  consentGiven,
}: {
  settingsEnabled: boolean;
  consentGiven: boolean;
}) {
  enabled = settingsEnabled && consentGiven;
}

export function isAnalyticsEnabled(): boolean {
  return enabled;
}

/** Comptabilise une demande envoyée (uniquement le type, jamais le contenu). */
export function trackConversion(name: ConversionName): void {
  if (!enabled) return;
  if (env.isDev) console.info(`[mesure d’audience] conversion : ${name}`);
}
