import { Seo } from '@/components/seo/Seo';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { OfflineScreen } from '@/features/system/OfflineScreen';

/** Aperçu de l'écran « Hors connexion » (affiché automatiquement sans réseau). */
export function Component() {
  const settings = useSiteSettings();
  const { seo } = SYSTEM_PAGES_CONTENT.offline;
  return (
    <>
      <Seo title={seo.title} description={seo.description} noIndex />
      <OfflineScreen phone={primaryPhone(settings) ?? undefined} />
    </>
  );
}
