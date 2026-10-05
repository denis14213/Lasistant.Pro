import { ROUTES } from '@/config/routes';
import { PRIVACY_POLICY } from '@/content/legal';
import { LegalDocumentView } from '@/features/legal/LegalDocumentView';

/** Politique de confidentialité (cahier des charges § 6.12 et § 10). */
export function Component() {
  return (
    <LegalDocumentView
      document={PRIVACY_POLICY}
      path={ROUTES.privacy}
      seo={{
        title: 'Politique de confidentialité',
        description: 'Comment LASISTANT.PRO collecte, utilise et protège vos données personnelles.',
      }}
    />
  );
}
