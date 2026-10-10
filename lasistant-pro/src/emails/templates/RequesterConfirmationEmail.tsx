import { confirmationPath } from '@/config/routes';
import { activeEntries, addressLine, primaryEmail } from '@/features/settings/useSiteSettings';
import { formatDuration, formatLongDate } from '@/lib/format';
import { capitalize, fillTemplate } from '@/lib/text';
import { EmailBody } from '../EmailBody';
import { EmailLayout, EmailPhones, PublicEmailFooter } from '../EmailLayout';
import {
  EmailActions,
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailNote,
  EmailSignature,
  EmailSteps,
  EmailSummary,
  EmailTitle,
} from '../EmailParts';
import { EMAIL_COLORS as c } from '../email-theme';
import type { EmailComponentProps } from '../types';

/** Confirmation envoyée au demandeur après chaque demande (maquette « E-mail de confirmation »). */
export function RequesterConfirmationEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { booking, settings, siteUrl } = context;
  const phones = activeEntries(settings.phones).map((entry) => entry.value);
  const slot = booking.requestedDate
    ? `${capitalize(formatLongDate(booking.requestedDate))}${booking.requestedTime ? ` · ${booking.requestedTime}` : ''}`
    : 'À convenir avec vous';

  return (
    <EmailLayout
      envelope={envelope}
      variant="brand"
      siteUrl={siteUrl}
      footer={
        <PublicEmailFooter address={addressLine(settings)} email={primaryEmail(settings)} siteUrl={siteUrl} />
      }
    >
      <EmailEyebrow>Demande enregistrée</EmailEyebrow>
      <EmailTitle>{fillTemplate(content.heading, values)}</EmailTitle>
      <EmailBody source={content.body} values={values} siteUrl={siteUrl} />

      <EmailSummary
        rows={[
          { label: 'N° de demande', value: booking.reference, mono: true },
          { label: 'Service', value: values.service },
          { label: 'Date souhaitée', value: slot },
          ...(booking.requestedDate
            ? [
                {
                  label: 'Durée',
                  value: `${formatDuration(settings.booking.durationMinutes)} · heure de Tunisie (UTC+1)`,
                },
              ]
            : []),
          { label: 'Contact préféré', value: capitalize(values.contact_préféré ?? '') },
        ]}
      />

      <EmailActions>
        {booking.requestedDate ? (
          <EmailButton href={`${siteUrl}${confirmationPath(booking)}`}>Ajouter à mon agenda</EmailButton>
        ) : null}
        <EmailButton href={siteUrl} variant="outline">
          Visiter le site
        </EmailButton>
      </EmailActions>

      <EmailHeading>Les prochaines étapes</EmailHeading>
      <EmailSteps
        steps={[
          'Nous examinons votre demande.',
          'Un conseiller vous contacte pour confirmer le créneau.',
          'Nous préparons ensemble la suite de votre accompagnement.',
        ]}
      />

      <EmailNote>
        Pour protéger vos données, merci de ne pas nous transmettre d’informations médicales détaillées par
        e-mail. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé.
      </EmailNote>

      <div style={{ margin: '28px 0 0', fontSize: 14.5, color: c.text }}>
        <p style={{ margin: '0 0 8px' }}>
          Une question ou une modification ? Répondez simplement à cet e-mail ou appelez-nous :
        </p>
        <p style={{ margin: 0 }}>
          <EmailPhones phones={phones} />
        </p>
        <EmailSignature />
      </div>
    </EmailLayout>
  );
}
