// Edge Function « code-connexion » : double authentification par code envoyé par e-mail.
//
//   POST /functions/v1/code-connexion   (jeton de session de l'utilisateur, après le mot de passe)
//   { "action": "envoyer" }                    → { data: { destination, expiresAt, retryAt } }
//   { "action": "verifier", "code": "123456" } → { data: { ok, reason?, remaining? } }
//
// Le code est généré, limité et vérifié par la base (login_code_issue / login_code_verify,
// clé secrète uniquement) ; il est lié à la session de connexion et n'est jamais conservé en
// clair. L'e-mail part par Resend (clé du coffre), jamais par le serveur d'e-mails de Supabase.
// Limitations (base) : 1 envoi par minute, 5 par heure et par compte, 20 par heure et par
// adresse IP, 5 essais par code, plus d'envoi pendant une heure après 10 essais erronés.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const FROM = 'LASISTANT.PRO <securite@adbm-school.com>';
/** Durée de validité d'une session vérifiée (heures). */
const VERIFIED_HOURS = 720;
const CODE_PATTERN = /^\d{6}$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryAt: string | null = null,
  ) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function adminClient(): SupabaseClient {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  const secretKey = secretKeys ? JSON.parse(secretKeys).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(Deno.env.get('SUPABASE_URL')!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** « marie.dupont@exemple.com » → « m•••••••t@exemple.com ». */
function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  if (local.length <= 2) return `${local.charAt(0)}•@${domain}`;
  return `${local.charAt(0)}${'•'.repeat(Math.min(local.length - 2, 8))}${local.charAt(local.length - 1)}@${domain}`;
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Personne connectée (mot de passe vérifié) et session concernée. */
async function requireCaller(request: Request, admin: SupabaseClient) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'unauthorized', 'Votre session a expiré. Reconnectez-vous.');
  const { data, error } = await admin.auth.getClaims(token);
  const claims = data?.claims as { sub?: string; session_id?: string } | undefined;
  if (error || !claims?.sub || !claims.session_id) {
    throw new HttpError(401, 'unauthorized', 'Votre session a expiré. Reconnectez-vous.');
  }
  const { data: member } = await admin
    .from('admin_users')
    .select('id, name, email, active')
    .eq('id', claims.sub)
    .maybeSingle();
  if (!member || !member.active)
    throw new HttpError(403, 'forbidden', 'Ce compte n’a pas accès au back-office.');
  return {
    userId: claims.sub,
    sessionId: claims.session_id,
    name: member.name as string,
    email: member.email as string,
  };
}

function emailContent(name: string, code: string) {
  const first = name.split(' ')[0] || name;
  const html =
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>Votre code de connexion</title></head><body style="margin:0;padding:0;background:#ECEAF0">` +
    `<div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#17151C;padding:40px 16px">` +
    `<div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:18px;overflow:hidden">` +
    `<div style="height:6px;background:linear-gradient(90deg,#7A1FA0,#B526D9 70%,#2BB24C)"></div>` +
    `<div style="padding:36px 36px 30px">` +
    `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#177A2E">Connexion au back-office</p>` +
    `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;font-weight:600">Bonjour ${esc(first)}, voici votre code</h1>` +
    `<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4A4553">Saisissez ce code pour terminer votre connexion à LASISTANT.PRO. Il est valable 10 minutes et ne sert qu’une fois.</p>` +
    `<p style="margin:0 0 22px;text-align:center"><span style="display:inline-block;background:#F3E6F8;color:#5E1680;font-size:34px;font-weight:700;letter-spacing:.32em;padding:14px 22px 14px 30px;border-radius:14px;font-family:Consolas,monospace">${code}</span></p>` +
    `<p style="margin:0;font-size:13.5px;line-height:1.6;color:#5F5A69">Vous n’êtes pas à l’origine de cette connexion ? Ne communiquez ce code à personne et changez votre mot de passe depuis « Mon compte ». L’équipe LASISTANT.PRO ne vous demandera jamais ce code.</p>` +
    `</div></div></div></body></html>`;
  const text =
    `Bonjour ${first},\n\nVotre code de connexion au back-office LASISTANT.PRO : ${code}\n\n` +
    `Il est valable 10 minutes et ne sert qu’une fois.\n\n` +
    `Vous n’êtes pas à l’origine de cette connexion ? Ne communiquez ce code à personne et changez votre mot de passe depuis « Mon compte ».`;
  return { html, text };
}

async function send(request: Request, admin: SupabaseClient) {
  const caller = await requireCaller(request, admin);
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '';
  const issued = await admin.rpc('login_code_issue', {
    p_user: caller.userId,
    p_session: caller.sessionId,
    p_ip: ip,
  });
  if (issued.error) {
    if (issued.error.message === 'rate_limited') {
      throw new HttpError(
        429,
        'rate_limited',
        'Plusieurs codes ont déjà été demandés. Patientez avant d’en demander un nouveau.',
        issued.error.details ?? null,
      );
    }
    console.error('login_code_issue :', issued.error.message);
    throw new HttpError(500, 'server', 'Le code n’a pas pu être préparé. Réessayez dans un instant.');
  }
  const { code, expiresAt, retryAt } = issued.data as { code: string; expiresAt: string; retryAt: string };

  const key = await admin.rpc('login_mailer_key');
  if (key.error || !key.data) throw new HttpError(500, 'server', 'L’envoi des codes n’est pas configuré.');
  const { html, text } = emailContent(caller.name, code);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key.data}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [caller.email],
      subject: 'Votre code de connexion LASISTANT.PRO',
      html,
      text,
      tags: [{ name: 'modele', value: 'code-connexion' }],
    }),
  });
  if (!response.ok) {
    console.error('Resend :', response.status, await response.text().catch(() => ''));
    throw new HttpError(502, 'server', 'Le code n’a pas pu être envoyé. Réessayez dans un instant.');
  }
  return { destination: maskEmail(caller.email), expiresAt, retryAt };
}

async function verify(request: Request, admin: SupabaseClient, body: Record<string, unknown>) {
  const caller = await requireCaller(request, admin);
  const code = String(body.code ?? '').trim();
  if (!CODE_PATTERN.test(code)) return { ok: false, reason: 'invalid' };
  const result = await admin.rpc('login_code_verify', {
    p_user: caller.userId,
    p_session: caller.sessionId,
    p_code: code,
    p_validity_hours: VERIFIED_HOURS,
  });
  if (result.error) {
    console.error('login_code_verify :', result.error.message);
    throw new HttpError(500, 'server', 'Le code n’a pas pu être vérifié. Réessayez.');
  }
  return result.data as { ok: boolean; reason?: string; remaining?: number };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return json({ error: { code: 'validation', message: 'Méthode non prise en charge.' } }, 405);
  }
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const admin = adminClient();
    switch (body.action) {
      case 'envoyer':
        return json({ data: await send(request, admin) });
      case 'verifier':
        return json({ data: await verify(request, admin, body) });
      default:
        return json({ error: { code: 'validation', message: 'Action inconnue.' } }, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json(
        { error: { code: error.code, message: error.message, retryAt: error.retryAt } },
        error.status,
      );
    }
    console.error(error);
    return json(
      { error: { code: 'server', message: 'Un problème technique empêche cette opération.' } },
      500,
    );
  }
});
