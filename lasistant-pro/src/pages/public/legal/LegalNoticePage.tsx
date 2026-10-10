import { ROUTES } from '@/config/routes';
import { usePageContent } from '@/features/content/usePageContent';
import { LegalDocumentView } from '@/features/legal/LegalDocumentView';

/** Mentions légales (cahier des charges § 6.12). */
export function Component() {
  const legalDocument = usePageContent('mentions-legales');
  return (
    <LegalDocumentView
      document={legalDocument}
      path={ROUTES.legalNotice}
      seo={{
        title: 'Mentions légales',
        description: 'Éditeur, hébergement, propriété intellectuelle et responsabilité du site LASISTANT.PRO.',
      }}
    />
  );
}
