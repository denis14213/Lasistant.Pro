import { useRevalidator, useRouteError } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { NotFoundView, ServerErrorView } from '@/features/system/ErrorViews';
import { OfflineView } from '@/features/system/OfflineScreen';
import { classifyError } from './error-kind';

/**
 * Erreur survenue dans une page publique : affichée dans le gabarit du site
 * (l'en-tête et le pied de page restent disponibles pour se réorienter).
 */
export function PublicRouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const kind = classifyError(error);
  const { notFound, serverError, offline } = SYSTEM_PAGES_CONTENT;

  if (kind === 'not-found') {
    return (
      <>
        <Seo title={notFound.seo.title} description={notFound.seo.description} noIndex />
        <NotFoundView />
      </>
    );
  }
  if (kind === 'offline') {
    return (
      <>
        <Seo title={offline.seo.title} description={offline.seo.description} noIndex />
        <div className="flex justify-center px-5 py-16 md:py-24">
          <OfflineView />
        </div>
      </>
    );
  }
  return (
    <>
      <Seo title={serverError.seo.title} description={serverError.seo.description} noIndex />
      <ServerErrorView onRetry={() => void revalidator.revalidate()} />
    </>
  );
}
