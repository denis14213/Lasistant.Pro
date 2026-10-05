import { ButtonAnchor, Button } from '@/components/ui';
import { IconExternalLink, IconPreferences } from '@/components/ui/icons';
import { CONTACT_CONTENT } from '@/content/pages/public';
import { useCookieConsent } from '@/features/cookies/consent-context';
import { addressLine, useSiteSettings } from '@/features/settings/useSiteSettings';
import { MapPlaceholder } from './MapPlaceholder';

/**
 * Plan d'accès de la page Contact.
 * - adresse non validée : plan stylisé et mention d'attente ;
 * - adresse validée sans accord pour les contenus tiers : proposition de les autoriser ;
 * - adresse validée et accord donné : lien d'itinéraire (carte interactive en phase 2).
 */
export function ContactMap() {
  const settings = useSiteSettings();
  const consent = useCookieConsent();
  const { map } = CONTACT_CONTENT;
  const address = addressLine(settings);

  if (!settings.address.validated) {
    return (
      <MapPlaceholder className="h-[340px] md:h-[420px]">
        <p className="font-semibold">{settings.address.street}</p>
        <p className="text-[13.5px] leading-[1.45] text-muted">{map.pendingText}</p>
      </MapPlaceholder>
    );
  }

  if (!consent.choices.thirdParty) {
    return (
      <MapPlaceholder className="h-[340px] md:h-[420px]">
        <p className="font-semibold">{address}</p>
        <p className="text-[13.5px] leading-[1.45] text-muted">{map.consentText}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          icon={<IconPreferences />}
          onClick={consent.openPreferences}
        >
          Autoriser les contenus tiers
        </Button>
      </MapPlaceholder>
    );
  }

  return (
    <MapPlaceholder className="h-[340px] md:h-[420px]">
      <p className="font-semibold">{address}</p>
      <ButtonAnchor
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        className="mt-2"
        trailingIcon={<IconExternalLink />}
      >
        Ouvrir l’itinéraire
      </ButtonAnchor>
    </MapPlaceholder>
  );
}
