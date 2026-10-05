import { CONTACT_PREFERENCE_LABELS, PROFILE_LABELS } from '@/content/labels';
import { ROUTES } from '@/config/routes';
import { formatCompactDate, formatDuration, phoneHref } from '@/lib/format';
import { capitalize, fillTemplate, truncate } from '@/lib/text';
import { EmailBody } from '../EmailBody';
import { EmailLayout, TeamEmailFooter } from '../EmailLayout';
import {
  EmailActions,
  EmailButton,
  EmailNote,
  EmailPending,
  EmailSummary,
  EmailTitle,
  EmailValueLink,
  type EmailSummaryRow,
} from '../EmailParts';
import { EMAIL_COLORS as c } from '../email-theme';
import type { EmailComponentProps } from '../types';

/** Longueur maximale de l'extrait du message : le détail se lit dans le back-office. */
const MESSAGE_EXCERPT_LENGTH = 180;

/** Notification interne à chaque nouvelle demande (maquette « Notification à l'équipe »). */
export function TeamNotificationEmail({ envelope, content, values, context }: EmailComponentProps) {
  const { booking, settings, siteUrl } = context;
  const origin = [booking.country, booking.profile ? PROFILE_LABELS[booking.profile] : null]
    .filter(Boolean)
    .join(' · ');
  const slot = booking.requestedDate
    ? `${capitalize(formatCompactDate(booking.requestedDate))} ${booking.requestedDate.slice(0, 4)}${booking.requestedTime ? ` · ${booking.requestedTime}` : ''} (${formatDuration(settings.booking.durationMinutes)})`
    : null;

  const rows: EmailSummaryRow[] = [
    { label: 'Référence', value: booking.reference, mono: true },
    ...(booking.phone
      ? [
          {
            label: 'Téléphone',
            value: <EmailValueLink href={phoneHref(booking.phone)}>{booking.phone}</EmailValueLink>,
          },
        ]
      : []),
    {
      label: 'E-mail',
      value: <EmailValueLink href={`mailto:${booking.email}`}>{booking.email}</EmailValueLink>,
    },
    ...(origin ? [{ label: 'Pays · profil', value: origin }] : []),
    { label: 'Service', value: values.service },
    ...(slot ? [{ label: 'Créneau souhaité', value: slot }] : []),
    ...(booking.contactPreference
      ? [{ label: 'Contact préféré', value: CONTACT_PREFERENCE_LABELS[booking.contactPreference] }]
      : []),
    ...(booking.message
      ? [
          {
            label: 'Message',
            value: (
              <span
                style={{ color: c.text, fontWeight: 400 }}
              >{`«\u00A0${truncate(booking.message, MESSAGE_EXCERPT_LENGTH)}\u00A0»`}</span>
            ),
          },
        ]
      : []),
    {
      label: 'Contrôles',
      value: <span style={{ color: c.success }}>Consentement accepté · anti-spam réussi</span>,
    },
  ];

  return (
    <EmailLayout
      envelope={envelope}
      variant="team"
      badge="Nouvelle demande"
      siteUrl={siteUrl}
      footer={
        <TeamEmailFooter>
          Notification automatique envoyée aux adresses configurées dans Coordonnées &amp; réglages. Cet
          e-mail ne contient aucune donnée médicale détaillée.
        </TeamEmailFooter>
      }
    >
      <EmailTitle size="md">{fillTemplate(content.heading, values)}</EmailTitle>
      <EmailBody
        source={content.body}
        values={values}
        siteUrl={siteUrl}
        color={c.muted}
        buttonShape="rounded"
      />
      <EmailSummary rows={rows} layout="grid" />
      <EmailActions>
        <EmailButton href={`${siteUrl}${ROUTES.admin.request(booking.id)}`} variant="dark" shape="rounded">
          Ouvrir dans le back-office
        </EmailButton>
        <EmailButton href={`mailto:${booking.email}`} variant="outline" shape="rounded">
          Répondre au demandeur
        </EmailButton>
      </EmailActions>
      <EmailNote tone="mist">
        Délai de traitement conseillé : <strong style={{ color: c.ink }}>sous 24 h</strong>{' '}
        <EmailPending>objectif à valider</EmailPending>
      </EmailNote>
    </EmailLayout>
  );
}
