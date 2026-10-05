import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/permissions';
import { fillTemplate } from '@/lib/text';
import type { AdminRole } from '@/types';
import { EmailBody } from '../EmailBody';
import { EmailLayout, TeamEmailFooter } from '../EmailLayout';
import { EmailButton, EmailNote, EmailPending, EmailSmallPrint, EmailTitle } from '../EmailParts';
import { EMAIL_COLORS as c } from '../email-theme';
import type { EmailComponentProps } from '../types';

/** Couleurs de la pastille de rôle (reprises des badges du back-office). */
const ROLE_PILL: Record<AdminRole, { background: string; color: string }> = {
  administrateur: { background: c.brandSoft, color: c.brandDark },
  editeur: { background: c.infoSoft, color: c.infoDark },
  operateur: { background: c.neutralSoft, color: c.neutral },
};

/** Invitation d'un nouveau membre de l'équipe (maquette « Invitation d'un utilisateur »). */
export function InvitationEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { member, siteUrl } = context;
  return (
    <EmailLayout
      envelope={envelope}
      variant="brand"
      siteUrl={siteUrl}
      footer={
        <TeamEmailFooter>
          Vous n’attendiez pas cette invitation ? Ignorez simplement cet e-mail.
        </TeamEmailFooter>
      }
    >
      <EmailTitle size="md">{fillTemplate(content.heading, values)}</EmailTitle>
      <EmailBody source={content.body} values={values} siteUrl={siteUrl} buttonShape="rounded" />
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          border: `1px solid ${c.line}`,
          borderRadius: 14,
          borderCollapse: 'separate',
          margin: '4px 0 22px',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{ padding: '16px 0 16px 18px', width: 1, whiteSpace: 'nowrap', verticalAlign: 'middle' }}
            >
              <span
                style={{
                  ...ROLE_PILL[member.role],
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '5px 12px',
                  borderRadius: 999,
                }}
              >
                {ROLE_LABELS[member.role]}
              </span>
            </td>
            <td
              style={{ padding: '16px 18px 16px 14px', color: c.text, fontSize: 14, verticalAlign: 'middle' }}
            >
              {ROLE_DESCRIPTIONS[member.role]}
            </td>
          </tr>
        </tbody>
      </table>
      <EmailButton href={member.actionUrl} shape="rounded">
        Activer mon compte
      </EmailButton>
      <EmailSmallPrint spacing={10}>
        Vous choisirez votre mot de passe puis configurerez la double authentification. Cette invitation
        expire dans 7 jours <EmailPending>durée à valider</EmailPending>.
      </EmailSmallPrint>
      <EmailNote tone="mist">
        Vous aurez accès à des données personnelles de demandeurs : elles sont strictement confidentielles et
        ne doivent jamais être partagées en dehors de l’équipe.
      </EmailNote>
    </EmailLayout>
  );
}
