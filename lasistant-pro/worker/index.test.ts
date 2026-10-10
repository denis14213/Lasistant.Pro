import { describe, expect, it, vi } from 'vitest';
import worker from './index';

/** Fichiers publiés simulés : la page d'accueil du site, avec ses en-têtes. */
function createEnv() {
  const fetch = vi.fn(async (request: Request) => {
    const { pathname } = new URL(request.url);
    return new Response(pathname === '/' ? '<!doctype html><div id="root"></div>' : 'absent', {
      status: pathname === '/' ? 200 : 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  });
  return { env: { ASSETS: { fetch } }, fetch };
}

const call = (path: string, init?: RequestInit) => {
  const { env, fetch } = createEnv();
  return { response: worker.fetch(new Request(`https://lasistant.pro${path}`, init), env), fetch };
};

describe('Worker Cloudflare', () => {
  it('répond 404, sans cache, pour un fichier introuvable (jamais la page HTML)', async () => {
    for (const path of ['/assets/index-ancien.js', '/photo-supprimee.webp', '/assets/sans-extension']) {
      const { response, fetch } = call(path);
      const result = await response;
      expect(result.status).toBe(404);
      expect(result.headers.get('Cache-Control')).toBe('no-store');
      expect(result.headers.get('Content-Type')).toContain('text/plain');
      expect(fetch).not.toHaveBeenCalled();
    }
  });

  it('sert index.html pour une route de l’application demandée sans en-tête de navigation', async () => {
    const { response, fetch } = call('/services/assistance-medicale');
    const result = await response;
    expect(result.status).toBe(200);
    expect(await result.text()).toContain('<div id="root">');
    expect(new URL(fetch.mock.calls[0]![0].url).pathname).toBe('/');
    expect(result.headers.get('X-Robots-Tag')).toBeNull();
  });

  it('protège le back-office : jamais indexé, jamais mis en cache', async () => {
    const result = await call('/admin/pages').response;
    expect(result.status).toBe(200);
    expect(result.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
  });

  it('refuse les méthodes autres que GET et HEAD', async () => {
    const result = await call('/contact', { method: 'POST', body: 'x' }).response;
    expect(result.status).toBe(405);
    expect(result.headers.get('Allow')).toBe('GET, HEAD');
  });
});
