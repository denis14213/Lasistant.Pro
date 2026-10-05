import { useId, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui';
import { Checkbox, FieldError } from '@/components/ui/form';
import { IconArrowRight } from '@/components/ui/icons';
import { IconMobile } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth/auth-context';
import { AuthHeading, OneTimeCodeInput } from '@/features/auth/AuthParts';
import { hasPendingTwoFactor } from '@/features/auth/auth-service';
import { REDIRECT_PARAM, safeRedirect } from '@/features/auth/session-guards';
import { useToast } from '@/features/toasts/toast-context';

/** Double authentification : code à usage unique de l'application d'authentification. */
export function Component() {
  const { verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [pending] = useState(() => hasPendingTwoFactor());
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorId = useId();

  // Sans mot de passe vérifié au préalable, retour à la connexion.
  if (!pending) return <Navigate to={ROUTES.admin.login} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Saisissez les 6 chiffres du code.');
      return;
    }
    setSubmitting(true);
    const valid = await verifyTwoFactor(code);
    setSubmitting(false);
    if (!valid) {
      setError('Code incorrect ou expiré. Saisissez le code affiché actuellement dans votre application.');
      setCode('');
      return;
    }
    navigate(safeRedirect(searchParams.get(REDIRECT_PARAM)), { replace: true });
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
        <AuthHeading icon={<IconMobile />} title="Vérification en deux étapes" titleId="titre-2fa">
          Saisissez le code à 6 chiffres affiché dans votre application d’authentification.
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
        <Checkbox label="Faire confiance à cet appareil pendant 30 jours" />
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
            className="font-semibold text-brand hover:underline"
            onClick={() => toast.info('Contactez un administrateur pour obtenir un code de secours.')}
          >
            Utiliser un code de secours
          </button>
          <Link to={ROUTES.admin.login} className="font-semibold text-brand hover:underline">
            Changer de compte
          </Link>
        </div>
      </form>
    </>
  );
}
