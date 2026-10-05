import { CONTACT_PREFERENCE_PHRASES } from '@/content/labels';
import { ROUTES } from '@/config/routes';
import { activeEntries, addressLine, primaryEmail } from '@/features/settings/useSiteSettings';
import { fromISODate } from '@/lib/dates';
import { capitalize, fillTemplate } from '@/lib/text';
import { EmailBody } from '../EmailBody';
import { EmailLayout, EmailPhones, PublicEmailFooter } from '../EmailLayout';
import {
  EmailActions,
  EmailBullets,
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailNote,
  EmailPending,
  EmailSignature,
  EmailTitle,
} from '../EmailParts';
import { EMAIL_COLORS as c } from '../email-theme';
import type { EmailComponentProps } from '../types';

/** Heure de fin d'un créneau : « 10:00 » + 60 min → « 11:00 ». */
function endTime(start: string, minutes: number): string {
  const [hours = 0, mins = 0] = start.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Rendez-vous confirmé par l'équipe (maquette « Rendez-vous confirmé »). */
export function AppointmentConfirmedEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { booking, settings, siteUrl } = context;
  const phones = activeEntries(settings.phones).map((entry) => entry.value);
  const date = booking.requestedDate ? fromISODate(booking.requestedDate) : null;
  const part = (options: Intl.DateTimeFormatOptions) =>
    date ? capitalize(new Intl.DateTimeFormat('fr-FR', options).format(date)) : '';
  const time = booking.requestedTime
    ? `${booking.requestedTime} – ${endTime(booking.requestedTime, settings.booking.durationMinutes)}`
    : 'Horaire à convenir';
  const channel = CONTACT_PREFERENCE_PHRASES[booking.contactPreference ?? 'telephone'];
  const changeLink = `mailto:${content.replyTo}?subject=${encodeURIComponent(`Rendez-vous ${booking.reference}`)}`;

  return (
    <EmailLayout
      envelope={envelope}
      variant="brand"
      siteUrl={siteUrl}
      footer={
        <PublicEmailFooter address={addressLine(settings)} email={primaryEmail(settings)} siteUrl={siteUrl} />
      }
    >
      <EmailEyebrow>Rendez-vous confirmé</EmailEyebrow>
      <EmailTitle>{fillTemplate(content.heading, values)}</EmailTitle>
      <EmailBody source={content.body} values={values} siteUrl={siteUrl} />

      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ margin: '28px 0 0', background: c.plum, borderRadius: 16, color: c.white }}
      >
        <tbody>
          <tr>
            {date ? (
              <td style={{ width: 76, padding: '24px 0 24px 26px', verticalAlign: 'middle' }}>
                <div
                  style={{
                    width: 76,
                    borderRadius: 14,
                    background: c.white,
                    color: c.ink,
                    textAlign: 'center',
                    padding: '10px 0',
                    lineHeight: 1.15,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: c.brand,
                    }}
                  >
                    {part({ month: 'short' })}
                  </span>
                  <span style={{ display: 'block', fontSize: 32, fontWeight: 700, letterSpacing: '-.03em' }}>
                    {date.getDate()}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: c.muted }}>
                    {part({ weekday: 'short' }).toLowerCase()}
                  </span>
                </div>
              </td>
            ) : null}
            <td style={{ padding: '24px 26px 24px 20px', verticalAlign: 'middle' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{time}</p>
              <p style={{ margin: '4px 0 0', color: c.onPlum }}>Heure de Tunisie (UTC+1) · {channel}</p>
              <p style={{ margin: '4px 0 0', color: c.onPlum }}>
                {values.service} · réf. {booking.reference}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <EmailActions>
        <EmailButton
          href={`${siteUrl}${ROUTES.bookingConfirmation}?ref=${encodeURIComponent(booking.reference)}`}
        >
          Ajouter à mon agenda
        </EmailButton>
        <EmailButton href={changeLink} variant="outline">
          Modifier ou annuler
        </EmailButton>
      </EmailActions>

      <EmailHeading>Pour préparer notre échange</EmailHeading>
      <EmailBullets
        items={[
          'Vos dates de séjour envisagées',
          'Vos besoins de logement et d’accompagnement',
          'Vos questions pratiques',
        ]}
      />

      <EmailNote>
        Modification ou annulation : merci de nous prévenir le plus tôt possible.{' '}
        <EmailPending>conditions à valider</EmailPending>
      </EmailNote>

      <div style={{ margin: '28px 0 0', fontSize: 14.5, color: c.text }}>
        <p style={{ margin: 0 }}>
          Une question ? <EmailPhones phones={phones} />
        </p>
        <EmailSignature />
      </div>
    </EmailLayout>
  );
}
