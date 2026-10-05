import { useSuspenseQuery } from '@tanstack/react-query';
import { settingsQuery } from '@/api';
import type { ContactEntry, SiteSettings } from '@/types';

/**
 * Réglages du site, partagés par l'en-tête, le pied de page, la page Contact…
 * Une modification faite dans le back-office se répercute partout immédiatement.
 */
export function useSiteSettings(): SiteSettings {
  return useSuspenseQuery(settingsQuery()).data;
}

export function activeEntries(entries: ContactEntry[]): ContactEntry[] {
  return entries.filter((entry) => entry.active);
}

/** Numéro principal (premier numéro actif), ou null. */
export function primaryPhone(settings: SiteSettings): string | null {
  return activeEntries(settings.phones)[0]?.value ?? null;
}

export function primaryEmail(settings: SiteSettings): string | null {
  return activeEntries(settings.emails)[0]?.value ?? null;
}

/** Adresse affichable ; les éléments manquants sont signalés par l'appelant. */
export function addressLine(settings: SiteSettings): string {
  const { street, postalCode, city, country } = settings.address;
  return [street, [postalCode, city].filter(Boolean).join(' '), country].filter(Boolean).join(', ');
}

/** Page Facebook ; tant que l'adresse exacte n'est pas fournie, renvoie vers Facebook. */
export function facebookHref(settings: SiteSettings): string {
  return settings.facebook.url ?? 'https://www.facebook.com/';
}
