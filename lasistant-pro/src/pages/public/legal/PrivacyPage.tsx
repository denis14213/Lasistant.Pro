import { ROUTES } from '@/config/routes';
import { usePageContent } from '@/features/content/usePageContent';
import { LegalDocumentView } from '@/features/legal/LegalDocumentView';

/** Politique de confidentialité (cahier des charges § 6.12 et § 10). */
export function Component() {
  const legalDocument = usePageContent('confidentialite');
  return (
    <LegalDocumentView
      document={legalDocument}
      path={ROUTES.privacy}
      seo={{
        title: 'Politique de confidentialité',
        description: 'Comment LASISTANT.PRO collecte, utilise et protège vos données personnelles.',
      }}
    />
  );
}
