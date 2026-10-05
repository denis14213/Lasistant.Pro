import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { Button, TextLink } from '@/components/ui';
import { Field, Input } from '@/components/ui/form';
import { IconArrowLeft, IconKey, IconSend } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { AuthHeading } from '@/features/auth/AuthParts';
import { requestPasswordReset } from '@/features/auth/auth-service';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation/admin-forms';

/** Demande d'un lien de réinitialisation du mot de passe. */
export function Component() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    // La réponse est identique, que le compte existe ou non (aucune information divulguée).
    await requestPasswordReset(email);
    navigate(ROUTES.admin.forgotPasswordSent, { state: { email } });
  });

  return (
    <>
      <Seo
        title="Mot de passe oublié"
        description="Réinitialisation du mot de passe du back-office."
        noIndex
      />
      <form noValidate onSubmit={onSubmit} aria-labelledby="titre-oubli" className="flex flex-col gap-7">
        <AuthHeading icon={<IconKey />} title="Mot de passe oublié" titleId="titre-oubli">
          Saisissez votre adresse professionnelle : nous vous enverrons un lien pour choisir un nouveau mot de
          passe.
        </AuthHeading>
        <Field label="Adresse e-mail" id="email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="username"
            placeholder="prenom.nom@lasistant.pro"
            {...register('email')}
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          block
          shape="rounded"
          loading={isSubmitting}
          loadingLabel="Envoi…"
          trailingIcon={<IconSend />}
        >
          Envoyer le lien
        </Button>
        <TextLink to={ROUTES.admin.login} icon={<IconArrowLeft />} className="mx-auto">
          Retour à la connexion
        </TextLink>
      </form>
    </>
  );
}
