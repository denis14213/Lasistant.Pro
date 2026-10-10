// Edge Function « envoi-emails » : envoie par Resend les e-mails déposés dans la file
// « email_outbox » (confirmation au demandeur, notification à l'équipe, rendez-vous confirmé).
//
//   POST /functions/v1/envoi-emails        (appelée par la base : pg_net, puis pg_cron)
//   En-tête « x-envoi-jeton » : jeton conservé dans le coffre de la base (Vault)
//   Corps : { "siteUrl": "https://…" }      adresse publique du site (liens et logo)
//
// La fonction ne reçoit aucun contenu : elle envoie uniquement ce que la base a mis en file,
// après avoir réservé chaque e-mail (aucun double envoi, même en cas d'appels simultanés).
// Le jeton est vérifié par la base elle-même (routes outbox_claim / outbox_complete, réservées
// à la clé secrète). Chaque envoi porte une clé d'idempotence : une nouvelle tentative après
// une coupure réseau ne produit jamais de doublon chez le destinataire.
//
// Secrets (tableau de bord › Edge Functions › Secrets) :
//   RESEND_API_KEY  clé Resend « sending access » (facultatif : à défaut, clé « resend_api_key » du coffre)
//   EMAIL_FROM      adresse d'expédition (facultatif, défaut : notifications@adbm-school.com)
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import {
  OUTBOX_TEMPLATE_KEYS,
  renderOutboxEmail,
  type MailBooking,
  type MailSettings,
  type OutboxTemplateKey,
} from './gabarits.ts';

const DEFAULT_FROM = 'notifications@adbm-school.com';
const DEFAULT_SITE_URL = 'https://lasistant.pro';
/** E-mails traités par appel (un appel suit chaque nouvelle demande). */
const BATCH_SIZE = 10;
/** Débit autorisé par Resend : 2 requêtes par seconde. */
const SEND_INTERVAL_MS = 550;
const EMAIL_PATTERN = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/;
const SITE_URL_PATTERN = /^https:\/\/[a-z0-9.-]+(:\d+)?$/i;

interface OutboxRow {
  id: string;
  template_key: string;
  recipient: string;
  booking_id: string | null;
  attempts: number;
}

interface TemplateRow {
  key: string;
  subject: string;
  heading: string;
  body: string;
  sender_name: string;
  reply_to: string;
  active: boolean;
}

