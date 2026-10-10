// Edge Function « equipe » : opérations sur les comptes qui exigent l'API d'administration
// de Supabase Auth (clé secrète, jamais exposée au navigateur).
//
//   POST /functions/v1/equipe
//   { "action": "inviter", "email": "…", "role": "editeur", "redirectTo": "https://…" }
//   { "action": "renvoyer-invitation", "userId": "…", "redirectTo": "https://…" }
//
// Réservée aux administrateurs dont la session a été vérifiée par le code reçu par e-mail
// (double authentification, Edge Function « code-connexion »).
//
// Réponse : { "data": … } (2xx) ou { "error": { "code": "…", "message": "…" } } (4xx/5xx).
// Les messages d'erreur sont destinés à l'utilisateur (affichés tels quels dans le back-office).
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

type Role = 'administrateur' | 'editeur' | 'operateur';
type ErrorCode = 'validation' | 'forbidden' | 'not_found' | 'server' | 'unauthorized';

const ROLES: readonly Role[] = ['administrateur', 'editeur', 'operateur'];
const ROLE_LABELS: Record<Role, string> = {
  administrateur: 'Administrateur',
  editeur: 'Éditeur',
  operateur: 'Opérateur',
};
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
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

interface Caller {
  user: User;
  token: string;
  member: { id: string; name: string; role: Role; active: boolean };
}

/** Clé publique du projet (appel d'une route au nom de la personne connectée). */
function publicKey(): string {
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  return keys ? JSON.parse(keys).default : Deno.env.get('SUPABASE_ANON_KEY')!;
}

/** La session de la personne connectée a-t-elle été vérifiée par le code reçu par e-mail ? */
async function sessionVerified(token: string): Promise<boolean> {
  const client = createClient(Deno.env.get('SUPABASE_URL')!, publicKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.rpc('second_factor_verified');
  return !error && data === true;
}

/** Personne à l'origine de la requête (jeton de session vérifié par Supabase Auth). */
async function requireCaller(request: Request, admin: SupabaseClient): Promise<Caller> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'unauthorized', 'Votre session a expiré. Reconnectez-vous.');

  const { data: claimsData, error: claimsError } = await admin.auth.getClaims(token);
  const claims = claimsData?.claims;
  if (claimsError || !claims?.sub) {
    throw new HttpError(401, 'unauthorized', 'Votre session a expiré. Reconnectez-vous.');
  }
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(claims.sub);
  if (userError || !userData.user) {
    throw new HttpError(401, 'unauthorized', 'Votre session a expiré. Reconnectez-vous.');
  }

  const { data: member } = await admin
    .from('admin_users')
    .select('id, name, role, active')
    .eq('id', claims.sub)
    .maybeSingle();
  if (!member || !member.active) {
    throw new HttpError(403, 'forbidden', 'Votre compte n’a pas accès au back-office.');
  }
  return { user: userData.user, token, member };
}

/** Administrateur actif dont la session a été vérifiée par le code reçu par e-mail. */
async function requireAdministrator(request: Request, admin: SupabaseClient): Promise<Caller> {
  const caller = await requireCaller(request, admin);
  if (caller.member.role !== 'administrateur') {
    throw new HttpError(403, 'forbidden', 'Votre rôle ne permet pas d’effectuer cette action.');
  }
  if (!(await sessionVerified(caller.token))) {
    throw new HttpError(403, 'forbidden', 'Validez d’abord le code de connexion reçu par e-mail.');
  }
  return caller;
}

