import { describe, expect, it } from 'vitest';
import { createEmailTemplatesSeed } from '@/content/demo/email-templates';
import { PREVIEW_BOOKING, previewMember } from '@/content/demo/email-preview';
import { createServicesSeed } from '@/content/services';
import { createSiteSettingsSeed } from '@/content/site-settings';
import { templateValues } from '@/features/admin/emails/template-values';
import type { Booking } from '@/types';
import {
  OUTBOX_TEMPLATE_KEYS,
  renderOutboxEmail,
  type MailBooking,
  type OutboxTemplateKey,
} from '../../supabase/functions/envoi-emails/gabarits';
import { EmailDocument } from './EmailDocument';
import { emailEnvelope } from './registry';
import { renderEmailHtml } from './render';

/**
 * Parité entre l'aperçu du back-office (gabarits React) et l'envoi réel (Edge Function
 * « envoi-emails ») : même objet, même texte visible, mêmes liens et mêmes images.
 */

const SITE_URL = 'https://lasistant.pro';
const settings = createSiteSettingsSeed(new Date('2026-10-08T09:00:00.000Z'));
const services = createServicesSeed(new Date('2026-10-08T09:00:00.000Z'));
const templates = createEmailTemplatesSeed(new Date('2026-10-08T09:00:00.000Z'));

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X'))
      return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Texte visible du corps de l'e-mail, espaces normalisés. */
function visibleText(html: string): string {
  const body = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  return decode(body.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const attributes = (html: string, name: 'href' | 'src') =>
  [...html.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((match) => decode(match[1] ?? ''));

function mailBooking(booking: Booking): MailBooking {
  return {
    id: booking.id,
    reference: booking.reference,
    confirmationKey: booking.confirmationKey,
    source: booking.source,
    serviceId: booking.serviceId,
    subject: booking.subject,
    fullName: booking.fullName,
    email: booking.email,
    phone: booking.phone,
    country: booking.country,
    profile: booking.profile,
    requestedDate: booking.requestedDate,
    requestedTime: booking.requestedTime,
    contactPreference: booking.contactPreference,
    message: booking.message,
    createdAt: booking.createdAt,
  };
}

function renderBoth(key: OutboxTemplateKey, booking: Booking) {
  const template = templates.find((item) => item.key === key);
  if (!template) throw new Error(`Modèle ${key} absent du jeu d'origine.`);
  const content = {
    key,
    subject: template.subject,
    heading: template.heading,
    body: template.body,
    senderName: template.senderName,
    replyTo: template.replyTo,
  };
  const values = templateValues(booking, services);
  const context = { siteUrl: SITE_URL, settings, booking, member: previewMember(SITE_URL, 'invitation') };
  const subject = emailEnvelope(content, values, context).subject;
  const react = renderEmailHtml(
    <EmailDocument content={content} values={values} context={context} />,
    subject,
  );
  const server = renderOutboxEmail(key, {
    content,
    booking: mailBooking(booking),
    settings,
    services,
    siteUrl: SITE_URL,
  });
  return { react, server, subject };
}

const BOOKINGS: Record<string, Booking> = {
  'réservation complète': PREVIEW_BOOKING,
  'demande sans créneau ni téléphone': {
    ...PREVIEW_BOOKING,
    source: 'contact',
    serviceId: null,
    subject: 'Question sur un logement',
    phone: null,
    country: null,
    profile: null,
    requestedDate: null,
    requestedTime: null,
    contactPreference: null,
    message: null,
  },
  'message contenant du HTML': {
    ...PREVIEW_BOOKING,
    fullName: 'Léa <b>Martin</b>',
    message: '<script>alert("x")</script> Merci de me rappeler.',
  },
};

describe('e-mails automatiques : parité aperçu / envoi réel', () => {
  for (const key of OUTBOX_TEMPLATE_KEYS) {
    for (const [label, booking] of Object.entries(BOOKINGS)) {
      it(`${key} — ${label}`, () => {
        const { react, server, subject } = renderBoth(key, booking);
        expect(server.subject).toBe(subject);
        expect(visibleText(server.html)).toBe(visibleText(react));
        expect(attributes(server.html, 'href')).toEqual(attributes(react, 'href'));
        expect(attributes(server.html, 'src')).toEqual(attributes(react, 'src'));
      });
    }
  }

  it('neutralise tout HTML saisi par un demandeur', () => {
    const { server } = renderBoth('notification-equipe', BOOKINGS['message contenant du HTML']!);
    expect(server.html).not.toContain('<script>');
    expect(server.html).not.toContain('<b>Martin</b>');
    expect(server.html).toContain('&lt;script&gt;');
  });

  it('fournit une version texte lisible, liens compris', () => {
    const { server } = renderBoth('confirmation-demandeur', PREVIEW_BOOKING);
    expect(server.text).toContain(PREVIEW_BOOKING.reference);
    expect(server.text).toContain(`Ajouter à mon agenda : ${SITE_URL}/reservation/confirmation?`);
    expect(server.text).not.toMatch(/<[a-z]/i);
  });

  it('place chaque bouton et chaque élément du calendrier sur sa propre ligne', () => {
    const { server } = renderBoth('rendez-vous-confirme', PREVIEW_BOOKING);
    const lines = server.text.split('\n');
    expect(lines.some((line) => /^Ajouter à mon agenda : https:\/\/\S+$/.test(line))).toBe(true);
    expect(lines.some((line) => /^Modifier ou annuler : mailto:\S+$/.test(line))).toBe(false);
    expect(lines).toContain('Modifier ou annuler');
    expect(lines).toContain('14');
  });
});
