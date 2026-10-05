// Génère public/sitemap.xml à partir des contenus du site (pages, services actifs, articles publiés).
// Utilisation : npm run sitemap — lancé aussi automatiquement avant chaque « npm run build ».
// Phase 2 : le plan du site sera produit à partir de la base de données (fonction serveur).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const siteUrl = (process.env.VITE_SITE_URL ?? 'https://lasistant.pro').replace(/\/$/, '');

// Vite charge les modules TypeScript du projet (alias « @ » compris) sans démarrer de serveur web.
const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});
try {
  const [{ buildSitemapXml, buildSitemapUrls }, { createServicesSeed }, { createArticlesSeed }] =
    await Promise.all([
      vite.ssrLoadModule('/src/lib/sitemap.ts'),
      vite.ssrLoadModule('/src/content/services.ts'),
      vite.ssrLoadModule('/src/content/articles.ts'),
    ]);
  const services = createServicesSeed();
  const articles = createArticlesSeed();
  await writeFile(
    new URL('../public/sitemap.xml', import.meta.url),
    buildSitemapXml(siteUrl, services, articles),
    'utf8',
  );
  console.log(`sitemap.xml généré : ${buildSitemapUrls(services, articles).length} adresses (${siteUrl}).`);
} finally {
  await vite.close();
}
