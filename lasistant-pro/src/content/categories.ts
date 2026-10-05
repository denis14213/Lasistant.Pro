import type { Category } from '@/types';

/** Catégories de l'Espace infos. */
export function createCategoriesSeed(): Category[] {
  return [
    {
      id: 'assistance-medicale',
      name: 'Assistance médicale',
      slug: 'assistance-medicale',
      description: 'Préparer un séjour médical et comprendre notre accompagnement.',
      active: true,
      sortOrder: 1,
      tone: 'brand',
    },
    {
      id: 'logement',
      name: 'Logement',
      slug: 'logement',
      description: 'Conseils pour trouver un logement adapté en Tunisie.',
      active: true,
      sortOrder: 2,
      tone: 'success',
    },
    {
      id: 'accompagnement',
      name: 'Accompagnement',
      slug: 'accompagnement',
      description: 'Accompagner un proche âgé ou malade pendant son séjour.',
      active: true,
      sortOrder: 3,
      tone: 'neutral',
    },
    {
      id: 'conseils-pratiques',
      name: 'Conseils pratiques',
      slug: 'conseils-pratiques',
      description: 'Voyage, arrivée, démarches : l’essentiel à savoir.',
      active: true,
      sortOrder: 4,
      tone: 'gold',
    },
    {
      id: 'actualites',
      name: 'Actualités',
      slug: 'actualites',
      description: 'Les nouvelles de LASISTANT.PRO.',
      active: false,
      sortOrder: 5,
      tone: 'neutral',
    },
  ];
}
