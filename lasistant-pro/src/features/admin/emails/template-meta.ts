import { IconCalendar, IconKey, type AppIcon } from '@/components/ui/icons';
import {
  IconCalendarConfirmed,
  IconConfirmation,
  IconMessage,
  IconQuestion,
  IconReminder,
  IconUserAdd,
} from '@/components/ui/icons-admin';
import { isSystemTemplate } from '@/emails/catalog';
import type { EmailTemplateKey, SystemEmailTemplateKey } from '@/types';

/**
 * Présentation des modèles dans le back-office : icône, rôle du modèle et contraintes.
 */
export interface TemplateMeta {
  icon: AppIcon;
  /** À quoi sert le modèle et quand il part */
  description: string;
  /** Modèle indispensable au fonctionnement des comptes : il ne peut pas être désactivé */
  required: boolean;
}

const REPLY_DESCRIPTION = 'Réponse proposée dans la fiche d’une demande, modifiable avant l’envoi';

const META: Record<SystemEmailTemplateKey, TemplateMeta> = {
  'confirmation-demandeur': {
    icon: IconConfirmation,
    description: 'Envoyé automatiquement après l’envoi d’un formulaire du site',
    required: false,
  },
  'notification-equipe': {
    icon: IconReminder,
    description: 'Envoyé aux adresses de notification à chaque nouvelle demande',
    required: false,
  },
  'rendez-vous-confirme': {
    icon: IconCalendarConfirmed,
    description: 'Envoyé au demandeur quand sa demande passe au statut « Confirmé »',
    required: false,
  },
  'reinitialisation-mot-de-passe': {
    icon: IconKey,
    description: 'Envoyé quand un membre de l’équipe demande un nouveau mot de passe',
    required: true,
  },
  'invitation-utilisateur': {
    icon: IconUserAdd,
    description: 'Envoyé à la personne invitée depuis « Utilisateurs & rôles »',
    required: true,
  },
  'proposition-creneau': { icon: IconCalendar, description: REPLY_DESCRIPTION, required: false },
  'informations-complementaires': {
    icon: IconQuestion,
    description: REPLY_DESCRIPTION,
    required: false,
  },
};

const CUSTOM_META: TemplateMeta = {
  icon: IconMessage,
  description: 'Réponse standard ajoutée par l’équipe, proposée dans la fiche des demandes',
  required: false,
};

export function templateMeta(key: EmailTemplateKey): TemplateMeta {
  return isSystemTemplate(key) ? META[key] : CUSTOM_META;
}
