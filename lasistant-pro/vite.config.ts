import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Entrées « thin » et « light » des dessins Phosphor : graisses jamais utilisées par le site. */
const UNUSED_WEIGHT = /\[\s*"(?:thin|light)",/;

/** Position du « ] » qui ferme le « [ » situé en `start` (les chaînes de caractères sont ignorées). */
function closingBracket(code: string, start: number): number {
  let depth = 0;
  for (let index = start; index < code.length; index += 1) {
    const char = code[index];
    if (char === '"' || char === "'" || char === '`') {
      // Les tracés SVG ne contiennent pas de guillemets : la chaîne se termine au suivant.
      index = code.indexOf(char, index + 1);
      continue;
    }
    if (char === '[' || char === '(' || char === '{') depth += 1;
    else if (char === ']' || char === ')' || char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error('Dessin Phosphor illisible : crochet fermant introuvable.');
}

/**
 * Chaque icône Phosphor embarque ses six graisses. Le système d'icônes n'en utilise que quatre
 * (regular, bold, duotone, fill : voir src/components/ui/icon-factory.tsx) ; les deux autres sont
 * retirées du paquet de production, soit un tiers du poids des icônes.
 */
function phosphorUnusedWeights(): Plugin {
  return {
    name: 'lasistant:phosphor-unused-weights',
    apply: 'build',
    transform(code, id) {
      if (!/@phosphor-icons[/\\]react[/\\]dist[/\\]defs[/\\]/.test(id)) return null;
      let output = code;
      for (let match = UNUSED_WEIGHT.exec(output); match; match = UNUSED_WEIGHT.exec(output)) {
        const start = match.index;
        const end = closingBracket(output, start) + 1;
        // Retire l'entrée et la virgule qui la sépare de sa voisine (après elle, sinon avant).
        const after = /^\s*,/.exec(output.slice(end));
        if (after) {
          output = output.slice(0, start) + output.slice(end + after[0].length);
        } else {
          const before = /,\s*$/.exec(output.slice(0, start));
          output = output.slice(0, start - (before ? before[0].length : 0)) + output.slice(end);
        }
      }
      // Fichier de données d'une bibliothèque : aucune correspondance de source à conserver.
      return { code: output, map: { mappings: '' } };
    },
  };
}

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/**
 * Source de données choisie à la compilation : la base Supabase (par défaut), ou la base
 * simulée des tests (VITE_DATA_SOURCE=mock). Le module `@/api/source` est alors remplacé par
 * `@/api/mock/source` : le site publié ne contient ni la base simulée ni ses données fictives.
 */
function dataSourceAlias(mode: string) {
  const { VITE_DATA_SOURCE } = loadEnv(mode, projectRoot, 'VITE_');
  if (VITE_DATA_SOURCE !== 'mock') return [];
  return [
    {
      find: /^@\/api\/source$/,
      replacement: fileURLToPath(new URL('./src/api/mock/source.ts', import.meta.url)),
    },
  ];
}

/**
 * Politique de sécurité du contenu (CSP), ajoutée en tête de index.html à la compilation.
 * Elle est déduite de la configuration : le site publié n'exécute que ses propres scripts et ne
 * dialogue qu'avec le projet Supabase configuré, quel que soit l'hébergeur (Cloudflare, Vercel…).
 * La protection contre l'affichage dans un cadre (« frame-ancestors », sans effet dans une balise
 * meta) est assurée par l'en-tête X-Frame-Options (public/_headers et vercel.json).
 */
function contentSecurityPolicy(mode: string): Plugin {
  const { VITE_SUPABASE_URL = '' } = loadEnv(mode, projectRoot, 'VITE_');
  const supabase = VITE_SUPABASE_URL.trim().replace(/\/$/, '');
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    // Attributs « style » : aperçu HTML des e-mails du back-office.
    'style-src': ["'self'", "'unsafe-inline'"],
    // Photos de la médiathèque (stockage Supabase ou adresse externe) et aperçus avant envoi.
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    // API, authentification, stockage et temps réel (WebSocket) du projet Supabase.
    'connect-src': ["'self'", ...(supabase ? [supabase, supabase.replace(/^https:/, 'wss:')] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
  };
  const policy = Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(' '))
    .join('; ');
  return {
    name: 'lasistant:content-security-policy',
    // En développement, le rechargement à chaud de Vite a besoin de scripts en ligne.
    apply: 'build',
    // Juste après la déclaration d'encodage, avant toute ressource.
    transformIndexHtml(html) {
      const charset = /<meta charset="[^"]+"\s*\/?>/i.exec(html);
      if (!charset) throw new Error('index.html : balise <meta charset> introuvable.');
      const end = charset.index + charset[0].length;
      const meta = `\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`;
      return html.slice(0, end) + meta + html.slice(end);
    },
  };
}

// Configuration Vite : React, Tailwind CSS v4 et alias « @ » vers le dossier src.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), phosphorUnusedWeights(), contentSecurityPolicy(mode)],
  resolve: {
    alias: [
      ...dataSourceAlias(mode),
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2022',
    // Les cartes de sources facilitent le diagnostic en production sans exposer de secret.
    sourcemap: true,
    // Les pages étant chargées à la demande, aucun fichier ne devrait dépasser ce seuil.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Bibliothèques regroupées dans des fichiers stables : une mise à jour du site ne force pas
        // les visiteurs à retélécharger React ou le routeur. Le rendu HTML des e-mails
        // (react-dom/server) reste à part : seules les pages e-mails du back-office le chargent.
        codeSplitting: {
          groups: [
            // React d'abord : les autres groupes ne peuvent plus capturer ses modules.
            {
              name: 'react',
              test: /node_modules[\\/](react|scheduler)[\\/]|node_modules[\\/]react-dom[\\/](?!server|cjs[\\/]react-dom-server)/,
              priority: 40,
            },
            {
              name: 'email-renderer',
              test: /node_modules[\\/]react-dom[\\/](server|cjs[\\/]react-dom-server)/,
              priority: 30,
            },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 20 },
            { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
            { name: 'forms', test: /node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/, priority: 20 },
          ],
        },
      },
    },
  },
}));
