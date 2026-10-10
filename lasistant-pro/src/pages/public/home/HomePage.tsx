import { categoriesQuery, publishedArticlesQuery, servicesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { Seo } from '@/components/seo/Seo';
import { localBusinessSchema } from '@/components/seo/structured-data';
import { usePageContent } from '@/features/content/usePageContent';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { HomeHero } from './HomeHero';
import {
  HomeAudiences,
  HomeContact,
  HomeEngagement,
  HomeField,
  HomeJourney,
  HomeNews,
  HomeServices,
  HomeTrust,
  HomeValues,
} from './HomeSections';

export const loader = () => prefetch(servicesQuery(), publishedArticlesQuery(), categoriesQuery(true));

/** Page d'accueil (cahier des charges § 6.1). */
export function Component() {
  const settings = useSiteSettings();
  const { seo } = usePageContent('accueil');
  return (
    <>
      <Seo
        title={settings.seo.homeTitle}
        rawTitle
        description={settings.seo.defaultDescription || seo.description}
        path="/"
        structuredData={settings.seo.structuredData ? localBusinessSchema(settings) : undefined}
      />
      <HomeHero />
      <HomeServices />
      <HomeField />
      <HomeTrust />
      <HomeEngagement />
      <HomeJourney />
      <HomeAudiences />
      <HomeValues />
      <HomeNews />
      <HomeContact />
    </>
  );
}
