import { ROUTES } from '@/config/routes';
import type { InvitationResult } from '@/types';
import type { TeamRepository } from '../../contracts';
import { getSupabase } from '../client';
import type { Row } from '../database.types';
import { guard, unwrap } from '../errors';
import { invokeFunction } from '../functions';
import { toAdminUser } from '../mappers';

interface InvitationResponse {
  member: Row<'admin_users'>;
  emailSent: boolean;
  invitationLink: string | null;
}

/** Page où la personne invitée choisit son mot de passe (même écran que la réinitialisation). */
function invitationRedirect(): string {
  return `${window.location.origin}${ROUTES.admin.resetPassword}`;
}

function toInvitationResult(response: InvitationResponse): InvitationResult {
  return {
    user: toAdminUser(response.member),
    emailSent: response.emailSent,
    invitationLink: response.invitationLink,
  };
}

/**
 * Comptes de l'équipe (table « admin_users », comptes Supabase Auth).
 * L'invitation passe par l'Edge Function « equipe » (API d'administration d'Auth) ;
 * le rôle et l'activation sont modifiés directement, sous le contrôle des règles de la base
 * (administrateurs uniquement, impossible de retirer ses propres droits).
 */
export const teamRepository: TeamRepository = {
  async list() {
    const result = await guard(() => getSupabase().from('admin_users').select('*').order('created_at'));
    return unwrap(result).map(toAdminUser);
  },

  async invite(email, role) {
    const response = await invokeFunction<InvitationResponse>('equipe', {
      action: 'inviter',
      email,
      role,
      redirectTo: invitationRedirect(),
    });
    return toInvitationResult(response);
  },

  async resendInvitation(id) {
    const response = await invokeFunction<InvitationResponse>('equipe', {
      action: 'renvoyer-invitation',
      userId: id,
      redirectTo: invitationRedirect(),
    });
    return toInvitationResult(response);
  },

  async update(id, patch) {
    const result = await guard(() =>
      getSupabase()
        .from('admin_users')
        .update({ active: patch.active, role: patch.role })
        .eq('id', id)
        .select('*')
        .single(),
    );
    return toAdminUser(unwrap(result));
  },
};