type Outcome = { providerId: string } | { error: string; permanent: boolean };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/** Client d'administration : clé secrète (nouveau format), sinon clé « service_role » historique. */
function adminClient(): SupabaseClient {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  const secretKey = secretKeys ? JSON.parse(secretKeys).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(Deno.env.get('SUPABASE_URL')!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Nom d'expéditeur sans caractère capable de modifier l'en-tête « From ». */
const senderName = (name: string) => name.replace(/["<>\r\n]/g, '').trim() || 'LASISTANT.PRO';

function toBooking(row: Record<string, unknown>): MailBooking {
  return {
    id: String(row.id),
    reference: String(row.reference),
    confirmationKey: String(row.confirmation_key),
    source: row.source as MailBooking['source'],
    serviceId: (row.service_id as string | null) ?? null,
    subject: (row.subject as string | null) ?? null,
    fullName: String(row.full_name),
    email: String(row.email),
    phone: (row.phone as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    profile: (row.profile as MailBooking['profile']) ?? null,
    requestedDate: (row.requested_date as string | null) ?? null,
    requestedTime: (row.requested_time as string | null) ?? null,
    contactPreference: (row.contact_preference as MailBooking['contactPreference']) ?? null,
    message: (row.message as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

async function sendWithResend(
  apiKey: string,
  idempotencyKey: string,
  email: {
    from: string;
    to: string;
    replyTo: string | null;
    subject: string;
    html: string;
    text: string;
    tag: string;
  },
): Promise<Outcome> {
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        subject: email.subject,
        html: email.html,
        text: email.text,
        tags: [{ name: 'modele', value: email.tag }],
      }),
    });
  } catch (error) {
    return {
      error: `Service d'envoi injoignable : ${error instanceof Error ? error.message : String(error)}`,
      permanent: false,
    };
  }
  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };
  if (response.ok && payload.id) return { providerId: payload.id };
  const detail = `Resend ${response.status} : ${payload.message ?? payload.name ?? 'réponse inattendue'}`;
  // 4xx : adresse ou contenu refusés, inutile d'insister ; 429 et 5xx : nouvelle tentative plus tard.
  // 409 : requête identique déjà en cours chez Resend (idempotence), à reprendre plus tard.
  const permanent =
    response.status >= 400 && response.status < 500 && response.status !== 429 && response.status !== 409;
  return { error: detail, permanent };
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  const token = request.headers.get('x-envoi-jeton');
  if (!token) return json({ error: 'Appel non autorisé.' }, 401);

  const input = (await request.json().catch(() => ({}))) as { siteUrl?: unknown };
  const siteUrl =
    typeof input.siteUrl === 'string' && SITE_URL_PATTERN.test(input.siteUrl.replace(/\/$/, ''))
      ? input.siteUrl.replace(/\/$/, '')
      : DEFAULT_SITE_URL;

  const admin = adminClient();
  // Clé d'envoi : secret de la fonction, sinon coffre de la base (la route vérifie aussi le jeton).
  let storedKey: string | null = Deno.env.get('RESEND_API_KEY') ?? null;
  if (!storedKey) {
    const stored = await admin.rpc('outbox_provider_key', { p_token: token });
    if (stored.error) {
      const status = stored.error.code === '42501' ? 401 : 500;
      return json({ error: status === 401 ? 'Appel non autorisé.' : 'Configuration indisponible.' }, status);
    }
    storedKey = (stored.data as string | null) ?? null;
  }
  // Sans clé d'envoi, rien n'est réservé : les e-mails attendent en file, sans perdre de tentative.
  if (!storedKey) return json({ error: 'Service d’envoi non configuré.' }, 503);
  const apiKey = storedKey;
  const fromAddress = Deno.env.get('EMAIL_FROM') || DEFAULT_FROM;

  const claimed = await admin.rpc('outbox_claim', { p_token: token, p_limit: BATCH_SIZE });
  if (claimed.error) {
    const status = claimed.error.code === '42501' ? 401 : 500;
    return json({ error: status === 401 ? 'Appel non autorisé.' : 'File d’envoi indisponible.' }, status);
  }
  const rows = (claimed.data ?? []) as OutboxRow[];
  if (rows.length === 0) return json({ traites: 0 });

  const complete = async (row: OutboxRow, outcome: Outcome) => {
    const result = await admin.rpc('outbox_complete', {
      p_token: token,
      p_id: row.id,
      p_provider_id: 'providerId' in outcome ? outcome.providerId : null,
      p_error: 'error' in outcome ? outcome.error : null,
      p_permanent: 'error' in outcome ? outcome.permanent : false,
    });
    if (result.error) console.error(`Compte rendu impossible pour ${row.id} : ${result.error.message}`);
  };

  const bookingIds = [
    ...new Set(rows.map((row) => row.booking_id).filter((id): id is string => Boolean(id))),
  ];
  const keys = [...new Set(rows.map((row) => row.template_key))];
  const [settingsResult, servicesResult, templatesResult, bookingsResult] = await Promise.all([
    admin.from('site_settings').select('phones, emails, address, booking').eq('id', 1).single(),
    admin.from('services').select('id, title'),
    admin
      .from('email_templates')
      .select('key, subject, heading, body, sender_name, reply_to, active')
      .in('key', keys),
    bookingIds.length > 0
      ? admin.from('bookings').select('*').in('id', bookingIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const loadError =
    settingsResult.error ?? servicesResult.error ?? templatesResult.error ?? bookingsResult.error;
  if (loadError || !settingsResult.data) {
    await Promise.all(
      rows.map((row) => complete(row, { error: 'Données indisponibles.', permanent: false })),
    );
    return json({ error: 'Données indisponibles.' }, 500);
  }

  const settings = settingsResult.data as unknown as MailSettings;
  const services = (servicesResult.data ?? []) as Array<{ id: string; title: string }>;
  const templates = new Map(((templatesResult.data ?? []) as TemplateRow[]).map((row) => [row.key, row]));
  const bookings = new Map(
    ((bookingsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => [
      String(row.id),
      toBooking(row),
    ]),
  );

  let sent = 0;
  let failed = 0;
  let deliveries = 0;
  for (const row of rows) {
    const template = templates.get(row.template_key);
    const booking = row.booking_id ? bookings.get(row.booking_id) : undefined;
    let outcome: Outcome;
    if (!OUTBOX_TEMPLATE_KEYS.includes(row.template_key as OutboxTemplateKey)) {
      outcome = {
        error: `Modèle « ${row.template_key} » non pris en charge par l’envoi automatique.`,
        permanent: true,
      };
    } else if (!template || !template.active) {
      outcome = { error: 'Modèle désactivé dans le back-office : envoi annulé.', permanent: true };
    } else if (!booking) {
      outcome = { error: 'Demande introuvable.', permanent: true };
    } else if (!EMAIL_PATTERN.test(row.recipient)) {
      outcome = { error: 'Adresse du destinataire invalide.', permanent: true };
    } else {
      outcome = await deliver(row, template, booking);
    }
    await complete(row, outcome);
    if ('providerId' in outcome) sent += 1;
    else {
      failed += 1;
      console.error(`E-mail ${row.id} (${row.template_key}) : ${outcome.error}`);
    }
  }
  return json({ traites: rows.length, envoyes: sent, echecs: failed });

  async function deliver(row: OutboxRow, template: TemplateRow, booking: MailBooking): Promise<Outcome> {
    try {
      const mail = renderOutboxEmail(row.template_key as OutboxTemplateKey, {
        content: {
          subject: template.subject,
          heading: template.heading,
          body: template.body,
          senderName: template.sender_name,
          replyTo: template.reply_to,
        },
        booking,
        settings,
        services,
        siteUrl,
      });
      if (deliveries > 0) await sleep(SEND_INTERVAL_MS);
      deliveries += 1;
      return await sendWithResend(apiKey, `outbox-${row.id}`, {
        from: `${senderName(template.sender_name)} <${fromAddress}>`,
        to: row.recipient,
        replyTo: EMAIL_PATTERN.test(template.reply_to) ? template.reply_to : null,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        tag: row.template_key,
      });
    } catch (error) {
      return {
        error: `Rendu impossible : ${error instanceof Error ? error.message : String(error)}`,
        permanent: true,
      };
    }
  }
});
