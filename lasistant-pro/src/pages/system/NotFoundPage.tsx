import { Seo } from '@/components/seo/Seo';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { NotFoundView } from '@/features/system/ErrorViews';

/** Page introuvable (adresse inconnue du site public). */
export function Component() {
  const { seo } = SYSTEM_PAGES_CONTENT.notFound;
  return (
    <>
      <Seo title={seo.title} description={seo.description} noIndex />
      <NotFoundView />
    </>
  );
}
