import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  articlesRepository,
  categoriesRepository,
  getErrorMessage,
  queryKeys,
  type ArticleDraft,
} from '@/api';
import { useToast } from '@/features/toasts/toast-context';

/**
 * Actions sur les articles et les catégories de l'Espace infos.
 * Les pages publiques (Espace infos, accueil) sont rafraîchies après chaque modification.
 */
export function useArticleActions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const refreshArticles = () => queryClient.invalidateQueries({ queryKey: queryKeys.articles });
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: queryKeys.categories });
  const onError = (error: Error) => toast.error(getErrorMessage(error));

  const save = useMutation({
    mutationFn: ({ draft, author }: { draft: ArticleDraft; author: string }) =>
      articlesRepository.save(draft, author),
    onSuccess: refreshArticles,
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => articlesRepository.remove(id),
    onSuccess: () => {
      toast.success('Article supprimé.');
      return refreshArticles();
    },
    onError,
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => categoriesRepository.create(name),
    onSuccess: (category) => {
      toast.success(`Catégorie « ${category.name} » ajoutée.`);
      return refreshCategories();
    },
    onError,
  });

  const toggleCategory = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      categoriesRepository.setActive(id, active),
    onSuccess: (category) => {
      toast.success(
        category.active
          ? `« ${category.name} » est visible dans l’Espace infos.`
          : `« ${category.name} » est masquée.`,
      );
      return refreshCategories();
    },
    onError,
  });

  return { save, remove, createCategory, toggleCategory };
}
