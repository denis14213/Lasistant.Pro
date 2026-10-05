import { useRevalidator, useRouteError } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { AdminErrorView, AdminNotFoundView } from '@/features/system/AdminErrorViews';
import { classifyError } from './error-kind';

/**
 * Erreur survenue dans une page du back-office : affichée dans le gabarit,
 * le menu latéral et la barre supérieure restent utilisables.
 */
export function AdminRouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const kind = classifyError(error);

  if (kind === 'not-found') {
    return (
      <>
        <Seo title="Page introuvable" description="Cette page du back-office n’existe pas." noIndex />
        <AdminNotFoundView />
      </>
    );
  }
  return (
    <>
      <Seo
        title={kind === 'offline' ? 'Hors connexion' : 'Erreur technique'}
        description="Chargement impossible."
        noIndex
      />
      <AdminErrorView offline={kind === 'offline'} onRetry={() => void revalidator.revalidate()} />
    </>
  );
}
