import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// Configuration des tests : on réutilise la configuration Vite (alias, plugins).
// Les règles métier s'exécutent dans Node (rapide) ; les tests d'interface déclarent
// « @vitest-environment jsdom » en tête de fichier.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
    },
  }),
);
