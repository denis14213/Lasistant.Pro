import { ROUTES, servicePath } from '@/config/routes';
import type { Article, Service } from '@/types';

/**
 * Plan du site pour les moteurs de recherche (sitemap.xml).
 * Pages publiques indexables, services actifs et articles publiés.
 */

const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: ROUTES.home, priority: '1.0', changefreq: 'weekly' },
  { path: ROUTES.services, priority: '0.9', changefreq: 'monthly' },
  { path: ROUTES.about, priority: '0.7', changefreq: 'yearly' },
  { path: ROUTES.booking, priority: '0.9', changefreq: 'monthly' },
  { path: ROUTES.articles, priority: '0.8', changefreq: 'weekly' },
  { path: ROUTES.contact, priority: '0.8', changefreq: 'yearly' },
  { path: ROUTES.faq, priority: '0.6', changefreq: 'monthly' },
  { path: ROUTES.legalNotice, priority: '0.2', changefreq: 'yearly' },
  { path: ROUTES.privacy, priority: '0.2', changefreq: 'yearly' },
  { path: ROUTES.cookies, priority: '0.2', changefreq: 'yearly' },
  { path: ROUTES.sitemap, priority: '0.2', changefreq: 'monthly' },
];

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSitemapUrls(
  services: Service[],
  articles: Article[],
): Array<{ path: string; priority: string; changefreq: string; lastmod?: string }> {
  return [
    ...STATIC_PAGES,
    ...services
      .filter((service) => service.kind === 'page' && service.active)
      .map((service) => ({
        path: servicePath(service.slug),
        priority: '0.9',
        changefreq: 'monthly',
        lastmod: service.updatedAt,
      })),
    ...articles
      .filter((article) => article.status === 'publie')
      .map((article) => ({
        path: ROUTES.article(article.slug),
        priority: '0.6',
        changefreq: 'yearly',
        lastmod: article.updatedAt,
      })),
  ];
}

export function buildSitemapXml(siteUrl: string, services: Service[], articles: Article[]): string {
  const entries = buildSitemapUrls(services, articles).map((entry) =>
    [
      '  <url>',
      `    <loc>${escapeXml(siteUrl + (entry.path === '/' ? '/' : entry.path))}</loc>`,
      entry.lastmod ? `    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>` : null,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
