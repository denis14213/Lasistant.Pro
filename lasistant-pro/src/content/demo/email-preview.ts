import { ROUTES } from '@/config/routes';
import type { EmailMember } from '@/emails/types';
import type { Booking } from '@/types';

/**
 * Données d'exemple des aperçus d'e-mails (reprises des maquettes).
 * Fictives : aucun aperçu n'affiche les données d'un vrai demandeur.
 */

export const PREVIEW_BOOKING: Booking = {
  id: 'exemple',
  reference: 'LP-2026-0148',
  source: 'reservation',
  serviceId: 'assistance-medicale',
  subject: null,
  fullName: 'Awa Koné',
  email: 'awa.kone@exemple.com',
  phone: '+225 01 23 45 67 89',
  country: 'Côte d’Ivoire',
  profile: 'patient',
  requestedDate: '2026-10-14',
  requestedTime: '10:00',
  contactPreference: 'telephone',
  arrivalDate: null,
  stayDuration: null,
  message:
    'Bonjour, je souhaite poursuivre un traitement en Tunisie et j’aurais besoin d’aide pour organiser mon séjour et trouver un logement pour moi et ma fille. Pouvez-vous me rappeler en fin de matinée ?',
  housing: null,
  attachmentName: null,
  status: 'nouveau',
  assigneeId: null,
  consentAt: '2026-10-02T08:42:00.000Z',
  createdAt: '2026-10-02T08:42:00.000Z',
  updatedAt: '2026-10-02T08:42:00.000Z',
};

/** Membre de l'équipe des aperçus « mot de passe » et « invitation ». */
export function previewMember(siteUrl: string, kind: 'reinitialisation' | 'invitation'): EmailMember {
  return kind === 'reinitialisation'
    ? {
        email: 'prenom.nom@lasistant.pro',
        role: 'operateur',
        requestedAt: '2026-10-02T10:05:00.000Z',
        actionUrl: `${siteUrl}${ROUTES.admin.resetPassword}?jeton=••••••••`,
      }
    : {
        email: 'operateur2@lasistant.pro',
        role: 'operateur',
        requestedAt: '2026-10-02T10:05:00.000Z',
        actionUrl: `${siteUrl}${ROUTES.admin.resetPassword}?invitation=••••••••`,
      };
}

export const PREVIEW_MEMBER_NAME = 'Prénom Nom';
export const PREVIEW_INVITER_NAME = 'Admin LASISTANT';
