import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsRepository, queryKeys } from '@/api';
import { trackConversion, type ConversionName } from '@/lib/analytics';
import type { Booking, BookingInput } from '@/types';

interface SubmissionVariables {
  input: BookingInput;
  /** Valeur du champ piège : remplie uniquement par les robots */
  honeypot?: string;
}

/**
 * Envoi d'une demande publique.
 * - un envoi de robot (champ piège rempli) est ignoré sans le signaler ;
 * - après succès, les vues du back-office sont rafraîchies et la conversion comptabilisée ;
 * - en cas d'échec, l'erreur est exposée telle quelle (hors connexion, trop d'envois…).
 */
export function useRequestSubmission(conversion: ConversionName) {
  const queryClient = useQueryClient();
  return useMutation<Booking | null, Error, SubmissionVariables>({
    mutationFn: async ({ input, honeypot }) => {
      if (honeypot && honeypot.trim() !== '') return null;
      return bookingsRepository.create(input);
    },
    onSuccess: async (booking) => {
      if (!booking) return;
      trackConversion(conversion);
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}
