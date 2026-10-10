/**
 * Rendu serveur des e-mails automatiques (Edge Function « envoi-emails »).
 *
 * TypeScript pur, sans dépendance : le même module est exécuté par Deno (envoi réel) et par
 * Vitest (src/emails/server-parity.test.tsx), qui vérifie que chaque e-mail affiche exactement
 * le même texte et les mêmes liens que les gabarits React de l'aperçu du back-office
 * (src/emails/templates). Toute évolution d'un gabarit doit être reportée ici.
 *
 * Sécurité : toute valeur insérée dans le HTML est échappée ; les variables sont remplacées
 * après l'analyse de la mise en forme, une valeur saisie par un demandeur ne peut donc jamais
 * créer de lien ni de balise.
 */

// ---------------------------------------------------------------------------------------------
// Données
// ---------------------------------------------------------------------------------------------

export type OutboxTemplateKey = 'confirmation-demandeur' | 'notification-equipe' | 'rendez-vous-confirme';

export const OUTBOX_TEMPLATE_KEYS: readonly OutboxTemplateKey[] = [
  'confirmation-demandeur',
  'notification-equipe',
  'rendez-vous-confirme',
];

type ContactPreference = 'telephone' | 'email' | 'whatsapp';
type BookingSource = 'reservation' | 'logement' | 'demande_rapide' | 'contact';
type ApplicantProfile = 'patient' | 'proche' | 'etudiant' | 'personne_agee' | 'professionnel' | 'autre';

/** Demande concernée (colonnes utiles de la table « bookings »). */
export interface MailBooking {
  id: string;
  reference: string;
  confirmationKey: string;
  source: BookingSource;
  serviceId: string | null;
  subject: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  profile: ApplicantProfile | null;
  requestedDate: string | null;
  requestedTime: string | null;
  contactPreference: ContactPreference | null;
  message: string | null;
  createdAt: string;
}

interface ContactEntry {
  value: string;
  active: boolean;
}

/** Réglages du site utiles aux e-mails (table « site_settings »). */
export interface MailSettings {
  phones: ContactEntry[];
  emails: ContactEntry[];
  address: {
    street?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
  };
  booking: { durationMinutes: number };
}

/** Textes du modèle (table « email_templates »), modifiables dans le back-office. */
export interface MailContent {
  subject: string;
  heading: string;
  body: string;
  senderName: string;
  replyTo: string;
}

export interface MailInput {
  content: MailContent;
  booking: MailBooking;
  settings: MailSettings;
  services: ReadonlyArray<{ id: string; title: string }>;
  /** Adresse publique du site, sans barre oblique finale */
  siteUrl: string;
}

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}

// ---------------------------------------------------------------------------------------------
// Libellés et formats (repris de src/content/labels.ts et src/lib/format.ts)
// ---------------------------------------------------------------------------------------------

const LOCALE = 'fr-FR';
const TUNIS_TIME_ZONE = 'Africa/Tunis';

const PROFILE_LABELS: Record<ApplicantProfile, string> = {
  patient: 'Patient(e)',
  proche: 'Proche / famille',
  etudiant: 'Étudiant(e)',
  personne_agee: 'Personne âgée',
  professionnel: 'Professionnel / partenaire',
  autre: 'Autre',
};

const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  telephone: 'Téléphone',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
};

const CONTACT_PREFERENCE_PHRASES: Record<ContactPreference, string> = {
  telephone: 'par téléphone',
  email: 'par e-mail',
  whatsapp: 'par WhatsApp',
};

const SOURCE_LABELS: Record<BookingSource, string> = {
  reservation: 'Réservation',
  logement: 'Recherche de logement',
  demande_rapide: 'Demande rapide',
  contact: 'Message de contact',
};

const SOURCE_PHRASES: Record<BookingSource, string> = {
  reservation: 'le formulaire de réservation',
  logement: 'le formulaire de recherche de logement',
  demande_rapide: 'la demande rapide de l’accueil',
  contact: 'le formulaire de contact',
};

