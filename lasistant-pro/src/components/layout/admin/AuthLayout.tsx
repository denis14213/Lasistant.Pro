import { Outlet, useMatches } from 'react-router';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { LogoMark } from '@/components/brand/Logo';
import { AccentTitle } from '@/components/ui';
import { NetworkStatusBanner } from '@/components/feedback/NetworkStatusBanner';
import { RouteFocus } from '@/components/feedback/RouteFocus';
import { IconLock } from '@/components/ui/icons';
import { RedirectIfAuthenticated } from '@/features/auth/guards';
import type { AccentText } from '@/types';

/** Texte du panneau de gauche, propre à chaque écran (déclaré dans la route). */
export interface AuthScreenHandle {
  artTitle?: AccentText;
  artText?: string;
  /** Écran accessible même connecté (ex. : lien de réinitialisation) */
  allowAuthenticated?: boolean;
}

const DEFAULT_ART: Required<Pick<AuthScreenHandle, 'artTitle' | 'artText'>> = {
  artTitle: {
    start: 'Gérez vos demandes, vos contenus et vos',
    accent: 'rendez-vous',
    end: 'au même endroit.',
  },
  artText: 'Espace réservé à l’équipe LASISTANT.PRO.',
};

/**
 * Gabarit des écrans de connexion : panneau de marque à gauche (masqué sur tablette
 * et mobile) et formulaire centré à droite.
 */
export function AuthLayout() {
  const matches = useMatches();
  const handle = (matches.at(-1)?.handle ?? {}) as AuthScreenHandle;
  const artTitle = handle.artTitle ?? DEFAULT_ART.artTitle;
  const artText = handle.artText ?? DEFAULT_ART.artText;

  const content = (
    <div className="grid min-h-dvh grid-cols-1 bg-white text-[15px] leading-normal lg:grid-cols-2">
      <NetworkStatusBanner context="admin" />
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-plum p-14 text-white lg:flex">
        <BrandSwoosh secondBlade="green" className="absolute -right-40 -bottom-40 size-[640px] opacity-45" />
        <a
          href="/"
          className="relative inline-flex w-fit items-center gap-3"
          aria-label="LASISTANT.PRO, voir le site"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white p-2">
            <LogoMark size={40} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-2xl font-bold tracking-[-0.03em] italic">
              <span className="text-brand-light">Lasistant</span>
              <span className="text-success-light">.Pro</span>
            </span>
            <span className="mt-1.5 text-[10.5px] font-semibold tracking-[0.15em] text-on-plum uppercase">
              Back-office
            </span>
          </span>
        </a>
        <div className="relative flex max-w-[460px] flex-col gap-5">
          <p className="text-[36px] leading-[1.18] font-medium tracking-[-0.028em]">
            <AccentTitle value={artTitle} tone="light" />
          </p>
          <p className="text-on-plum">{artText}</p>
        </div>
        <p className="relative text-[13px] text-on-dark-muted">
          © {new Date().getFullYear()} LASISTANT.PRO · Soutien médical &amp; hébergement
        </p>
      </aside>
      <main
        id="contenu"
        tabIndex={-1}
        className="flex items-center justify-center px-5 py-14 outline-none md:px-8"
      >
        <div className="flex w-full max-w-[420px] flex-col gap-5.5">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2.5 lg:hidden"
            aria-label="LASISTANT.PRO, voir le site"
          >
            <LogoMark size={34} />
            <span className="text-[19px] font-bold tracking-[-0.03em] italic">
              <span className="text-brand">Lasistant</span>
              <span className="text-wordmark-green">.Pro</span>
            </span>
          </a>
          <Outlet />
          <p className="flex items-center justify-center gap-2 text-center text-[13px] text-muted">
            <IconLock className="size-4 shrink-0" aria-hidden />
            Connexion chiffrée · tentatives limitées · accès selon votre rôle
          </p>
        </div>
      </main>
      <RouteFocus />
    </div>
  );

  return handle.allowAuthenticated ? content : <RedirectIfAuthenticated>{content}</RedirectIfAuthenticated>;
}
