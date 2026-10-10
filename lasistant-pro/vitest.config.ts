import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// Les tests utilisent toujours la base simulée, jamais la base de production :
// la variable est fixée avant la lecture de la configuration Vite (choix de la source).
process.env.VITE_DATA_SOURCE = 'mock';

// Configuration des tests : on réutilise la configuration Vite (alias, plugins).
// Les règles métier s'exécutent dans Node (rapide) ; les tests d'interface déclarent
// « @vitest-environment jsdom » en tête de fichier.
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        environment: 'node',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}', 'worker/**/*.test.ts'],
        css: false,
        restoreMocks: true,
        env: { VITE_DATA_SOURCE: 'mock' },
      },
    }),
  ),
);
