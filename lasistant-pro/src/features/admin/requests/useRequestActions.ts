import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsRepository, getErrorMessage, queryKeys } from '@/api';
import { BOOKING_STATUS_LABELS } from '@/content/labels';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import type { BookingInput, BookingStatus } from '@/types';

/**
 * Actions de traitement des demandes (statut, assignation, notes, réponses).
 * Chaque action est tracée dans l'historique au nom de l'utilisateur connecté,
 * puis toutes les vues liées aux demandes sont rafraîchies.
 */
export function useRequestActions() {
  const session = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
  const onError = (error: Error) => toast.error(getErrorMessage(error));

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsRepository.updateStatus(id, status, session.name),
    onSuccess: (booking) => {
      toast.success(`Statut mis à jour : ${BOOKING_STATUS_LABELS[booking.status]}.`);
      return refresh();
    },
    onError,
  });

  const assign = useMutation({
    mutationFn: ({ id, assignee }: { id: string; assignee: { id: string; name: string } | null }) =>
      bookingsRepository.assign(id, assignee, session.name),
    onSuccess: (_booking, { assignee }) => {
      toast.success(assignee ? `Demande assignée à ${assignee.name}.` : 'Demande désassignée.');
      return refresh();
    },
    onError,
  });

  const addNote = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      bookingsRepository.addNote(id, text, session.name),
    onSuccess: () => {
      toast.success('Note interne ajoutée.');
      return refresh();
    },
    onError,
  });

  const logReply = useMutation({
    mutationFn: ({ id, subject, recipient }: { id: string; subject: string; recipient: string }) =>
      bookingsRepository.logReply(id, subject, recipient, session.name),
    onSuccess: () => {
      toast.success('E-mail envoyé et ajouté à l’historique.');
      return refresh();
    },
    onError,
  });

  const createFromTeam = useMutation({
    mutationFn: ({ input, status }: { input: BookingInput; status?: BookingStatus }) =>
      bookingsRepository.createFromTeam(input, session.name, status),
    onSuccess: (booking) => {
      toast.success(`Demande ${booking.reference} enregistrée.`);
      return refresh();
    },
    onError,
  });

  return {
    updateStatus,
    assign,
    addNote,
    logReply,
    createFromTeam,
    actor: { id: session.userId, name: session.name },
  };
}