function displayNameFrom(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function requireRedirect(value: unknown): string {
  if (typeof value !== 'string' || !/^https?:\/\//.test(value)) {
    throw new HttpError(400, 'validation', 'Adresse de retour invalide.');
  }
  return value;
}

/**
 * Envoie l'e-mail d'invitation. Si l'envoi échoue (serveur d'e-mails non configuré),
 * un lien d'activation est généré pour être transmis par l'administrateur.
 */
async function sendInvitation(
  admin: SupabaseClient,
  email: string,
  redirectTo: string,
  name: string,
  existingUser: boolean,
): Promise<{ user: User; emailSent: boolean; invitationLink: string | null }> {
  if (!existingUser) {
    const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo, data: { name } });
    if (!invited.error && invited.data.user) {
      return { user: invited.data.user, emailSent: true, invitationLink: null };
    }
    console.warn('Invitation par e-mail impossible :', invited.error?.message);
  }

  const lookup = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const known = lookup.data?.users.find((candidate) => candidate.email?.toLowerCase() === email);
  const link = await admin.auth.admin.generateLink(
    known
      ? { type: 'recovery', email, options: { redirectTo } }
      : { type: 'invite', email, options: { redirectTo, data: { name } } },
  );
  if (link.error || !link.data.user) {
    throw new HttpError(500, 'server', 'L’invitation n’a pas pu être créée. Réessayez dans un instant.');
  }
  return { user: link.data.user, emailSent: false, invitationLink: link.data.properties.action_link };
}

async function invite(request: Request, admin: SupabaseClient, body: Record<string, unknown>) {
  const caller = await requireAdministrator(request, admin);
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const role = body.role as Role;
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    throw new HttpError(400, 'validation', 'Saisissez une adresse e-mail valide.');
  }
  if (!ROLES.includes(role)) throw new HttpError(400, 'validation', 'Rôle inconnu.');
  const redirectTo = requireRedirect(body.redirectTo);

  const { data: existing } = await admin.from('admin_users').select('id').eq('email', email).maybeSingle();
  if (existing) throw new HttpError(409, 'validation', 'Un compte existe déjà avec cette adresse.');

  const name = displayNameFrom(email);
  const result = await sendInvitation(admin, email, redirectTo, name, false);
  const { data: member, error } = await admin
    .from('admin_users')
    .upsert({
      id: result.user.id,
      name,
      email,
      role,
      active: false,
      invitation_sent_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new HttpError(500, 'server', 'Le compte n’a pas pu être enregistré.');

  await admin.from('activity_log').insert({
    actor: caller.member.name,
    actor_id: caller.member.id,
    label: `Invitation envoyée à ${email} (${ROLE_LABELS[role]})`,
    kind: 'team',
  });
  return { member, emailSent: result.emailSent, invitationLink: result.invitationLink };
}

async function resendInvitation(request: Request, admin: SupabaseClient, body: Record<string, unknown>) {
  const caller = await requireAdministrator(request, admin);
  const redirectTo = requireRedirect(body.redirectTo);
  const { data: member } = await admin
    .from('admin_users')
    .select('*')
    .eq('id', String(body.userId ?? ''))
    .maybeSingle();
  if (!member) throw new HttpError(404, 'not_found', 'Ce compte est introuvable.');
  if (member.last_login_at) {
    throw new HttpError(400, 'validation', 'Ce compte est déjà activé : aucune invitation à renvoyer.');
  }

  const result = await sendInvitation(admin, member.email, redirectTo, member.name, true);
  const { data: updated } = await admin
    .from('admin_users')
    .update({ invitation_sent_at: new Date().toISOString() })
    .eq('id', member.id)
    .select('*')
    .single();
  await admin.from('activity_log').insert({
    actor: caller.member.name,
    actor_id: caller.member.id,
    label: `Invitation renvoyée à ${member.email}`,
    kind: 'team',
  });
  return { member: updated ?? member, emailSent: result.emailSent, invitationLink: result.invitationLink };
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
      case 'inviter':
        return json({ data: await invite(request, admin, body) });
      case 'renvoyer-invitation':
        return json({ data: await resendInvitation(request, admin, body) });
      default:
        return json({ error: { code: 'validation', message: 'Action inconnue.' } }, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: { code: error.code, message: error.message } }, error.status);
    }
    console.error(error);
    return json(
      { error: { code: 'server', message: 'Un problème technique empêche cette opération. Réessayez.' } },
      500,
    );
  }
});
