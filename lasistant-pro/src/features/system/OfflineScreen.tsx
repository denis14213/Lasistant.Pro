import { Link } from 'react-router';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { Logo } from '@/components/brand/Logo';
import { AccentTitle, Button, ButtonAnchor } from '@/components/ui';
import { IconAirplaneMode, IconOffline, IconOnline, IconPhone, IconRetry } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { phoneHref } from '@/lib/format';

const TIP_ICONS = [IconOnline, IconAirplaneMode, IconRetry];

/** Numéro affiché hors connexion : un appel téléphonique fonctionne sans Internet. */
const FALLBACK_PHONE = '+216 54 479 391';

/**
 * Contenu « Hors connexion » : conseils, nouvel essai et appel direct.
 * Volontairement autonome (aucune donnée à charger) : il reste utilisable sans réseau.
 */
export function OfflineView({ phone = FALLBACK_PHONE }: { phone?: string }) {
  const content = SYSTEM_PAGES_CONTENT.offline;
  return (
    <div className="flex max-w-[600px] flex-col items-center gap-7 text-center">
      <span className="flex size-[88px] items-center justify-center rounded-full bg-neutral-soft text-ink-soft">
        <IconOffline className="size-9" aria-hidden />
      </span>
      <h1 className="text-[clamp(2.125rem,3.6vw,3.125rem)] leading-tight font-semibold tracking-[-0.035em] max-[359px]:text-[min(2.125rem,9.3vw)]">
        <AccentTitle value={content.title} />
      </h1>
      <p className="text-[17px] text-muted md:text-lg">{content.lead}</p>
      <ul className="flex w-full flex-col gap-2.5 rounded-card border border-line bg-paper px-6 py-5 text-left">
        {content.tips.map((tip, index) => {
          const TipIcon = TIP_ICONS[index] ?? IconRetry;
          return (
            <li key={tip} className="flex items-center gap-3 text-[15px] text-ink-soft">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand">
                <TipIcon className="size-4" aria-hidden />
              </span>
              {tip}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" icon={<IconRetry />} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
        <ButtonAnchor href={phoneHref(phone)} variant="outline" size="lg" icon={<IconPhone />}>
          Appeler le {phone}
        </ButtonAnchor>
      </div>
      <p className="text-[13.5px] text-muted">{content.callHint}</p>
    </div>
  );
}

/** Écran complet « Hors connexion » (sans en-tête ni pied de page du site). */
export function OfflineScreen({ phone }: { phone?: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <BrandSwoosh className="absolute -top-40 -right-50 size-[640px] opacity-10" />
      <div
        role="status"
        className="relative z-10 flex flex-wrap items-center justify-center gap-3 bg-ink-soft px-5 py-2.5 text-center text-sm font-medium text-white"
      >
        <IconOffline className="size-4" aria-hidden />
        Vous êtes hors connexion.
      </div>
      <header className="relative z-10 px-5 py-4 md:px-10 md:py-6">
        <Link to={ROUTES.home} aria-label="LASISTANT.PRO, retour à l’accueil" className="inline-flex">
          <Logo showTagline="desktop" />
        </Link>
      </header>
      <main id="contenu" className="relative z-10 flex flex-1 items-center justify-center px-5 pt-6 pb-16">
        <OfflineView phone={phone} />
      </main>
    </div>
  );
}
