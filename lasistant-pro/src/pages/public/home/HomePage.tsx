import { categoriesQuery, publishedArticlesQuery, servicesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { Seo } from '@/components/seo/Seo';
import { localBusinessSchema } from '@/components/seo/structured-data';
import { HOME_CONTENT } from '@/content/pages/home';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { HomeHero } from './HomeHero';
import {
  HomeAudiences,
  HomeContact,
  HomeEngagement,
  HomeJourney,
  HomeNews,
  HomeServices,
  HomeValues,
} from './HomeSections';

export const loader = () => prefetch(servicesQuery(), publishedArticlesQuery(), categoriesQuery(true));

/** Page d'accueil (cahier des charges § 6.1). */
export function Component() {
  const settings = useSiteSettings();
  return (
    <>
      <Seo
        title={settings.seo.homeTitle}
        rawTitle
        description={settings.seo.defaultDescription || HOME_CONTENT.seo.description}
        path="/"
        structuredData={settings.seo.structuredData ? localBusinessSchema(settings) : undefined}
      />
      <HomeHero />
      <HomeServices />
      <HomeEngagement />
      <HomeJourney />
      <HomeAudiences />
      <HomeValues />
      <HomeNews />
      <HomeContact />
    </>
  );
}
