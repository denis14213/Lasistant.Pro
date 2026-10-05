import { ROUTES } from '@/config/routes';
import { LEGAL_NOTICE } from '@/content/legal';
import { LegalDocumentView } from '@/features/legal/LegalDocumentView';

/** Mentions légales (cahier des charges § 6.12). */
export function Component() {
  return (
    <LegalDocumentView
      document={LEGAL_NOTICE}
      path={ROUTES.legalNotice}
      seo={{
        title: 'Mentions légales',
        description: 'Éditeur, hébergement, propriété intellectuelle et responsabilité du site LASISTANT.PRO.',
      }}
    />
  );
}
