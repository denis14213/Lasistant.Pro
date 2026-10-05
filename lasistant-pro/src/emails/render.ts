import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Rendu HTML autonome d'un e-mail : utilisé pour l'aperçu (cadre isolé des styles du
 * back-office) et pour le téléchargement du code HTML. En phase 2, la fonction serveur
 * d'envoi utilisera le même rendu.
 */

/** Adaptation aux petits écrans, pour les messageries qui gèrent les requêtes média. */
const RESPONSIVE_CSS = `
body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
img { border: 0; }
@media (max-width: 640px) {
  .lp-envelope { padding: 0 0 24px !important; }
  .lp-card { border-radius: 0 !important; }
  .lp-pad { padding-left: 20px !important; padding-right: 20px !important; }
  .lp-title { font-size: 24px !important; }
}`;

/**
 * React ajoute des indications de préchargement des images, utiles à une page web :
 * dans un e-mail, elles sont inutiles et parfois signalées comme suspectes.
 */
const PRELOAD_HINT = /<link rel="preload"[^>]*>/g;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface RenderOptions {
  /** Ouvre les liens dans un nouvel onglet (aperçu dans un cadre) */
  linksInNewTab?: boolean;
}

export function renderEmailHtml(
  email: ReactElement,
  title: string,
  { linksInNewTab = false }: RenderOptions = {},
): string {
  return [
    '<!doctype html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light">',
    `<title>${escapeHtml(title)}</title>`,
    linksInNewTab ? '<base target="_blank">' : '',
    `<style>${RESPONSIVE_CSS}</style>`,
    '</head>',
    `<body>${renderToStaticMarkup(email).replace(PRELOAD_HINT, '')}</body>`,
    '</html>',
  ]
    .filter(Boolean)
    .join('\n');
}
