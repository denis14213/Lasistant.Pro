import { ROUTES } from '@/config/routes';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type { AuthSession } from '@/types';
import type { AuthBackend, ResetLinkKind } from '../contracts';
import { DataError } from '../errors';
import { consumeAuthRedirect, getSupabase, hasStoredAuthSession, setSessionPersistence } from './client';
import { toDataError } from './errors';
import { invokeFunction } from './functions';

/**
 * Authentification du back-office avec Supabase Auth.
 *
 * - Mot de passe : `signInWithPassword` ; un compte sans fiche d'équipe active est refusé.
 * - Double authentification (TOTP) : exigée dès qu'un facteur est configuré ; la session
 *   n'atteint le niveau « aal2 » qu'après le code, et la base refuse tout accès aux
 *   données en dessous de ce niveau (voir `app_private.staff_role`).
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

/** Session complète (niveau requis atteint) : la connexion est enregistrée. */
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

    const { data: level } = await auth.mfa.getAuthenticatorAssuranceLevel();
    if (level?.nextLevel === 'aal2' && level.currentLevel !== 'aal2') return { status: 'two-factor' };

    const session = await completeSignIn();
    return session ? { status: 'authenticated', session } : { status: 'inactive' };
  },

  async verifyTwoFactor(code) {
    const auth = getSupabase().auth;
    const { data: factors, error } = await auth.mfa.listFactors();
    if (error) throw toDataError(error);
    const factor = factors.totp[0];
    if (!factor) return null;
    const verified = await auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (verified.error) return null;
    return completeSignIn();
  },

  async redeemRecoveryCode(code) {
    try {
      await invokeFunction('equipe', { action: 'code-de-secours', code });
    } catch (error) {
      if (error instanceof DataError && error.code === 'validation') return null;
      throw error;
    }
    // Le facteur a été retiré : la session rafraîchie n'exige plus de second code.
    await getSupabase().auth.refreshSession();
    return completeSignIn();
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
    // Connexion complète ensuite (avec la double authentification si elle est configurée).
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
