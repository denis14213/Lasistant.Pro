import { ROUTES } from '@/config/routes';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AuthSession } from '@/types';
import type { AuthBackend, ResetLinkKind, TwoFactorDelivery } from '../contracts';
import { DataError } from '../errors';
import { consumeAuthRedirect, getSupabase, hasStoredAuthSession, setSessionPersistence } from './client';
import { toDataError } from './errors';
import { invokeFunction } from './functions';

/**
 * Authentification du back-office avec Supabase Auth.
 *
 * - Mot de passe : `signInWithPassword` ; un compte sans fiche d'équipe active est refusé.
 * - Double authentification : après le mot de passe, un code à 6 chiffres est envoyé par
 *   e-mail (Edge Function « code-connexion », service Resend). La base ne donne accès aux
 *   données qu'aux sessions vérifiées par ce code (voir `app_private.staff_role`).
 * - Liens reçus par e-mail (réinitialisation, invitation) : jetons lus dans l'adresse.
 */

/** Lien de réinitialisation ou d'invitation ouvert dans cet onglet (survit à un rechargement). */
const RESET_LINK_KEY = 'lp-lien-auth';

async function memberSession(userId: string): Promise<AuthSession | null> {
  const { data, error } = await getSupabase()
    .from('admin_users')
    .select('id, name, email, role, active')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw toDataError(error);
  if (!data || !data.active) return null;
  const now = new Date().toISOString();
  return {
    userId: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    startedAt: now,
    lastActivityAt: now,
  };
}

/** Envoi d'un code par e-mail ; une limitation en cours n'empêche pas d'afficher l'écran du code. */
async function sendCode(): Promise<TwoFactorDelivery> {
  try {
    return await invokeFunction<TwoFactorDelivery>('code-connexion', { action: 'envoyer' });
  } catch (error) {
    if (error instanceof DataError && error.code === 'rate_limited') {
      return { destination: null, retryAt: error.retryAt };
    }
    throw error;
  }
}

/** Session complète (code vérifié) : la connexion est enregistrée. */
async function completeSignIn(): Promise<AuthSession | null> {
  const { data } = await getSupabase().auth.getUser();
  if (!data.user) return null;
  const session = await memberSession(data.user.id);
  if (!session) {
    await getSupabase().auth.signOut({ scope: 'local' });
    return null;
  }
  await getSupabase().rpc('record_login');
  return session;
}

export const supabaseAuthBackend: AuthBackend = {
  async signIn(email, password, remember) {
    const auth = getSupabase().auth;
    setSessionPersistence(remember);
    const { data, error } = await auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      if (error.code === 'invalid_credentials' || error.status === 400) return { status: 'invalid' };
      if (error.code === 'email_not_confirmed') return { status: 'inactive' };
      if (error.status === 429) {
        throw new DataError(
          'rate_limited',
          'Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer.',
        );
      }
      throw toDataError(error);
    }

    const member = await memberSession(data.user.id);
    if (!member) {
      await auth.signOut({ scope: 'local' });
      return { status: 'inactive' };
    }

    return { status: 'two-factor', delivery: await sendCode() };
  },

  async verifyTwoFactor(code) {
    const result = await invokeFunction<{ ok: boolean; reason?: string }>('code-connexion', {
      action: 'verifier',
      code,
    });
    if (result.ok) return completeSignIn();
    if (result.reason === 'too_many') {
      throw new DataError('rate_limited', 'Trop d’essais avec ce code. Demandez un nouveau code.');
    }
    if (result.reason === 'expired') {
      throw new DataError('validation', 'Ce code a expiré ou a été remplacé. Demandez un nouveau code.');
    }
    return null;
  },

  resendTwoFactorCode: () => invokeFunction<TwoFactorDelivery>('code-connexion', { action: 'envoyer' }),

  async isSecondFactorVerified() {
    const { data, error } = await getSupabase().rpc('second_factor_verified');
    if (error) return false;
    return data === true;
  },

  async requestPasswordReset(email) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}${ROUTES.admin.resetPassword}`,
    });
    // Même réponse que le compte existe ou non : seule une limitation est signalée.
    if (error?.status === 429) {
      throw new DataError(
        'rate_limited',
        'Plusieurs demandes ont été faites en peu de temps. Réessayez dans quelques minutes.',
      );
    }
    if (error) console.warn('Réinitialisation du mot de passe :', error.message);
  },

  async checkResetLink() {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const redirect = consumeAuthRedirect();
    if (redirect?.error) {
      removeStorage(RESET_LINK_KEY, 'session');
      return null;
    }
    if (redirect?.type === 'recovery' || redirect?.type === 'invite') {
      writeStorage<ResetLinkKind>(RESET_LINK_KEY, redirect.type, 'session');
    }
    const kind = readStorage<ResetLinkKind | null>(RESET_LINK_KEY, null, 'session');
    return data.session && kind ? kind : null;
  },

  async completePasswordReset(password) {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return { ok: false, reason: 'expired', message: 'Ce lien a expiré ou a déjà été utilisé.' };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return {
        ok: false,
        reason: 'rejected',
        message:
          error.code === 'same_password'
            ? 'Choisissez un mot de passe différent de l’ancien.'
            : error.code === 'weak_password'
              ? 'Ce mot de passe est trop faible ou figure parmi les mots de passe divulgués.'
              : 'Le mot de passe n’a pas pu être enregistré. Réessayez.',
      };
    }
    await supabase.rpc('mark_password_changed');
    removeStorage(RESET_LINK_KEY, 'session');
    // Connexion complète ensuite (mot de passe, puis code reçu par e-mail).
    await supabase.auth.signOut({ scope: 'local' });
    return { ok: true };
  },

  async signOut() {
    await getSupabase().auth.signOut({ scope: 'local' });
  },

  hasActiveSession: hasStoredAuthSession,

  onSignedOut(listener) {
    const { data } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') listener();
    });
    return () => data.subscription.unsubscribe();
  },
};
