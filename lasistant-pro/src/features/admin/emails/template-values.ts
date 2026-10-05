import { CONTACT_PREFERENCE_PHRASES, SOURCE_PHRASES } from '@/content/labels';
import { formatLongDate, formatLongDateTime, formatWeekday } from '@/lib/format';
import { ROLE_LABELS } from '@/lib/permissions';
import type { AdminRole, Booking, Service } from '@/types';
import { requestTopic } from '../requests/request-topic';

/**
 * Valeurs des variables des modèles d'e-mails (« [prénom] », « [référence] »…).
 * Voir `emails/catalog.ts` pour la liste proposée par modèle.
 */

/** Variables d'un e-mail lié à une demande. */
export function templateValues(booking: Booking, services: Service[]): Record<string, string> {
  const [firstName = booking.fullName] = booking.fullName.split(' ');
  return {
    prénom: firstName,
    nom: booking.fullName,
    référence: booking.reference,
    service: requestTopic(booking, services),
    date: booking.requestedDate ? formatLongDate(booking.requestedDate) : 'à convenir',
    jour: booking.requestedDate ? formatWeekday(booking.requestedDate) : 'très bientôt',
    heure: booking.requestedTime ?? 'à convenir',
    contact_préféré: CONTACT_PREFERENCE_PHRASES[booking.contactPreference ?? 'email'],
    reçue_le: formatLongDateTime(booking.createdAt),
    origine: SOURCE_PHRASES[booking.source],
  };
}

/** Variables des e-mails adressés à un membre de l'équipe (invitation, mot de passe). */
export function teamTemplateValues({
  name,
  inviterName,
  role,
}: {
  name: string;
  inviterName: string;
  role: AdminRole;
}): Record<string, string> {
  const [firstName = name] = name.split(' ');
  return { prénom: firstName, invitant: inviterName, rôle: ROLE_LABELS[role] };
}
