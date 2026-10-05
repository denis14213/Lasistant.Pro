import { useState } from 'react';
import { Link } from 'react-router';
import { LogoMark } from '@/components/brand/Logo';
import { Button, Dialog } from '@/components/ui';
import { IconCheck, IconCookie, IconPreferences } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { CONSENT_CATEGORIES } from '@/content/cookies';
import { useCookieConsent } from './consent-context';
import type { ConsentChoices } from './consent-storage';
import { ConsentCategoryRow } from './ConsentCategoryRow';

/**
 * Interface du consentement affichée sur le site public :
 * bannière à la première visite, fenêtre de préférences et bouton de rappel.
 * « Tout refuser » et « Tout accepter » ont volontairement le même poids visuel.
 */
export function CookieConsentUI() {
  const consent = useCookieConsent();
  return (
    <>
      {consent.hasDecided ? <CookieSettingsButton /> : <CookieBanner />}
      <CookiePreferencesDialog />
    </>
  );
}

function CookieBanner() {
  const { acceptAll, rejectAll, openPreferences, isPreferencesOpen } = useCookieConsent();
  if (isPreferencesOpen) return null;
  return (
    <section
      role="region"
      aria-labelledby="bandeau-cookies-titre"
      className="fixed inset-x-0 bottom-0 z-[120] flex flex-col gap-4.5 rounded-t-[24px] border-t border-line bg-paper px-5 pt-5.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[15px] text-ink shadow-[0_-20px_60px_-20px_rgb(20_18_24/0.35)] md:inset-x-auto md:bottom-6 md:left-6 md:w-[min(580px,calc(100%-3rem))] md:rounded-[24px] md:border md:p-6.5"
    >
      <div className="flex items-center gap-3.5">
        <span className="flex size-12 items-center justify-center rounded-[14px] border border-line bg-white p-1.5">
          <LogoMark size={34} />
        </span>
        <div>
          <h2
            id="bandeau-cookies-titre"
            className="text-[19px] leading-tight font-semibold tracking-[-0.015em]"
          >
            Vos préférences de cookies
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">LASISTANT.PRO respecte votre vie privée</p>
        </div>
      </div>
      <p className="text-muted">
        Nous utilisons des cookies essentiels au fonctionnement du site. Avec votre accord, nous utilisons
        aussi des cookies de mesure d’audience et des contenus tiers (carte, partage) pour améliorer nos
        services. Vous pouvez changer d’avis à tout moment.{' '}
        <Link to={ROUTES.cookies} className="text-brand underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Button variant="dark" size="sm" className="md:order-3" onClick={acceptAll}>
          Tout accepter
        </Button>
        <Button variant="outline" size="sm" onClick={rejectAll}>
          Tout refuser
        </Button>
        <Button variant="outline" size="sm" icon={<IconPreferences />} onClick={openPreferences}>
          Personnaliser
        </Button>
      </div>
    </section>
  );
}

function CookieSettingsButton() {
  const { openPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      aria-label="Modifier mes préférences de cookies"
      className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[110] inline-flex h-11 items-center gap-2 rounded-full bg-night pr-4 pl-3 text-sm font-semibold text-white shadow-raised transition-colors hover:bg-brand-dark md:bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:left-5 md:h-12 print:hidden"
    >
      <IconCookie className="size-4.5" aria-hidden />
      Cookies
    </button>
  );
}

function CookiePreferencesDialog() {
  const consent = useCookieConsent();
  // Brouillon local : les interrupteurs n'ont d'effet qu'après « Enregistrer mes choix ».
  const [draft, setDraft] = useState<ConsentChoices>(consent.choices);
  const [wasOpen, setWasOpen] = useState(false);

  // À chaque ouverture, le brouillon repart des choix enregistrés.
  if (consent.isPreferencesOpen !== wasOpen) {
    setWasOpen(consent.isPreferencesOpen);
    if (consent.isPreferencesOpen) setDraft(consent.choices);
  }

  return (
    <Dialog
      open={consent.isPreferencesOpen}
      onClose={consent.closePreferences}
      variant="sheet"
      size="lg"
      scrollable
      title="Gérer mes préférences"
      description="Choisissez les cookies que vous acceptez. Les cookies essentiels ne peuvent pas être désactivés : sans eux, le site ne fonctionne pas correctement."
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-1 gap-2 md:flex-none">
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={consent.rejectAll}>
              Tout refuser
            </Button>
            <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={consent.acceptAll}>
              Tout accepter
            </Button>
          </div>
          <Button
            size="sm"
            icon={<IconCheck />}
            className="w-full md:w-auto"
            onClick={() => consent.save(draft)}
          >
            Enregistrer mes choix
          </Button>
        </div>
      }
    >
      <div className="divide-y divide-line border-y border-line">
        {CONSENT_CATEGORIES.map((category) => (
          <ConsentCategoryRow
            key={category.id}
            category={category}
            checked={category.id === 'essential' ? true : draft[category.id]}
            onChange={(checked) =>
              setDraft((current) =>
                category.id === 'essential' ? current : { ...current, [category.id]: checked },
              )
            }
          />
        ))}
        <p className="py-3.5 text-[13px] text-muted">
          Pour en savoir plus, consultez notre{' '}
          <Link to={ROUTES.cookies} className="text-brand underline underline-offset-2">
            page de gestion des cookies
          </Link>{' '}
          et notre{' '}
          <Link to={ROUTES.privacy} className="text-brand underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </Dialog>
  );
}
