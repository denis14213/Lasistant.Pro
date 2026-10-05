import { env } from '@/config/env';
import type { Article, SiteSettings } from '@/types';

/**
 * Données structurées schema.org (cahier des charges § 11.1).
 * Seules les informations validées sont publiées : l'adresse complète n'apparaît
 * qu'une fois confirmée par le propriétaire.
 */

export function localBusinessSchema(settings: SiteSettings): Record<string, unknown> {
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    streetAddress: settings.address.street,
    addressCountry: 'TN',
  };
  if (settings.address.validated) {
    if (settings.address.postalCode) address.postalCode = settings.address.postalCode;
    if (settings.address.city) address.addressLocality = settings.address.city;
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.brandName,
    description: settings.description,
    url: env.siteUrl,
    logo: `${env.siteUrl}/icon-512.png`,
    image: `${env.siteUrl}${settings.seo.shareImage}`,
    telephone: settings.phones.find((phone) => phone.active)?.value,
    email: settings.emails.find((email) => email.active)?.value,
    address,
    areaServed: { '@type': 'Country', name: 'Tunisie' },
    ...(settings.facebook.url ? { sameAs: [settings.facebook.url] } : {}),
  };
}

export function articleSchema(article: Article, coverUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: coverUrl.startsWith('http') ? coverUrl : `${env.siteUrl}${coverUrl}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@type': 'Organization', name: 'LASISTANT.PRO', logo: `${env.siteUrl}/icon-512.png` },
    mainEntityOfPage: `${env.siteUrl}/espace-infos/${article.slug}`,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${env.siteUrl}${item.path}`,
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Fil d'Ariane affiché → données structurées (le dernier élément pointe vers la page courante). */
export function breadcrumbTrailSchema(
  items: Array<{ label: string; to?: string }>,
  currentPath: string,
): Record<string, unknown> {
  return breadcrumbSchema(items.map((item) => ({ name: item.label, path: item.to ?? currentPath })));
}
