// Génère public/sitemap.xml à partir de la base de données : pages publiques, services actifs
// et articles publiés (lus avec la clé publique : seuls les contenus visibles des visiteurs).
// Utilisation : npm run sitemap — lancé aussi automatiquement avant chaque « npm run build ».
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer, loadEnv } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = new URL('../public/sitemap.xml', import.meta.url);
const env = loadEnv(process.env.NODE_ENV === 'development' ? 'development' : 'production', root, 'VITE_');
const siteUrl = (env.VITE_SITE_URL ?? 'https://lasistant.pro').replace(/\/$/, '');
const supabaseUrl = (env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

/** Lecture d'une table par l'API REST (mêmes règles d'accès qu'un visiteur du site). */
async function readTable(table, query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: { apikey: publishableKey, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`${table} : HTTP ${response.status} ${await response.text()}`);
  return response.json();
}

// Vite charge les modules TypeScript du projet (alias « @ » compris) sans démarrer de serveur web.
const vite = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});
try {
  const [{ buildSitemapXml, buildSitemapUrls }, { toArticle, toService }] = await Promise.all([
    vite.ssrLoadModule('/src/lib/sitemap.ts'),
    vite.ssrLoadModule('/src/api/supabase/mappers.ts'),
  ]);

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont nécessaires pour générer le plan du site.',
    );
  }

  try {
    const [serviceRows, articleRows] = await Promise.all([
      readTable('services', 'select=*&active=eq.true&order=sort_order'),
      readTable('articles', 'select=*&status=eq.publie&order=published_at.desc'),
    ]);
    const services = serviceRows.map(toService);
    const articles = articleRows.map(toArticle);
    await writeFile(output, buildSitemapXml(siteUrl, services, articles), 'utf8');
    console.log(
      `sitemap.xml généré depuis la base : ${buildSitemapUrls(services, articles).length} adresses (${siteUrl}).`,
    );
  } catch (error) {
    // Base momentanément injoignable : le plan existant est conservé, la compilation continue.
    console.warn(
      `sitemap.xml non régénéré (base injoignable) : ${error instanceof Error ? error.message : error}`,
    );
  }
} finally {
  await vite.close();
}
