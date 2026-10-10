import { getSupabase } from './client';

/**
 * Mise à jour en temps réel du back-office : toute nouvelle demande, tout changement de
 * statut ou toute note ajoutée par un collègue est signalé sans recharger la page.
 * Les règles RLS s'appliquent aux événements diffusés : seule l'équipe les reçoit.
 */
export function subscribeToRequestChanges(onChange: () => void): () => void {
  const supabase = getSupabase();
  const channel = supabase
    .channel('back-office-demandes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_events' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'internal_notes' }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
