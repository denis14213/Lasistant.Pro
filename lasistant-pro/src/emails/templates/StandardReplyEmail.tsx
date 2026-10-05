import { addressLine, primaryEmail } from '@/features/settings/useSiteSettings';
import { fillTemplate } from '@/lib/text';
import { EmailBody } from '../EmailBody';
import { EmailLayout, PublicEmailFooter } from '../EmailLayout';
import { EmailTitle } from '../EmailParts';
import type { EmailComponentProps } from '../types';

/** Réponse standard au demandeur (proposition de créneau, précisions…) : le texte du modèle seul. */
export function StandardReplyEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { settings, siteUrl } = context;
  const heading = fillTemplate(content.heading, values).trim();
  return (
    <EmailLayout
      envelope={envelope}
      variant="brand"
      siteUrl={siteUrl}
      footer={
        <PublicEmailFooter address={addressLine(settings)} email={primaryEmail(settings)} siteUrl={siteUrl} />
      }
    >
      {heading ? <EmailTitle size="md">{heading}</EmailTitle> : null}
      <EmailBody source={content.body} values={values} siteUrl={siteUrl} />
    </EmailLayout>
  );
}
