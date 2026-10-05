import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, Callout } from '@/components/ui';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { IconArrowRight, IconSecure } from '@/components/ui/icons';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/content/demo/team';
import { loginSchema, type LoginValues } from '@/lib/validation/admin-forms';
import { useAuth } from './auth-context';
import { PasswordInput } from './AuthParts';
import { rememberLoginEmail } from './last-login-email';
import { REDIRECT_PARAM } from './session-guards';

interface LoginFormProps {
  submitLabel?: string;
  /** Adresse pré-remplie (reconnexion) */
  defaultEmail?: string;
}

/**
 * Formulaire de connexion : vérification du mot de passe puis double authentification.
 * Les réponses ne révèlent jamais si un compte existe ; les échecs répétés verrouillent l'accès.
 */
export function LoginForm({ submitLabel = 'Se connecter', defaultEmail = '' }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: '', remember: false },
  });

  const withRedirect = (path: string) => {
    const destination = searchParams.get(REDIRECT_PARAM);
    return destination ? `${path}?${REDIRECT_PARAM}=${encodeURIComponent(destination)}` : path;
  };

  const onSubmit = handleSubmit(async ({ email, password, remember }) => {
    setFailure(null);
    const result = await login(email, password, remember);
    switch (result.status) {
      case 'two-factor':
        rememberLoginEmail(email);
        navigate(withRedirect(ROUTES.admin.twoFactor));
        break;
      case 'locked':
        navigate(ROUTES.admin.locked);
        break;
      case 'inactive':
        setFailure(
          'Ce compte n’est pas encore activé. Suivez le lien reçu dans l’e-mail d’invitation ou contactez un administrateur.',
        );
        break;
      case 'invalid':
        setFailure(
          `Adresse e-mail ou mot de passe incorrect. Il vous reste ${result.remainingAttempts} tentative${
            result.remainingAttempts > 1 ? 's' : ''
          } avant le verrouillage temporaire du compte.`,
        );
        break;
    }
  });

  // Après un échec, les deux champs sont signalés (sans préciser lequel est en cause).
  const failedAttempt = failure !== null ? { 'aria-invalid': true } : {};

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5.5">
      {failure ? (
        <Callout tone="danger" size="sm" role="alert">
          {failure}
        </Callout>
      ) : null}
      <Field label="Adresse e-mail" id="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="username"
          placeholder="prenom.nom@lasistant.pro"
          {...failedAttempt}
          {...register('email')}
        />
      </Field>
      <Field
        label="Mot de passe"
        id="password"
        error={errors.password?.message}
        labelAside={
          <Link
            to={ROUTES.admin.forgotPassword}
            className="text-[15px] font-semibold text-brand hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        }
      >
        <PasswordInput
          autoComplete="current-password"
          placeholder="••••••••••"
          {...failedAttempt}
          {...register('password')}
        />
      </Field>
      <Checkbox label="Rester connecté sur cet appareil" {...register('remember')} />
      <Button
        type="submit"
        size="lg"
        block
        shape="rounded"
        loading={isSubmitting}
        loadingLabel="Connexion…"
        trailingIcon={<IconArrowRight />}
      >
        {submitLabel}
      </Button>
      <Callout tone="privacy" size="sm" icon={<IconSecure />}>
        Après connexion, un code de vérification à usage unique vous sera demandé (double authentification).
      </Callout>
      {env.dataSource === 'mock' ? (
        <p className="rounded-xl border border-dashed border-gold-line bg-gold-wash px-4 py-3 text-[13.5px] leading-relaxed text-gold-dark">
          <strong>Démonstration :</strong> admin@lasistant.pro, contenus@lasistant.pro ou
          operateur1@lasistant.pro · mot de passe <code className="font-mono">{DEMO_PASSWORD}</code> · code{' '}
          <code className="font-mono">{DEMO_TWO_FACTOR_CODE}</code>
        </p>
      ) : null}
    </form>
  );
}
