/**
 * Worker du site sur Cloudflare.
 *
 * Les fichiers publiés (dist) et les navigations sont servis directement par Cloudflare, sans
 * passer par ce code : toute adresse de l'application reçoit index.html (« single-page-application »).
 * Ce Worker n'est appelé que pour une requête qui ne correspond à aucun fichier et qui n'est pas
 * une navigation signalée par le navigateur (en-tête « Sec-Fetch-Mode: navigate ») :
 *   - un fichier introuvable (script d'une version précédente, image supprimée…) reçoit une vraie
 *     404 : la page HTML ne doit jamais être servie, et mise en cache un an, à la place d'un script ;
 *   - une adresse de l'application demandée sans cet en-tête (robots d'indexation, aperçus de
 *     liens des messageries, anciens navigateurs) reçoit index.html, comme une navigation.
 */

interface Env {
  /** Fichiers publiés (liaison « ASSETS » de wrangler.jsonc) */
  ASSETS: { fetch(request: Request): Promise<Response> };
}

/** Chemin d'un fichier : extension finale (« .js », « .webp », « .xml »…). */
const FILE_PATH = /\.[a-z0-9]{1,8}$/i;

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Méthode non autorisée.', {
        status: 405,
        headers: { ...NO_STORE, Allow: 'GET, HEAD' },
      });
    }
    if (url.pathname.startsWith('/assets/') || FILE_PATH.test(url.pathname)) {
      return new Response('Fichier introuvable.', {
        status: 404,
        headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Route de l'application : la page d'accueil du site (index.html) avec ses en-têtes.
    const page = await env.ASSETS.fetch(new Request(new URL('/', url), { method: request.method }));
    if (!url.pathname.startsWith('/admin')) return page;
    // Back-office : mêmes règles que public/_headers (jamais indexé, jamais mis en cache).
    const response = new Response(page.body, page);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  },
};
