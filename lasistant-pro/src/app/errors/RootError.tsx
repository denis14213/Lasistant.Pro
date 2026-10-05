import { useRouteError } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { NotFoundView, ServerErrorView } from '@/features/system/ErrorViews';
import { OfflineScreen } from '@/features/system/OfflineScreen';
import { classifyError } from './error-kind';

/**
 * Dernier filet de sécurité : erreur survenue avant l'affichage d'un gabarit
 * (lecture des réglages impossible, fichier de l'application introuvable…).
 * L'écran est volontairement autonome.
 */
export function RootError() {
  const error = useRouteError();
  const kind = classifyError(error);

  if (kind === 'offline') return <OfflineScreen />;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="px-5 py-4 md:px-10 md:py-6">
        <a href="/" aria-label="LASISTANT.PRO, retour à l’accueil" className="inline-flex">
          <Logo showTagline="desktop" />
        </a>
      </header>
      <main id="contenu" className="flex-1">
        {kind === 'not-found' ? <NotFoundView /> : <ServerErrorView />}
      </main>
    </div>
  );
}
