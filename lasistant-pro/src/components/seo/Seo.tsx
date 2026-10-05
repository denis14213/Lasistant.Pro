import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { env } from '@/config/env';

/**
 * Métadonnées de la page (cahier des charges § 11.1) :
 * titre, description, URL canonique, Open Graph, indexation et données structurées.
 *
 * Les balises existantes de index.html sont mises à jour plutôt que dupliquées.
 */

const SITE_NAME = 'LASISTANT.PRO';
const DEFAULT_IMAGE = '/og-image.jpg';

interface SeoProps {
  /** Titre de la page, sans le nom du site (ajouté automatiquement) */
  title: string;
  description: string;
  /** Chemin canonique (par défaut : chemin courant, sans paramètres) */
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  /** Pages privées ou techniques : exclues des moteurs de recherche */
  noIndex?: boolean;
  /** Données structurées schema.org (JSON-LD) */
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Titre complet, sans ajout du nom du site */
  rawTitle?: boolean;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function setCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.append(element);
  }
  element.href = href;
}

export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noIndex = false,
  structuredData,
  rawTitle,
}: SeoProps) {
  const location = useLocation();
  const canonicalPath = path ?? location.pathname;
  const structuredJson = structuredData ? JSON.stringify(structuredData) : null;

  useEffect(() => {
    const fullTitle = rawTitle ? title : `${title} | ${SITE_NAME}`;
    const url = `${env.siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const imageUrl = (image ?? DEFAULT_IMAGE).startsWith('http')
      ? (image ?? DEFAULT_IMAGE)
      : `${env.siteUrl}${image ?? DEFAULT_IMAGE}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', imageUrl);
  }, [title, description, canonicalPath, image, type, noIndex, rawTitle]);

  // Données structurées : un script JSON-LD par page, retiré à la navigation suivante.
  useEffect(() => {
    if (!structuredJson) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'page';
    script.textContent = structuredJson.replace(/</g, '\\u003c');
    document.head.append(script);
    return () => script.remove();
  }, [structuredJson]);

  return null;
}
