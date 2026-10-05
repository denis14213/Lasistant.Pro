import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Configuration ESLint (format « flat ») : JavaScript, TypeScript et règles React
 * (règles des hooks, règles du compilateur React, rechargement à chaud de Vite).
 */
export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      // Les modules de route exportent aussi leur chargeur et leurs métadonnées.
      reactRefresh.configs.vite({ allowExportNames: ['loader', 'handle'] }),
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      // Les espaces insécables font partie de la typographie française des contenus.
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipJSXText: true }],
      // Système d'icônes unique (docs/icones.md) : on passe toujours par « @/components/ui/icons ».
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lucide-react', message: 'Utiliser le système d’icônes : @/components/ui/icons.' },
            {
              name: '@phosphor-icons/react',
              message: 'Utiliser le système d’icônes : @/components/ui/icons.',
            },
          ],
          patterns: [
            {
              group: ['@phosphor-icons/*'],
              message: 'Utiliser le système d’icônes : @/components/ui/icons.',
            },
          ],
        },
      ],
    },
  },
  {
    // Les modules du système d'icônes sont les seuls autorisés à importer la bibliothèque. Leurs exports
    // sont des composants créés par une fonction (defineIcon), que la règle du rechargement à chaud ne
    // sait pas reconnaître : de simples dessins sans état, sans enjeu pour Fast Refresh.
    files: [
      'src/components/ui/icon-factory.tsx',
      'src/components/ui/icons.tsx',
      'src/components/ui/icons-admin.tsx',
    ],
    rules: {
      'no-restricted-imports': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Les tests peuvent exporter des utilitaires et utiliser les globales de Vitest.
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
]);