function fromISODate(value: string): Date {
  const [y = 1970, m = 1, d = 1] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

const formatLongDate = (iso: string) =>
  new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    fromISODate(iso),
  );

const formatCompactDate = (iso: string) =>
  new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }).format(
    fromISODate(iso),
  );

const formatWeekday = (iso: string) =>
  new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(fromISODate(iso));

function formatLongDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const day = new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  const time = new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIME_ZONE,
  }).format(date);
  return `${day} à ${time}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`;
}

const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '').replace(/^00/, '+')}`;

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\[([^\]]+)\]/g, (match, key: string) => values[key] ?? match);
}

const activeValues = (entries: ContactEntry[]) => entries.filter((entry) => entry.active).map((e) => e.value);

function addressLine(settings: MailSettings): string {
  const { street, postalCode, city, country } = settings.address;
  return [street, [postalCode, city].filter(Boolean).join(' '), country].filter(Boolean).join(', ');
}

function confirmationPath(booking: MailBooking): string {
  const params = new URLSearchParams({ ref: booking.reference, cle: booking.confirmationKey });
  return `/reservation/confirmation?${params.toString()}`;
}

/** Variables des modèles (reprise de src/features/admin/emails/template-values.ts). */
export function templateValues(
  booking: MailBooking,
  services: MailInput['services'],
): Record<string, string> {
  const [firstName = booking.fullName] = booking.fullName.split(' ');
  const service =
    services.find((item) => item.id === booking.serviceId)?.title ??
    booking.subject ??
    SOURCE_LABELS[booking.source];
  return {
    prénom: firstName,
    nom: booking.fullName,
    référence: booking.reference,
    service,
    date: booking.requestedDate ? formatLongDate(booking.requestedDate) : 'à convenir',
    jour: booking.requestedDate ? formatWeekday(booking.requestedDate) : 'très bientôt',
    heure: booking.requestedTime ?? 'à convenir',
    contact_préféré: CONTACT_PREFERENCE_PHRASES[booking.contactPreference ?? 'email'],
    reçue_le: formatLongDateTime(booking.createdAt),
    origine: SOURCE_PHRASES[booking.source],
  };
}

// ---------------------------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------------------------

const C = {
  ink: '#17151C',
  text: '#4A4553',
  muted: '#5F5A69',
  line: '#E8E3EC',
  lineStrong: '#D8D1DF',
  canvas: '#FBFAF8',
  envelope: '#ECEAF0',
  white: '#FFFFFF',
  brand: '#7A1FA0',
  brandDark: '#5E1680',
  brandBright: '#B526D9',
  brandSoft: '#F3E6F8',
  brandLight: '#E3B0F5',
  mist: '#F4EFF7',
  plum: '#2A0F38',
  onPlum: '#CDBFD8',
  night: '#141218',
  onNight: '#ABA4B5',
  success: '#177A2E',
  successBright: '#2BB24C',
  wordmarkGreen: '#2A9A35',
  goldWash: '#FFFCF4',
  goldLine: '#EEDDB0',
  goldText: '#5B4310',
  goldSoft: '#F8EFD8',
  goldDark: '#6E4F0C',
} as const;

const FONT = "'Instrument Sans', 'Segoe UI', Helvetica, Arial, sans-serif";

/** Échappement HTML de toute valeur insérée dans l'e-mail. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PARAGRAPH = `margin:0 0 14px;font-size:15.5px;line-height:1.6`;
const PENDING = `background:${C.goldSoft};color:${C.goldDark};border-radius:6px;padding:1px 7px;font-weight:600;font-size:12.5px`;

const RESPONSIVE_CSS = `
body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
img { border: 0; }
@media (max-width: 640px) {
  .lp-envelope { padding: 0 0 24px !important; }
  .lp-card { border-radius: 0 !important; }
  .lp-pad { padding-left: 20px !important; padding-right: 20px !important; }
  .lp-title { font-size: 24px !important; }
}`;

// --- Mise en forme légère du corps (reprise de src/emails/email-markup.ts) -------------------

type InlineToken =
  | { type: 'text' | 'strong' | 'em' | 'pending'; text: string }
  | { type: 'link'; label: string; href: string };

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'button'; label: string; href: string };

const INLINE_PATTERN = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)\s]+\))/g;
const BUTTON_LINE = /^::bouton\s+\[([^\]]+)\]\(([^)\s]+)\)$/;
const LIST_ITEM = /^[-*•]\s+/;
const VARIABLE = /\[([\p{L}_]+)\]/gu;
const PLACEHOLDER = /\uE000(\d+)\uE001/g;

function tokenizeInline(text: string): InlineToken[] {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part !== '')
    .map((part): InlineToken => {
      if (part.startsWith('[[') && part.endsWith(']]')) return { type: 'pending', text: part.slice(2, -2) };
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
        return { type: 'strong', text: part.slice(2, -2) };
      if (part.startsWith('_') && part.endsWith('_') && part.length > 2)
        return { type: 'em', text: part.slice(1, -1) };
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link?.[1] && link[2]) return { type: 'link', label: link[1], href: link[2] };
      return { type: 'text', text: part };
    });
}

function parseBody(source: string): Block[] {
  const blocks: Block[] = [];
  let lines: string[] = [];
  let items: string[] = [];
  const flushParagraph = () => {
    if (lines.length > 0) blocks.push({ type: 'paragraph', lines });
    lines = [];
  };
  const flushList = () => {
    if (items.length > 0) blocks.push({ type: 'list', items });
    items = [];
  };
  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }
    const button = BUTTON_LINE.exec(line);
    if (button?.[1] && button[2]) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'button', label: button[1], href: button[2] });
      continue;
    }
    if (LIST_ITEM.test(line)) {
      flushParagraph();
      items.push(line.replace(LIST_ITEM, ''));
      continue;
    }
    flushList();
    lines.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function inlineTokens(text: string, values: Record<string, string>): InlineToken[] {
  const variables: string[] = [];
  const shielded = text.replace(VARIABLE, (match, name: string) => {
    if (!(name in values)) return match;
    variables.push(match);
    return `\uE000${variables.length - 1}\uE001`;
  });
  const restore = (value: string) =>
    fillTemplate(
      value.replace(PLACEHOLDER, (_, index: string) => variables[Number(index)] ?? ''),
      values,
    );
  return tokenizeInline(shielded).map((token) =>
    token.type === 'link'
      ? { ...token, label: restore(token.label), href: restore(token.href) }
      : { ...token, text: restore(token.text) },
  );
}

const isSafeHref = (href: string) => /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href);

function emailHref(href: string, siteUrl: string): string | null {
  if (!isSafeHref(href) || href.startsWith('#')) return null;
  return href.startsWith('/') ? `${siteUrl}${href}` : href;
}

function inlineHtml(text: string, values: Record<string, string>, siteUrl: string): string {
  return inlineTokens(text, values)
    .map((token) => {
      switch (token.type) {
        case 'strong':
          return `<strong style="color:${C.ink}">${esc(token.text)}</strong>`;
        case 'em':
          return `<em>${esc(token.text)}</em>`;
        case 'pending':
          return `<span style="${PENDING}">${esc(token.text)}</span>`;
        case 'link': {
          const href = emailHref(token.href, siteUrl);
          return href
            ? `<a href="${esc(href)}" style="color:${C.brand};font-weight:600">${esc(token.label)}</a>`
            : esc(token.label);
        }
        default:
          return esc(token.text);
      }
    })
    .join('');
}

function button(
  href: string,
  label: string,
  variant: 'primary' | 'dark' | 'outline',
  shape: 'pill' | 'rounded',
): string {
  const filled = variant !== 'outline';
  const background = variant === 'primary' ? C.brand : variant === 'dark' ? C.ink : 'transparent';
  return (
    `<a href="${esc(href)}" style="display:inline-block;background:${background};color:${filled ? C.white : C.ink};` +
    `text-decoration:none;font-weight:600;padding:${filled ? '14px 24px' : '13px 22px'};` +
    `border-radius:${shape === 'pill' ? '999px' : '12px'};border:${filled ? 'none' : `1px solid ${C.lineStrong}`};` +
    `margin:0 8px 10px 0">${esc(label)}</a>`
  );
}

