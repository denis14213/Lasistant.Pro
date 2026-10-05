import { Seo } from '@/components/seo/Seo';
import { AdminNotFoundView } from '@/features/system/AdminErrorViews';

/** Adresse inconnue dans le back-office (erreur 404 affichée dans le gabarit). */
export function Component() {
  return (
    <>
      <Seo title="Page introuvable" description="Cette page du back-office n’existe pas." noIndex />
      <AdminNotFoundView />
    </>
  );
}
