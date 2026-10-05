import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { Button, Callout, ToValidate } from '@/components/ui';
import { IconArrowRight, IconEmail, IconInfo } from '@/components/ui/icons';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { AuthHeading } from '@/features/auth/AuthParts';
import { requestPasswordReset } from '@/features/auth/auth-service';
import { useToast } from '@/features/toasts/toast-context';
import { useCountdown } from '@/hooks/useNow';

/** Délai avant de pouvoir redemander un e-mail. */
const RESEND_DELAY_MS = 60_000;
const nextResendAt = () => new Date(Date.now() + RESEND_DELAY_MS).toISOString();

/** Confirmation d'envoi du lien de réinitialisation. */
export function Component() {
  const location = useLocation();
  const toast = useToast();
  const email = (location.state as { email?: string } | null)?.email ?? null;
  const [resendAt, setResendAt] = useState(nextResendAt);
  const countdown = useCountdown(resendAt);

  const resend = async () => {
    if (email) await requestPasswordReset(email);
    setResendAt(nextResendAt());
    toast.info('Si un compte existe pour cette adresse, un nouvel e-mail vient d’être envoyé.');
  };

  return (
    <>
      <Seo title="Vérifiez votre boîte de réception" description="Lien de réinitialisation envoyé." noIndex />
      <div role="status" className="flex flex-col gap-7">
        <AuthHeading icon={<IconEmail />} iconTone="success" title="Vérifiez votre boîte de réception">
          Si un compte existe pour {email ? <strong className="text-ink">{email}</strong> : 'cette adresse'},
          un e-mail contenant un lien de réinitialisation vient d’être envoyé. Le lien est valable 30 minutes{' '}
          <ToValidate>durée à valider</ToValidate>.
        </AuthHeading>
        <Callout tone="privacy" size="sm" icon={<IconInfo />}>
          Rien reçu ? Vérifiez vos courriers indésirables.
        </Callout>
        <Button
          variant="outline"
          block
          shape="rounded"
          disabled={countdown !== null}
          onClick={() => void resend()}
        >
          {countdown ? `Renvoyer l’e-mail dans ${countdown}` : 'Renvoyer l’e-mail'}
        </Button>
        {env.dataSource === 'mock' ? (
          <Link
            to={ROUTES.admin.resetPassword}
            className="mx-auto inline-flex items-center gap-2 font-semibold text-brand hover:underline"
          >
            Simuler l’ouverture du lien (démonstration)
            <IconArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </>
  );
}