function bodyHtml(
  source: string,
  values: Record<string, string>,
  siteUrl: string,
  color: string = C.text,
  buttonShape: 'pill' | 'rounded' = 'pill',
): string {
  return parseBody(source)
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p style="${PARAGRAPH};color:${color}">${block.lines
            .map((line) => inlineHtml(line, values, siteUrl))
            .join('<br>')}</p>`;
        case 'list':
          return `<ul style="${PARAGRAPH};color:${color};padding-left:22px">${block.items
            .map((item) => `<li style="margin:0 0 4px">${inlineHtml(item, values, siteUrl)}</li>`)
            .join('')}</ul>`;
        case 'button': {
          const href = emailHref(fillTemplate(block.href, values), siteUrl);
          return href
            ? `<p style="margin:4px 0 18px">${button(href, fillTemplate(block.label, values), 'primary', buttonShape)}</p>`
            : '';
        }
      }
    })
    .join('');
}

// --- Blocs (repris de src/emails/EmailParts.tsx et EmailLayout.tsx) ---------------------------

const eyebrow = (text: string) =>
  `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${C.success}">${esc(text)}</p>`;

function title(text: string, size: 'lg' | 'md' = 'lg'): string {
  const style =
    size === 'lg'
      ? 'margin:0 0 16px;font-size:28px;line-height:1.15'
      : 'margin:0 0 12px;font-size:26px;line-height:1.2';
  return `<h1 class="lp-title" style="${style};letter-spacing:-.03em;font-weight:600;color:${C.ink}">${esc(text)}</h1>`;
}

const heading = (text: string) =>
  `<h2 style="margin:32px 0 14px;font-size:18px;font-weight:600;letter-spacing:-.01em;color:${C.ink}">${esc(text)}</h2>`;

const actions = (...buttons: string[]) => `<div style="margin:24px 0 0">${buttons.join('')}</div>`;

interface SummaryRow {
  label: string;
  /** Valeur déjà au format HTML (échappée) */
  html: string;
  mono?: boolean;
}

function summary(rows: SummaryRow[], layout: 'split' | 'grid' = 'split'): string {
  const split = layout === 'split';
  const body = rows
    .map((row, index) => {
      const cell =
        `padding:${split ? '14px 18px' : '12px 16px'};` +
        `border-bottom:${index < rows.length - 1 ? `1px solid ${C.line}` : 'none'};` +
        `background:${index === 0 ? C.canvas : C.white};vertical-align:top`;
      const labelStyle = `${cell};color:${C.muted}${split ? ';white-space:nowrap' : ';width:150px'}`;
      const valueStyle =
        `${cell};font-weight:600;text-align:${split ? 'right' : 'left'}` +
        (row.mono ? ';font-family:Consolas, monospace;letter-spacing:.04em' : '');
      return `<tr><td style="${labelStyle}">${esc(row.label)}</td><td style="${valueStyle}">${row.html}</td></tr>`;
    })
    .join('');
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};` +
    `border-radius:14px;border-collapse:separate;border-spacing:0;overflow:hidden;margin:28px 0 0;` +
    `font-size:${split ? '15px' : '14.5px'}"><tbody>${body}</tbody></table>`
  );
}

