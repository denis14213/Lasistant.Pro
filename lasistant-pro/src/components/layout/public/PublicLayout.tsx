import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router';
import { NetworkStatusBanner } from '@/components/feedback/NetworkStatusBanner';
import { PageLoader } from '@/components/feedback/PageLoader';
import { RouteFocus, SkipLink } from '@/components/feedback/RouteFocus';
import { useAuth } from '@/features/auth/auth-context';
import { useCookieConsent } from '@/features/cookies/consent-context';
import { CookieConsentUI } from '@/features/cookies/CookieConsentUI';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { MaintenanceScreen } from '@/features/system/MaintenanceScreen';
import { configureAnalytics } from '@/lib/analytics';
import { MobileActionBar } from './MobileActionBar';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { WhatsAppButton } from './WhatsAppButton';

/**
 * Gabarit du site public : en-tête, contenu, pied de page, barre d'action mobile,
 * bouton flottant WhatsApp et consentement aux cookies. Le mode maintenance remplace tout le site pour les
 * visiteurs, mais pas pour l'équipe connectée.
 */
export function PublicLayout() {
  const settings = useSiteSettings();
  const { session } = useAuth();
  const consent = useCookieConsent();

  // La mesure d'audience ne s'active qu'avec l'accord du visiteur.
  useEffect(() => {
    configureAnalytics({ settingsEnabled: settings.analytics.enabled, consentGiven: consent.choices.analytics });
  }, [settings.analytics.enabled, consent.choices.analytics]);

  if (settings.maintenance.enabled && !session) {
    return <MaintenanceScreen settings={settings} />;
  }

  return (
    <>
      <SkipLink />
      <NetworkStatusBanner />
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <MobileActionBar />
      <WhatsAppButton />
      <CookieConsentUI />
      <RouteFocus />
    </>
  );
}
