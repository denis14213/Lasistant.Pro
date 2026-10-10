import { useId, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { getErrorMessage } from '@/api';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui';
import { Checkbox, FieldError, Input } from '@/components/ui/form';
import { IconArrowRight, IconKey } from '@/components/ui/icons';
import { IconMobile } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth/auth-context';
import { AuthHeading, OneTimeCodeInput } from '@/features/auth/AuthParts';
import { cancelPendingLogin, hasPendingTwoFactor } from '@/features/auth/auth-service';
import { REDIRECT_PARAM, safeRedirect } from '@/features/auth/session-guards';
import { useToast } from '@/features/toasts/toast-context';

/** Format d'un code de secours : 8 lettres ou chiffres, avec ou sans tiret (« 4F7K-92QD »). */
const RECOVERY_CODE_PATTERN = /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/i;

/**
 * Double authentification : code à usage unique de l'application d'authentification,
 * ou code de secours si le téléphone n'est plus disponible.
 */
export function Component() {
  const { verifyTwoFactor, redeemRecoveryCode } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [pending] = useState(() => hasPendingTwoFactor());
  const [mode, setMode] = useState<'application' | 'secours'>('application');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorId = useId();

  // Sans mot de passe vérifié au préalable, retour à la connexion.
  if (!pending) return <Navigate to={ROUTES.admin.login} replace />;

  const usingRecovery = mode === 'secours';

  const switchMode = () => {
    setMode(usingRecovery ? 'application' : 'secours');
    setCode('');
    setError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (usingRecovery ? !RECOVERY_CODE_PATTERN.test(value) : !/^\d{6}$/.test(value)) {
      setError(
        usingRecovery ? 'Saisissez un code de secours (8 caractères).' : 'Saisissez les 6 chiffres du code.',
      );
      return;
    }
    setSubmitting(true);
    try {
      const valid = usingRecovery ? await redeemRecoveryCode(value) : await verifyTwoFactor(value);
      if (!valid) {
        setError(
          usingRecovery
            ? 'Ce code de secours est incorrect ou a déjà été utilisé.'
            : 'Code incorrect ou expiré. Saisissez le code affiché actuellement dans votre application.',
        );
        setCode('');
        return;
      }
      if (usingRecovery) {
        toast.info(
          'Code de secours utilisé : reconfigurez la double authentification depuis « Mon compte ».',
        );
      }
      navigate(usingRecovery ? ROUTES.admin.account : safeRedirect(searchParams.get(REDIRECT_PARAM)), {
        replace: true,
      });
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setSubmitting(false);
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
        <AuthHeading
          icon={usingRecovery ? <IconKey /> : <IconMobile />}
          title={usingRecovery ? 'Code de secours' : 'Vérification en deux étapes'}
          titleId="titre-2fa"
        >
          {usingRecovery
            ? 'Saisissez l’un des codes de secours obtenus lors de la configuration. Chaque code ne sert qu’une fois.'
            : 'Saisissez le code à 6 chiffres affiché dans votre application d’authentification.'}
        </AuthHeading>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[14.5px] font-semibold">
            {usingRecovery ? 'Code de secours' : 'Code de vérification'}
          </legend>
          {usingRecovery ? (
            <Input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError(null);
              }}
              autoComplete="one-time-code"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="ABCD-EFGH"
              aria-label="Code de secours"
              aria-invalid={error !== null || undefined}
              aria-describedby={error ? errorId : undefined}
              className="font-mono tracking-[0.12em]"
            />
          ) : (
            <OneTimeCodeInput
              value={code}
              onChange={(value) => {
                setCode(value);
                setError(null);
              }}
              invalid={error !== null}
              describedBy={error ? errorId : undefined}
            />
          )}
          {error ? <FieldError id={errorId}>{error}</FieldError> : null}
        </fieldset>
        {usingRecovery ? null : <Checkbox label="Faire confiance à cet appareil pendant 30 jours" />}
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
          <button type="button" className="font-semibold text-brand hover:underline" onClick={switchMode}>
            {usingRecovery ? 'Utiliser l’application d’authentification' : 'Utiliser un code de secours'}
          </button>
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => void changeAccount()}
          >
            Changer de compte
          </button>
        </div>
      </form>
    </>
  );
}