const valueLink = (href: string, text: string) =>
  `<a href="${esc(href)}" style="color:${C.brand};font-weight:600;text-decoration:none">${esc(text)}</a>`;

function steps(items: string[]): string {
  const border = `1px solid ${C.line}`;
  const rows = items
    .map((step, index) => {
      const cell = `padding:12px 0;border-top:${border};border-bottom:${index === items.length - 1 ? border : 'none'};vertical-align:top`;
      return (
        `<tr><td style="${cell};width:42px"><span style="display:inline-block;width:28px;height:28px;line-height:28px;` +
        `text-align:center;border-radius:999px;background:${C.brandSoft};color:${C.brandDark};font-weight:700;` +
        `font-size:13px">${index + 1}</span></td><td style="${cell};color:${C.text};padding-top:15px">${esc(step)}</td></tr>`
      );
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tbody>${rows}</tbody></table>`;
}

const bullets = (items: string[]) =>
  items
    .map(
      (item, index) =>
        `<p style="margin:${index === items.length - 1 ? '0' : '0 0 8px'};color:${C.text}">• ${esc(item)}</p>`,
    )
    .join('');

function note(html: string, tone: 'gold' | 'mist' = 'gold'): string {
  const style =
    tone === 'gold'
      ? `background:${C.goldWash};border:1px solid ${C.goldLine};color:${C.goldText};font-size:14px`
      : `background:${C.mist};color:${C.text};font-size:13.5px`;
  return `<div style="margin:26px 0 0;padding:15px 18px;border-radius:12px;${style}">${html}</div>`;
}

const pending = (text: string) => `<span style="${PENDING}">${esc(text)}</span>`;

const signature = () =>
  `<p style="margin:18px 0 0;color:${C.ink};font-size:14.5px">À très bientôt,<br><strong>L’équipe LASISTANT.PRO</strong></p>`;

const phonesHtml = (phones: string[]) =>
  phones
    .map(
      (phone, index) =>
        `${index > 0 ? ' · ' : ''}<a href="${esc(phoneHref(phone))}" style="color:${C.brand};font-weight:600;text-decoration:none;white-space:nowrap">${esc(phone)}</a>`,
    )
    .join('');

function layout(options: {
  variant: 'brand' | 'team';
  badge?: string;
  siteUrl: string;
  title: string;
  content: string;
  footer: string;
}): string {
  const { variant, badge, siteUrl } = options;
  const logo = esc(`${siteUrl}/icon-192.png`);
  const gutter = variant === 'brand' ? 40 : 36;
  const header =
    variant === 'brand'
      ? `<div style="height:6px;background:linear-gradient(90deg, ${C.brand}, ${C.brandBright} 70%, ${C.successBright})"></div>` +
        `<div class="lp-pad" style="padding:28px ${gutter}px;border-bottom:1px solid ${C.line}">` +
        `<img src="${logo}" alt="LASISTANT.PRO" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:12px;border:0">` +
        `<span style="font-size:20px;font-weight:700;font-style:italic;letter-spacing:-.03em;vertical-align:middle">` +
        `<span style="color:${C.brand}">Lasistant</span><span style="color:${C.wordmarkGreen}">.Pro</span></span></div>`
      : `<div class="lp-pad" style="background:${C.plum};color:${C.white};padding:24px ${gutter}px">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody><tr>` +
        `<td style="vertical-align:middle"><span style="display:inline-block;width:40px;height:40px;border-radius:11px;` +
        `background:${C.white};text-align:center;vertical-align:middle;margin-right:12px">` +
        `<img src="${logo}" alt="" width="30" height="30" style="display:inline-block;margin-top:5px;border:0"></span>` +
        `<span style="font-weight:600;vertical-align:middle;color:${C.white}">Back-office LASISTANT.PRO</span></td>` +
        (badge
          ? `<td style="text-align:right;vertical-align:middle"><span style="display:inline-block;background:${C.brandBright};` +
            `color:${C.white};font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 12px;` +
            `border-radius:999px;white-space:nowrap">${esc(badge)}</span></td>`
          : '') +
        `</tr></tbody></table></div>`;
  const body =
    `<div class="lp-envelope" style="font-family:${FONT};color:${C.ink};background:${C.envelope};padding:40px 0;font-size:15px;line-height:1.6">` +
    `<div class="lp-card" style="max-width:600px;margin:0 auto;background:${C.white};border-radius:18px;overflow:hidden;` +
    `box-shadow:0 20px 40px -24px rgba(42,15,56,.35)">${header}` +
    `<div class="lp-pad" style="padding:${variant === 'brand' ? 40 : 34}px ${gutter}px 34px">${options.content}</div>` +
    `${options.footer}</div></div>`;
  return [
    '<!doctype html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light">',
    `<title>${esc(options.title)}</title>`,
    `<style>${RESPONSIVE_CSS}</style>`,
    '</head>',
    `<body>${body}</body>`,
    '</html>',
  ].join('\n');
}

function publicFooter(settings: MailSettings, siteUrl: string): string {
  const contact = [addressLine(settings), activeValues(settings.emails)[0] ?? null]
    .filter(Boolean)
    .join(' · ');
  return (
    `<div class="lp-pad" style="background:${C.night};color:${C.onNight};padding:26px 40px;font-size:12.5px;line-height:1.6">` +
    `<p style="margin:0 0 6px;color:${C.white};font-weight:600">LASISTANT.PRO · Soutien médical &amp; hébergement</p>` +
    `<p style="margin:0">${esc(contact)}</p>` +
    `<p style="margin:10px 0 0">Vous recevez cet e-mail à la suite de votre demande sur notre site. Nos services d’accompagnement ne remplacent pas un avis médical.</p>` +
    `<p style="margin:10px 0 0"><a href="${esc(`${siteUrl}/politique-de-confidentialite`)}" style="color:${C.brandLight}">Politique de confidentialité</a>` +
    ` · <a href="${esc(`${siteUrl}/mentions-legales`)}" style="color:${C.brandLight}">Mentions légales</a></p></div>`
  );
}

const teamFooter = (html: string) =>
  `<div class="lp-pad" style="background:${C.canvas};border-top:1px solid ${C.line};color:${C.muted};padding:18px 36px;font-size:12.5px">${html}</div>`;

// ---------------------------------------------------------------------------------------------
// Modèles
// ---------------------------------------------------------------------------------------------

function requesterConfirmation(input: MailInput, values: Record<string, string>): string {
  const { booking, settings, siteUrl, content } = input;
  const slot = booking.requestedDate
    ? `${capitalize(formatLongDate(booking.requestedDate))}${booking.requestedTime ? ` · ${booking.requestedTime}` : ''}`
    : 'À convenir avec vous';
  const rows: SummaryRow[] = [
    { label: 'N° de demande', html: esc(booking.reference), mono: true },
    { label: 'Service', html: esc(values.service ?? '') },
    { label: 'Date souhaitée', html: esc(slot) },
    ...(booking.requestedDate
      ? [
          {
            label: 'Durée',
            html: esc(`${formatDuration(settings.booking.durationMinutes)} · heure de Tunisie (UTC+1)`),
          },
        ]
      : []),
    { label: 'Contact préféré', html: esc(capitalize(values.contact_préféré ?? '')) },
  ];
  return [
    eyebrow('Demande enregistrée'),
    title(fillTemplate(content.heading, values)),
    bodyHtml(content.body, values, siteUrl),
    summary(rows),
    actions(
      booking.requestedDate
        ? button(`${siteUrl}${confirmationPath(booking)}`, 'Ajouter à mon agenda', 'primary', 'pill')
        : '',
      button(siteUrl, 'Visiter le site', 'outline', 'pill'),
    ),
    heading('Les prochaines étapes'),
    steps([
      'Nous examinons votre demande.',
      'Un conseiller vous contacte pour confirmer le créneau.',
      'Nous préparons ensemble la suite de votre accompagnement.',
    ]),
    note(
      'Pour protéger vos données, merci de ne pas nous transmettre d’informations médicales détaillées par e-mail. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé.',
    ),
    `<div style="margin:28px 0 0;font-size:14.5px;color:${C.text}">` +
      `<p style="margin:0 0 8px">Une question ou une modification ? Répondez simplement à cet e-mail ou appelez-nous :</p>` +
      `<p style="margin:0">${phonesHtml(activeValues(settings.phones))}</p>${signature()}</div>`,
  ].join('');
}

const MESSAGE_EXCERPT_LENGTH = 180;

function teamNotification(input: MailInput, values: Record<string, string>): string {
  const { booking, settings, siteUrl, content } = input;
  const origin = [booking.country, booking.profile ? PROFILE_LABELS[booking.profile] : null]
    .filter(Boolean)
    .join(' · ');
  const slot = booking.requestedDate
    ? `${capitalize(formatCompactDate(booking.requestedDate))} ${booking.requestedDate.slice(0, 4)}${booking.requestedTime ? ` · ${booking.requestedTime}` : ''} (${formatDuration(settings.booking.durationMinutes)})`
    : null;
  const rows: SummaryRow[] = [
    { label: 'Référence', html: esc(booking.reference), mono: true },
    ...(booking.phone
      ? [{ label: 'Téléphone', html: valueLink(phoneHref(booking.phone), booking.phone) }]
      : []),
    { label: 'E-mail', html: valueLink(`mailto:${booking.email}`, booking.email) },
    ...(origin ? [{ label: 'Pays · profil', html: esc(origin) }] : []),
    { label: 'Service', html: esc(values.service ?? '') },
    ...(slot ? [{ label: 'Créneau souhaité', html: esc(slot) }] : []),
    ...(booking.contactPreference
      ? [{ label: 'Contact préféré', html: esc(CONTACT_PREFERENCE_LABELS[booking.contactPreference]) }]
      : []),
    ...(booking.message
      ? [
          {
            label: 'Message',
            html: `<span style="color:${C.text};font-weight:400">${esc(`«\u00A0${truncate(booking.message, MESSAGE_EXCERPT_LENGTH)}\u00A0»`)}</span>`,
          },
        ]
      : []),
    {
      label: 'Contrôles',
      html: `<span style="color:${C.success}">Consentement accepté · anti-spam réussi</span>`,
    },
  ];
  return [
    title(fillTemplate(content.heading, values), 'md'),
    bodyHtml(content.body, values, siteUrl, C.muted, 'rounded'),
    summary(rows, 'grid'),
    actions(
      button(`${siteUrl}/admin/demandes/${booking.id}`, 'Ouvrir dans le back-office', 'dark', 'rounded'),
      button(`mailto:${booking.email}`, 'Répondre au demandeur', 'outline', 'rounded'),
    ),
    note(
      `Délai de traitement conseillé : <strong style="color:${C.ink}">sous 24 h</strong> ${pending('objectif à valider')}`,
      'mist',
    ),
  ].join('');
}

function endTime(start: string, minutes: number): string {
  const [hours = 0, mins = 0] = start.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function appointmentConfirmed(input: MailInput, values: Record<string, string>): string {
  const { booking, settings, siteUrl, content } = input;
  const date = booking.requestedDate ? fromISODate(booking.requestedDate) : null;
  const part = (options: Intl.DateTimeFormatOptions) =>
    date ? capitalize(new Intl.DateTimeFormat(LOCALE, options).format(date)) : '';
  const time = booking.requestedTime
    ? `${booking.requestedTime} – ${endTime(booking.requestedTime, settings.booking.durationMinutes)}`
    : 'Horaire à convenir';
  const channel = CONTACT_PREFERENCE_PHRASES[booking.contactPreference ?? 'telephone'];
  const changeLink = `mailto:${content.replyTo}?subject=${encodeURIComponent(`Rendez-vous ${booking.reference}`)}`;
  const calendar = date
    ? `<td style="width:76px;padding:24px 0 24px 26px;vertical-align:middle"><div style="width:76px;border-radius:14px;` +
      `background:${C.white};color:${C.ink};text-align:center;padding:10px 0;line-height:1.15">` +
      `<div style="font-size:12px;font-weight:700;text-transform:uppercase;color:${C.brand}">${esc(part({ month: 'short' }))}</div>` +
      `<div style="font-size:32px;font-weight:700;letter-spacing:-.03em">${date.getDate()}</div>` +
      `<div style="font-size:12px;color:${C.muted}">${esc(part({ weekday: 'short' }).toLowerCase())}</div></div></td>`
    : '';
  return [
    eyebrow('Rendez-vous confirmé'),
    title(fillTemplate(content.heading, values)),
    bodyHtml(content.body, values, siteUrl),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;background:${C.plum};` +
      `border-radius:16px;color:${C.white}"><tbody><tr>${calendar}` +
      `<td style="padding:24px 26px 24px 20px;vertical-align:middle"><p style="margin:0;font-size:20px;font-weight:600">${esc(time)}</p>` +
      `<p style="margin:4px 0 0;color:${C.onPlum}">${esc(`Heure de Tunisie (UTC+1) · ${channel}`)}</p>` +
      `<p style="margin:4px 0 0;color:${C.onPlum}">${esc(`${values.service ?? ''} · réf. ${booking.reference}`)}</p></td></tr></tbody></table>`,
    actions(
      button(`${siteUrl}${confirmationPath(booking)}`, 'Ajouter à mon agenda', 'primary', 'pill'),
      button(changeLink, 'Modifier ou annuler', 'outline', 'pill'),
    ),
    heading('Pour préparer notre échange'),
    bullets([
      'Vos dates de séjour envisagées',
      'Vos besoins de logement et d’accompagnement',
      'Vos questions pratiques',
    ]),
    note(
      `Modification ou annulation : merci de nous prévenir le plus tôt possible. ${pending('conditions à valider')}`,
    ),
    `<div style="margin:28px 0 0;font-size:14.5px;color:${C.text}"><p style="margin:0">Une question ? ${phonesHtml(activeValues(settings.phones))}</p>${signature()}</div>`,
  ].join('');
}

// ---------------------------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------------------------

/** Version texte brut d'un e-mail HTML (partie « text/plain », meilleure délivrabilité). */
export function htmlToText(html: string): string {
  const body = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? html;
  return body
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a\s([^>]*)>([\s\S]*?)<\/a>/gi, (_, attributes: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '');
      const target = (/href="([^"]*)"/.exec(attributes)?.[1] ?? '').replace(/&amp;/g, '&');
      const line =
        target.startsWith('mailto:') || target.startsWith('tel:') || text === target
          ? text
          : `${text} : ${target}`;
      // Bouton : sur sa propre ligne.
      return attributes.includes('display:inline-block') ? `\n${line}\n` : line;
    })
    .replace(/<\/(p|div|h1|h2|tr|li|table)>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** E-mail prêt à l'envoi : objet, HTML et texte brut. */
export function renderOutboxEmail(key: OutboxTemplateKey, input: MailInput): RenderedMail {
  const values = templateValues(input.booking, input.services);
  const subject = fillTemplate(input.content.subject, values);
  const html =
    key === 'notification-equipe'
      ? layout({
          variant: 'team',
          badge: 'Nouvelle demande',
          siteUrl: input.siteUrl,
          title: subject,
          content: teamNotification(input, values),
          footer: teamFooter(
            'Notification automatique envoyée aux adresses configurées dans Coordonnées &amp; réglages. Cet e-mail ne contient aucune donnée médicale détaillée.',
          ),
        })
      : layout({
          variant: 'brand',
          siteUrl: input.siteUrl,
          title: subject,
          content:
            key === 'rendez-vous-confirme'
              ? appointmentConfirmed(input, values)
              : requesterConfirmation(input, values),
          footer: publicFooter(input.settings, input.siteUrl),
        });
  return { subject, html, text: htmlToText(html) };
}
