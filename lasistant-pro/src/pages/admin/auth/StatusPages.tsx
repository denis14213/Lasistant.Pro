import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { Button, Pill, TextLink, ToValidate } from '@/components/ui';
import { IconArrowLeft, IconClock, IconLock } from '@/components/ui/icons';
import { IconExpired, IconHyperlinkBroken } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { AuthHeading } from '@/features/auth/AuthParts';
import { getLockedUntil } from '@/features/auth/auth-service';
import { readLastLoginEmail } from '@/features/auth/last-login-email';
import { LoginForm } from '@/features/auth/LoginForm';
import { useCountdown } from '@/hooks/useNow';

/**
 * Écrans d'information de l'authentification : session expirée, lien expiré, compte verrouillé.
 */

export function SessionExpiredScreen() {
  const [email] = useState(readLastLoginEmail);
  return (
    <>
      <Seo title="Session expirée" description="Votre session a expiré." noIndex />
      <AuthHeading icon={<IconExpired />} iconTone="neutral" title="Votre session a expiré">
        Par sécurité, vous avez été déconnecté(e) après 30 minutes d’inactivité{' '}
        <ToValidate>durée à valider</ToValidate>. Reconnectez-vous pour reprendre là où vous en étiez.
      </AuthHeading>
      <LoginForm submitLabel="Se reconnecter" defaultEmail={email} />
      <p className="text-[13.5px] text-muted">
        Les modifications non enregistrées ont été conservées dans un brouillon.
      </p>
    </>
  );
}

export function LinkExpiredScreen() {
  const navigate = useNavigate();
  return (
    <div role="alert" className="flex flex-col gap-7">
      <Seo title="Lien expiré" description="Ce lien n’est plus valide." noIndex />
      <AuthHeading icon={<IconHyperlinkBroken />} iconTone="danger" title="Ce lien n’est plus valide">
        Le lien de réinitialisation a expiré ou a déjà été utilisé. Demandez-en un nouveau pour choisir votre
        mot de passe.
      </AuthHeading>
      <Button size="lg" block shape="rounded" onClick={() => navigate(ROUTES.admin.forgotPassword)}>
        Demander un nouveau lien
      </Button>
      <TextLink to={ROUTES.admin.login} icon={<IconArrowLeft />} className="mx-auto">
        Retour à la connexion
      </TextLink>
    </div>
  );
}

export function AccountLockedScreen() {
  const navigate = useNavigate();
  const [lockedUntil] = useState(() => getLockedUntil());
  const countdown = useCountdown(lockedUntil);
  return (
    <div role="alert" className="flex flex-col gap-7">
      <Seo title="Compte verrouillé" description="Compte temporairement verrouillé." noIndex />
      <AuthHeading icon={<IconLock />} iconTone="warning" title="Compte temporairement verrouillé">
        Trop de tentatives de connexion échouées. Pour votre sécurité, l’accès à ce compte est bloqué pendant
        15 minutes <ToValidate>durée à valider</ToValidate>.
      </AuthHeading>
      {countdown ? (
        <Pill icon={<IconClock />} className="w-fit">
          Réessayer dans {countdown}
        </Pill>
      ) : (
        <TextLink to={ROUTES.admin.login}>Vous pouvez de nouveau vous connecter</TextLink>
      )}
      <Button size="lg" block shape="rounded" onClick={() => navigate(ROUTES.admin.forgotPassword)}>
        Réinitialiser mon mot de passe
      </Button>
      <p className="text-[13.5px] text-muted">
        Ce n’était pas vous ? Prévenez immédiatement un administrateur.
      </p>
    </div>
  );
}
