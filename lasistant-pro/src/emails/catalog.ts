import type { CustomEmailTemplateKey, EmailTemplateKey, SystemEmailTemplateKey } from '@/types';

/**
 * Catalogue des modèles d'e-mails : clés et variables disponibles (module pur, sans React).
 * Les variables s'écrivent entre crochets (« [prénom] ») et sont remplacées à l'envoi
 * par les valeurs de la demande ou du compte concerné.
 */

/** Préfixe des réponses standards créées depuis le back-office. */
export const CUSTOM_TEMPLATE_PREFIX = 'reponse-';

/** Le modèle fait-il partie de ceux fournis avec le site ? */
export function isSystemTemplate(key: EmailTemplateKey): key is SystemEmailTemplateKey {
  return !key.startsWith(CUSTOM_TEMPLATE_PREFIX);
}

/** Clé d'une nouvelle réponse standard. */
export function customTemplateKey(id: string): CustomEmailTemplateKey {
  return `${CUSTOM_TEMPLATE_PREFIX}${id}`;
}

/** Variables communes aux e-mails liés à une demande. */
export const REQUEST_VARIABLES = [
  'prénom',
  'nom',
  'référence',
  'service',
  'date',
  'heure',
  'contact_préféré',
] as const;

/** Variables proposées dans l'éditeur pour un modèle donné. */
export function variablesFor(key: EmailTemplateKey): readonly string[] {
  switch (key) {
    case 'notification-equipe':
      return [...REQUEST_VARIABLES, 'reçue_le', 'origine'];
    case 'rendez-vous-confirme':
      return [...REQUEST_VARIABLES, 'jour'];
    case 'reinitialisation-mot-de-passe':
      return ['prénom'];
    case 'invitation-utilisateur':
      return ['invitant', 'rôle'];
    default:
      return REQUEST_VARIABLES;
  }
}
