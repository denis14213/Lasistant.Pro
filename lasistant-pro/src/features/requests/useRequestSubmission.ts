import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsRepository, queryKeys } from '@/api';
import { trackConversion, type ConversionName } from '@/lib/analytics';
import type { Booking, BookingInput } from '@/types';

interface SubmissionVariables {
  input: BookingInput;
  /** Valeur du champ piège : remplie uniquement par les robots */
  honeypot?: string;
  /** Pièce jointe, déposée dans le stockage privé avant l'envoi de la demande */
  attachment?: File | null;
}

/**
 * Envoi d'une demande publique.
 * - un envoi de robot (champ piège rempli) est ignoré sans le signaler ;
 * - la pièce jointe éventuelle est d'abord déposée dans le stockage privé ;
 * - après succès, les vues du back-office sont rafraîchies et la conversion comptabilisée ;
 * - en cas d'échec, l'erreur est exposée telle quelle (hors connexion, trop d'envois…).
 */
export function useRequestSubmission(conversion: ConversionName) {
  const queryClient = useQueryClient();
  return useMutation<Booking | null, Error, SubmissionVariables>({
    mutationFn: async ({ input, honeypot, attachment }) => {
      if (honeypot && honeypot.trim() !== '') return null;
      const attachmentPath = attachment ? await bookingsRepository.uploadAttachment(attachment) : null;
      return bookingsRepository.create({ ...input, attachmentPath });
    },
    onSuccess: async (booking) => {
      if (!booking) return;
      trackConversion(conversion);
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}
