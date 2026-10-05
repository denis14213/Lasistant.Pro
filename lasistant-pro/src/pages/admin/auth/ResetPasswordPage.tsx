import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui';
import { Field } from '@/components/ui/form';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { AuthHeading, PasswordChecklist, PasswordInput } from '@/features/auth/AuthParts';
import { completePasswordReset, isResetLinkValid } from '@/features/auth/auth-service';
import { useToast } from '@/features/toasts/toast-context';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation/admin-forms';

/** Choix d'un nouveau mot de passe depuis le lien reçu par e-mail. */
export function Component() {
  const navigate = useNavigate();
  const toast = useToast();
  // Validité du lien vérifiée une seule fois, à l'ouverture de l'écran.
  const [linkValid] = useState(() => isResetLinkValid());
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

  if (!linkValid) return <Navigate to={ROUTES.admin.linkExpired} replace />;

  const onSubmit = handleSubmit(async () => {
    const done = await completePasswordReset();
    if (!done) {
      navigate(ROUTES.admin.linkExpired, { replace: true });
      return;
    }
    toast.success('Mot de passe modifié. Vous pouvez vous connecter.');
    navigate(ROUTES.admin.login, { replace: true });
  });

  return (
    <>
      <Seo title="Nouveau mot de passe" description="Choix d’un nouveau mot de passe." noIndex />
      <form noValidate onSubmit={onSubmit} aria-labelledby="titre-reinit" className="flex flex-col gap-7">
        <AuthHeading title="Nouveau mot de passe" titleId="titre-reinit">
          Choisissez un mot de passe que vous n’utilisez sur aucun autre site.
        </AuthHeading>
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
          Enregistrer et me connecter
        </Button>
      </form>
    </>
  );
}
