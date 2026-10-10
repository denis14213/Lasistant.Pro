import type { ComponentType } from 'react';
import { activeEntries } from '@/features/settings/useSiteSettings';
import { fillTemplate } from '@/lib/text';
import type { EmailTemplateKey, SiteSettings, SystemEmailTemplateKey } from '@/types';
import { isSystemTemplate } from './catalog';
import type { EmailEnvelope } from './EmailLayout';
import { AppointmentConfirmedEmail } from './templates/AppointmentConfirmedEmail';
import { InvitationEmail } from './templates/InvitationEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { RequesterConfirmationEmail } from './templates/RequesterConfirmationEmail';
import { StandardReplyEmail } from './templates/StandardReplyEmail';
import { TeamNotificationEmail } from './templates/TeamNotificationEmail';
import type { EmailComponentProps, EmailContent, EmailContext } from './types';

/**
 * Registre des e-mails : pour chaque modèle, son gabarit, son adresse d'envoi et son destinataire.
 * En phase 2, le service d'envoi (fonction serveur) rendra ces mêmes gabarits en HTML.
 */

interface EmailDefinition {
  Component: ComponentType<EmailComponentProps>;
  /** Adresse d'envoi : domaine vérifié auprès du service d'envoi */
  fromAddress: string;
  recipient: (context: EmailContext) => string;
}

const NOTIFICATIONS_ADDRESS = 'notifications@adbm-school.com';
const SECURITY_ADDRESS = 'securite@adbm-school.com';

const toRequester = (context: EmailContext) => context.booking.email;
const toMember = (context: EmailContext) => context.member.email;

/** Adresses qui reçoivent les nouvelles demandes (Coordonnées & réglages). */
function notificationRecipients(settings: SiteSettings): string[] {
  const recipients = activeEntries(settings.emails).filter((entry) => entry.receivesNotifications);
  return (recipients.length > 0 ? recipients : activeEntries(settings.emails).slice(0, 1)).map(
    (entry) => entry.value,
  );
}

const STANDARD_REPLY: EmailDefinition = {
  Component: StandardReplyEmail,
  fromAddress: NOTIFICATIONS_ADDRESS,
  recipient: toRequester,
};

const DEFINITIONS: Record<SystemEmailTemplateKey, EmailDefinition> = {
  'confirmation-demandeur': {
    Component: RequesterConfirmationEmail,
    fromAddress: NOTIFICATIONS_ADDRESS,
    recipient: toRequester,
  },
  'notification-equipe': {
    Component: TeamNotificationEmail,
    fromAddress: NOTIFICATIONS_ADDRESS,
    recipient: (context) => notificationRecipients(context.settings).join(', '),
  },
  'rendez-vous-confirme': {
    Component: AppointmentConfirmedEmail,
    fromAddress: NOTIFICATIONS_ADDRESS,
    recipient: toRequester,
  },
  'reinitialisation-mot-de-passe': {
    Component: PasswordResetEmail,
    fromAddress: SECURITY_ADDRESS,
    recipient: toMember,
  },
  'invitation-utilisateur': {
    Component: InvitationEmail,
    fromAddress: NOTIFICATIONS_ADDRESS,
    recipient: toMember,
  },
  'proposition-creneau': STANDARD_REPLY,
  'informations-complementaires': STANDARD_REPLY,
};

/** Définition d'un modèle ; les réponses ajoutées par l'équipe utilisent la mise en page standard. */
export function emailDefinition(key: EmailTemplateKey): EmailDefinition {
  return isSystemTemplate(key) ? DEFINITIONS[key] : STANDARD_REPLY;
}

/** En-têtes de l'e-mail (expéditeur, destinataire, objet aux variables remplacées). */
export function emailEnvelope(
  content: EmailContent,
  values: Record<string, string>,
  context: EmailContext,
): EmailEnvelope {
  const definition = emailDefinition(content.key);
  return {
    from: `${content.senderName} <${definition.fromAddress}>`,
    to: definition.recipient(context),
    subject: fillTemplate(content.subject, values),
  };
}
