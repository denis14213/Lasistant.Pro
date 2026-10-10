import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import type { AccountActivity, AdminUser, NotificationPreferences } from '@/types';
import type { AccountRepository } from '../../contracts';
import { DataError } from '../../errors';
import { getSupabase } from '../client';
import { ensureOk, guard, toDataError, unwrap } from '../errors';
import { toAdminUser } from '../mappers';

/** Nombre d'actions affichées dans « Activité récente ». */
const ACTIVITY_LIMIT = 6;

async function loadUser(userId: string): Promise<AdminUser> {
  const result = await guard(() => getSupabase().from('admin_users').select('*').eq('id', userId).single());
  return toAdminUser(unwrap(result));
}

/**
 * Vérifie le mot de passe actuel sans toucher à la session en cours : connexion sur un client
 * éphémère (mémoire seule), aussitôt refermée.
 */
async function verifyPassword(email: string, password: string): Promise<boolean> {
  const verifier = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'lp-auth-verification',
    },
  });
  const { error } = await verifier.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === 'invalid_credentials' || error.status === 400) return false;
    throw toDataError(error);
  }
  await verifier.auth.signOut({ scope: 'local' });
  return true;
}

/**
 * Compte de la personne connectée (« Mon compte »).
 * Mot de passe, adresse de connexion et double authentification passent par Supabase Auth ;
 * le profil et les préférences sont dans la table « admin_users ».
 */
export const accountRepository: AccountRepository = {
  get: loadUser,

  /** Nouvelle adresse : appliquée après confirmation par e-mail (la fiche suit automatiquement). */
  async updateProfile(userId, profile) {
    const current = await loadUser(userId);
    const email = profile.email.trim().toLowerCase();
    const result = await guard(() =>
      getSupabase()
        .from('admin_users')
        .update({ name: profile.name.trim() })
        .eq('id', userId)
        .select('*')
        .single(),
    );
    const updated = toAdminUser(unwrap(result));
    if (email !== current.email) {
      const { error } = await getSupabase().auth.updateUser({ email });
      if (error) {
        throw new DataError(
          error.code === 'email_exists' ? 'validation' : 'server',
          error.code === 'email_exists'
            ? 'Cette adresse est déjà utilisée par un autre compte.'
            : 'Le nom est enregistré, mais la nouvelle adresse n’a pas pu être confirmée par e-mail. Réessayez plus tard.',
        );
      }
    }
    return updated;
  },

  async updateNotifications(userId, patch) {
    const current = await loadUser(userId);
    const notifications: NotificationPreferences = { ...current.notifications, ...patch };
    const result = await guard(() =>
      getSupabase()
        .from('admin_users')
        .update({ notifications: { ...notifications } })
        .eq('id', userId)
        .select('*')
        .single(),
    );
    return toAdminUser(unwrap(result));
  },

  async changePassword(userId, current, next) {
    const user = await loadUser(userId);
    if (!(await verifyPassword(user.email, current))) {
      throw new DataError('validation', 'Le mot de passe actuel est incorrect.');
    }
    const { error } = await getSupabase().auth.updateUser({ password: next });
    if (error) {
      if (error.code === 'same_password') {
        throw new DataError('validation', 'Choisissez un mot de passe différent de l’actuel.');
      }
      if (error.code === 'weak_password') {
        throw new DataError(
          'validation',
          'Ce mot de passe est trop faible ou figure parmi les mots de passe divulgués.',
        );
      }
      throw toDataError(error);
    }
    ensureOk(await guard(() => getSupabase().rpc('mark_password_changed')));
    return loadUser(userId);
  },

  async startTwoFactor() {
    const auth = getSupabase().auth;
    // Une configuration commencée puis abandonnée est retirée avant d'en créer une nouvelle.
    const { data: factors } = await auth.mfa.listFactors();
    for (const factor of factors?.all ?? []) {
      if (factor.factor_type === 'totp' && factor.status === 'unverified') {
        await auth.mfa.unenroll({ factorId: factor.id });
      }
    }
    const { data, error } = await auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'LASISTANT.PRO',
      friendlyName: `Application d’authentification ${new Date().toISOString()}`,
    });
    if (error || !data) throw toDataError(error);
    return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  },

  async confirmTwoFactor(userId, factorId, code) {
    const { error } = await getSupabase().auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      throw new DataError(
        'validation',
        'Ce code est incorrect ou a expiré. Saisissez le code actuellement affiché par votre application.',
      );
    }
    return loadUser(userId);
  },

  async disableTwoFactor(userId) {
    const auth = getSupabase().auth;
    const { data: factors, error } = await auth.mfa.listFactors();
    if (error) throw toDataError(error);
    for (const factor of factors?.all ?? []) {
      const result = await auth.mfa.unenroll({ factorId: factor.id });
      if (result.error) throw toDataError(result.error);
    }
    await auth.refreshSession();
    return loadUser(userId);
  },

  async regenerateRecoveryCodes() {
    const result = await guard(() => getSupabase().rpc('regenerate_recovery_codes'));
    return unwrap(result);
  },

  /**
   * L'API d'authentification ne permet pas de lister les autres appareils : seule la session
   * en cours est affichée, et les autres peuvent être déconnectées en une fois.
   */
  async listSessions() {
    return [];
  },

  async revokeSessions() {
    const { error } = await getSupabase().auth.signOut({ scope: 'others' });
    if (error) throw toDataError(error);
  },

  /** Actions récentes : dernière connexion, demandes traitées, journal d'activité. */
  async activity(userId) {
    const supabase = getSupabase();
    const [user, events, entries] = await Promise.all([
      guard(() => supabase.from('admin_users').select('last_login_at').eq('id', userId).single()),
      guard(() =>
        supabase
          .from('booking_events')
          .select('id, label, created_at, bookings(reference)')
          .eq('actor_id', userId)
          .neq('type', 'viewed')
          .order('created_at', { ascending: false })
          .limit(ACTIVITY_LIMIT),
      ),
      guard(() =>
        supabase
          .from('activity_log')
          .select('*')
          .eq('actor_id', userId)
          .order('created_at', { ascending: false })
          .limit(ACTIVITY_LIMIT),
      ),
    ]);

    const lastLoginAt = unwrap(user).last_login_at;
    const items: AccountActivity[] = [
      ...(lastLoginAt
        ? [
            {
              id: 'connexion',
              label: 'Dernière connexion au back-office',
              createdAt: lastLoginAt,
              kind: 'login' as const,
            },
          ]
        : []),
      ...unwrap(events).map((event) => ({
        id: event.id,
        label: `${event.label} · ${event.bookings?.reference ?? 'demande supprimée'}`,
        createdAt: event.created_at,
        kind: 'request' as const,
      })),
      ...unwrap(entries).map((entry) => ({
        id: entry.id,
        label: entry.label,
        createdAt: entry.created_at,
        kind: entry.kind,
      })),
    ];
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, ACTIVITY_LIMIT);
  },
};
