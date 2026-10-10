import { useEffect, useId, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { getErrorMessage, isDataError } from '@/api';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui';
import { FieldError } from '@/components/ui/form';
import { IconArrowRight, IconEmail } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth/auth-context';
import { AuthHeading, OneTimeCodeInput } from '@/features/auth/AuthParts';
import {
  cancelPendingLogin,
  pendingTwoFactorDelivery,
  resendTwoFactorCode,
} from '@/features/auth/auth-service';
import { REDIRECT_PARAM, safeRedirect } from '@/features/auth/session-guards';
import { useToast } from '@/features/toasts/toast-context';

/** Secondes restantes avant de pouvoir demander un nouveau code (0 : possible). */
function secondsUntil(retryAt: string | null, now: number): number {
  if (!retryAt) return 0;
  return Math.max(0, Math.ceil((new Date(retryAt).getTime() - now) / 1000));
}

function formatWait(seconds: number): string {
  if (seconds <= 90) return `${seconds} s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

/**
 * Double authentification : code à 6 chiffres envoyé par e-mail après le mot de passe.
 * La base n'ouvre aucun accès aux données tant que ce code n'a pas été validé.
 */
export function Component() {
  const { verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [delivery, setDelivery] = useState(() => pendingTwoFactorDelivery());
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const errorId = useId();

  const wait = secondsUntil(delivery?.retryAt ?? null, now);
  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [wait]);

  // Sans mot de passe vérifié au préalable, retour à la connexion.
  if (!delivery) return <Navigate to={ROUTES.admin.login} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!/^\d{6}$/.test(value)) {
      setError('Saisissez les 6 chiffres du code reçu par e-mail.');
      return;
    }
    setSubmitting(true);
    try {
      const valid = await verifyTwoFactor(value);
      if (!valid) {
        setError('Code incorrect. Vérifiez le dernier e-mail reçu et réessayez.');
        setCode('');
        return;
      }
      navigate(safeRedirect(searchParams.get(REDIRECT_PARAM)), { replace: true });
    } catch (failure) {
      setError(getErrorMessage(failure));
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    try {
      const next = await resendTwoFactorCode();
      setDelivery(next);
      setNow(Date.now());
      toast.success('Un nouveau code vient de vous être envoyé.');
    } catch (failure) {
      if (isDataError(failure, 'rate_limited') && failure.retryAt) {
        setDelivery((current) => (current ? { ...current, retryAt: failure.retryAt } : current));
        setNow(Date.now());
      }
      setError(getErrorMessage(failure));
    } finally {
      setResending(false);
    }
  };

  const changeAccount = async () => {
    await cancelPendingLogin();
    navigate(ROUTES.admin.login, { replace: true });
  };

  return (
    <>
      <Seo
        title="Vérification en deux étapes"
        description="Double authentification du back-office."
        noIndex
      />
      <form
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        aria-labelledby="titre-2fa"
        className="flex flex-col gap-7"
      >
        <AuthHeading icon={<IconEmail />} title="Vérification en deux étapes" titleId="titre-2fa">
          {delivery.destination ? (
            <>
              Un code à 6 chiffres vient d’être envoyé à <strong>{delivery.destination}</strong>. Il est
              valable 10 minutes.
            </>
          ) : (
            'Saisissez le code à 6 chiffres reçu par e-mail.'
          )}
        </AuthHeading>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[14.5px] font-semibold">Code de vérification</legend>
          <OneTimeCodeInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            invalid={error !== null}
            describedBy={error ? errorId : undefined}
          />
          {error ? <FieldError id={errorId}>{error}</FieldError> : null}
        </fieldset>
        <Button
          type="submit"
          size="lg"
          block
          shape="rounded"
          loading={submitting}
          trailingIcon={<IconArrowRight />}
        >
          Vérifier
        </Button>
        <div className="flex flex-wrap justify-between gap-3 text-[15px]">
          <button
            type="button"
            className="font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
            disabled={wait > 0 || resending}
            onClick={() => void resend()}
          >
            {wait > 0 ? `Renvoyer le code (${formatWait(wait)})` : 'Renvoyer le code'}
          </button>
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => void changeAccount()}
          >
            Changer de compte
          </button>
        </div>
        <p className="text-[13.5px] text-muted">
          Rien reçu ? Vérifiez vos courriers indésirables. Ne communiquez jamais ce code : l’équipe
          LASISTANT.PRO ne vous le demandera pas.
        </p>
      </form>
    </>
  );
}
