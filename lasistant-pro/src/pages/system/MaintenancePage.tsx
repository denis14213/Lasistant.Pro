import { Seo } from '@/components/seo/Seo';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { MaintenanceScreen } from '@/features/system/MaintenanceScreen';

/**
 * Aperçu de la page de maintenance (lien depuis le back-office).
 * En production, cette page est affichée automatiquement quand le mode maintenance est actif.
 */
export function Component() {
  const settings = useSiteSettings();
  const { seo } = SYSTEM_PAGES_CONTENT.maintenance;
  return (
    <>
      <Seo title={seo.title} description={seo.description} noIndex />
      <MaintenanceScreen settings={settings} />
    </>
  );
}
