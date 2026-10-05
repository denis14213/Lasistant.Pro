/**
 * Modèles d'e-mails (réponses standards configurables, cahier des charges § 7.3).
 */

/** Modèles fournis avec le site : leur mise en page est propre à chacun. */
export type SystemEmailTemplateKey =
  | 'confirmation-demandeur'
  | 'notification-equipe'
  | 'rendez-vous-confirme'
  | 'reinitialisation-mot-de-passe'
  | 'invitation-utilisateur'
  | 'proposition-creneau'
  | 'informations-complementaires';

/** Réponses standards créées par l'équipe depuis le back-office. */
export type CustomEmailTemplateKey = `reponse-${string}`;

export type EmailTemplateKey = SystemEmailTemplateKey | CustomEmailTemplateKey;

export interface EmailTemplate {
  id: string;
  key: EmailTemplateKey;
  name: string;
  /** Événement déclencheur (« Après chaque demande », « Envoi manuel »…) */
  trigger: string;
  kind: 'automatique' | 'manuel';
  audience: 'demandeur' | 'equipe';
  subject: string;
  /** Titre affiché en tête de l'e-mail (inutilisé par les réponses envoyées depuis la messagerie) */
  heading: string;
  /** Corps du message ; les variables s'écrivent entre crochets : [prénom] */
  body: string;
  senderName: string;
  replyTo: string;
  active: boolean;
  updatedAt: string;
}
