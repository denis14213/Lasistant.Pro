import { formatShortDateTime } from '@/lib/format';
import { fillTemplate } from '@/lib/text';
import { EmailBody } from '../EmailBody';
import { EmailLayout, TeamEmailFooter } from '../EmailLayout';
import { EmailButton, EmailNote, EmailTitle } from '../EmailParts';
import { EMAIL_COLORS as c } from '../email-theme';
import type { EmailComponentProps } from '../types';

/** Lien de réinitialisation du mot de passe (maquette « Réinitialisation du mot de passe »). */
export function PasswordResetEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { member, siteUrl } = context;
  return (
    <EmailLayout
      envelope={envelope}
      variant="team"
      siteUrl={siteUrl}
      footer={
        <TeamEmailFooter>
          Demande effectuée le {formatShortDateTime(member.requestedAt)} depuis un ordinateur en Tunisie.
        </TeamEmailFooter>
      }
    >
      <EmailTitle size="md">{fillTemplate(content.heading, values)}</EmailTitle>
      <EmailBody source={content.body} values={values} siteUrl={siteUrl} buttonShape="rounded" />
      <p style={{ margin: '8px 0 0' }}>
        <EmailButton href={member.actionUrl} shape="rounded">
          Réinitialiser mon mot de passe
        </EmailButton>
      </p>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: c.muted }}>
        Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
        <br />
        <span style={{ fontFamily: 'Consolas, monospace', color: c.ink, wordBreak: 'break-all' }}>
          {member.actionUrl}
        </span>
      </p>
      <EmailNote tone="danger">
        <strong>Vous n’êtes pas à l’origine de cette demande ?</strong> Ignorez cet e-mail : votre mot de
        passe actuel reste inchangé. Prévenez un administrateur si cela se reproduit.
      </EmailNote>
    </EmailLayout>
  );
}
