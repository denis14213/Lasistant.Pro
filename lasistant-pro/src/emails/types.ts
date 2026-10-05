import type { AdminRole, Booking, EmailTemplate, SiteSettings } from '@/types';
import type { EmailEnvelope } from './EmailLayout';

/** Textes modifiables d'un modèle (version enregistrée ou brouillon de l'éditeur). */
export type EmailContent = Pick<
  EmailTemplate,
  'key' | 'subject' | 'heading' | 'body' | 'senderName' | 'replyTo'
>;

/** Membre de l'équipe concerné par un e-mail interne (mot de passe, invitation). */
export interface EmailMember {
  email: string;
  role: AdminRole;
  /** Horodatage de la demande à l'origine de l'e-mail */
  requestedAt: string;
  /** Lien d'action (réinitialisation, activation du compte) */
  actionUrl: string;
}

/** Données dont dépend la mise en page : réglages du site, demande ou compte concerné. */
export interface EmailContext {
  siteUrl: string;
  settings: SiteSettings;
  booking: Booking;
  member: EmailMember;
}

export interface EmailComponentProps {
  envelope?: EmailEnvelope;
  content: EmailContent;
  /** Valeurs des variables (« prénom » → « Awa ») */
  values: Record<string, string>;
  context: EmailContext;
}
