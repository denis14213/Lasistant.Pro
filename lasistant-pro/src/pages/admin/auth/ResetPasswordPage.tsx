import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';
import type { ResetLinkKind } from '@/api';
import { Seo } from '@/components/seo/Seo';
import { Button, Callout, Spinner } from '@/components/ui';
import { Field } from '@/components/ui/form';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { AuthHeading, PasswordChecklist, PasswordInput } from '@/features/auth/AuthParts';
import { checkResetLink, completePasswordReset } from '@/features/auth/auth-service';
import { useToast } from '@/features/toasts/toast-context';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation/admin-forms';

/**
 * Choix d'un nouveau mot de passe depuis le lien reçu par e-mail :
 * réinitialisation, ou activation d'un compte après une invitation.
 */
export function Component() {
  const navigate = useNavigate();
  const toast = useToast();
  // Validité du lien vérifiée une seule fois, à l'ouverture de l'écran.
  const [link, setLink] = useState<ResetLinkKind | null | 'verification'>('verification');
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmation: '' },
  });
  const password = useWatch({ control, name: 'password' });

  useEffect(() => {
    let active = true;
    checkResetLink()
      .then((kind) => active && setLink(kind))
      .catch(() => active && setLink(null));
    return () => {
      active = false;
    };
  }, []);

  if (link === 'verification') {
    return <Spinner label="Vérification du lien…" className="py-10" />;
  }
  if (link === null) return <Navigate to={ROUTES.admin.linkExpired} replace />;

  const invitation = link === 'invite';

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    const outcome = await completePasswordReset(values.password);
    if (!outcome.ok) {
      if (outcome.reason === 'expired') {
        navigate(ROUTES.admin.linkExpired, { replace: true });
        return;
      }
      setFailure(outcome.message);
      return;
    }
    toast.success(
      invitation
        ? 'Compte activé. Connectez-vous avec votre nouveau mot de passe.'
        : 'Mot de passe modifié. Vous pouvez vous connecter.',
    );
    navigate(ROUTES.admin.login, { replace: true });
  });

  return (
    <>
      <Seo
        title={invitation ? 'Activer mon compte' : 'Nouveau mot de passe'}
        description="Choix d’un nouveau mot de passe."
        noIndex
      />
      <form noValidate onSubmit={onSubmit} aria-labelledby="titre-reinit" className="flex flex-col gap-7">
        <AuthHeading
          title={invitation ? 'Bienvenue dans l’équipe' : 'Nouveau mot de passe'}
          titleId="titre-reinit"
        >
          {invitation
            ? 'Choisissez le mot de passe de votre compte LASISTANT.PRO. Vous pourrez ensuite activer la double authentification.'
            : 'Choisissez un mot de passe que vous n’utilisez sur aucun autre site.'}
        </AuthHeading>
        {failure ? (
          <Callout tone="danger" size="sm" role="alert">
            {failure}
          </Callout>
        ) : null}
        <Field label="Nouveau mot de passe" id="password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </Field>
        <PasswordChecklist value={password} />
        <Field label="Confirmer le mot de passe" id="confirmation" error={errors.confirmation?.message}>
          <PasswordInput
            autoComplete="new-password"
            placeholder="••••••••••••"
            {...register('confirmation')}
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          block
          shape="rounded"
          loading={isSubmitting}
          trailingIcon={<IconArrowRight />}
        >
          {invitation ? 'Activer mon compte' : 'Enregistrer et me connecter'}
        </Button>
      </form>
    </>
  );
}
