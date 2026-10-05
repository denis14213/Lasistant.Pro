import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, queryKeys, settingsRepository } from '@/api';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import type { SiteSettings } from '@/types';

/**
 * Enregistrement des réglages du site. Les pages publiques (pied de page, contact,
 * réservation…) lisent les mêmes réglages : la modification s'y voit immédiatement.
 */
export function useSaveSettings(successMessage = 'Modifications enregistrées.') {
  const session = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (patch: Partial<SiteSettings>) => settingsRepository.update(patch, session.name),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings, settings);
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
