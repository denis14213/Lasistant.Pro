import {
  PREVIEW_BOOKING,
  PREVIEW_INVITER_NAME,
  PREVIEW_MEMBER_NAME,
  previewMember,
} from '@/content/demo/email-preview';
import type { EmailContext } from '@/emails/types';
import type { EmailTemplateKey, Service, SiteSettings } from '@/types';
import { teamTemplateValues, templateValues } from './template-values';

/**
 * Données d'exemple d'un aperçu : la mise en page et les variables sont celles
 * d'un envoi réel, appliquées à une demande et à un compte fictifs.
 */
export function previewData(
  key: EmailTemplateKey,
  settings: SiteSettings,
  services: Service[],
  siteUrl: string,
) {
  const isTeamAccountEmail = key === 'reinitialisation-mot-de-passe' || key === 'invitation-utilisateur';
  const member = previewMember(
    siteUrl,
    key === 'reinitialisation-mot-de-passe' ? 'reinitialisation' : 'invitation',
  );
  const context: EmailContext = { siteUrl, settings, booking: PREVIEW_BOOKING, member };
  const values = isTeamAccountEmail
    ? teamTemplateValues({ name: PREVIEW_MEMBER_NAME, inviterName: PREVIEW_INVITER_NAME, role: member.role })
    : templateValues(PREVIEW_BOOKING, services);
  return { context, values };
}
