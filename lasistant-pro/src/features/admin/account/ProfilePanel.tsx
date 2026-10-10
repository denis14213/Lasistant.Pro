import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { accountQuery, accountRepository, getErrorMessage, queryKeys } from '@/api';
import { Panel, PanelBody, PanelFooter, PanelHeader } from '@/components/admin/AdminPage';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Button } from '@/components/ui';
import { Field, Input, Select } from '@/components/ui/form';
import { IconCheck } from '@/components/ui/icons';
import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { profileSchema, type ProfileValues } from '@/lib/validation/admin-forms';
import type { AdminUser } from '@/types';

/** Nom et adresse de la personne connectée (la langue et le fuseau sont uniques pour l'instant). */
export function ProfilePanel({ user }: { user: AdminUser }) {
  const auth = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const formId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  const save = useMutation({
    mutationFn: (values: ProfileValues) => accountRepository.updateProfile(user.id, values),
    onSuccess: async (saved, values) => {
      reset({ name: saved.name, email: saved.email });
      // Le nom affiché dans le menu et la barre supérieure suit immédiatement.
      auth.updateIdentity({ name: saved.name, email: saved.email });
      queryClient.setQueryData(accountQuery(user.id).queryKey, saved);
      // Une nouvelle adresse n'est appliquée qu'après confirmation par e-mail.
      const emailPending = values.email.trim().toLowerCase() !== saved.email;
      toast.success(
        emailPending
          ? 'Profil enregistré. Confirmez la nouvelle adresse grâce au lien reçu par e-mail.'
          : 'Profil enregistré.',
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.team });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Panel labelledBy={`${formId}-titre`}>
      <UnsavedChangesGuard when={isDirty && !save.isPending} />
      <PanelHeader titleId={`${formId}-titre`} title="Profil" />
      <form id={formId} noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
        <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Field label="Nom affiché" id={`${formId}-nom`} error={errors.name?.message} density="compact">
            <Input density="compact" autoComplete="name" {...register('name')} />
          </Field>
          <Field
            label="Adresse e-mail"
            id={`${formId}-email`}
            error={errors.email?.message}
            hint="Sert à vous connecter et à recevoir les notifications."
            density="compact"
          >
            <Input type="email" density="compact" autoComplete="email" {...register('email')} />
          </Field>
          <Field label="Langue de l’interface" id={`${formId}-langue`} density="compact">
            <Select density="compact" defaultValue="fr">
              <option value="fr">Français</option>
            </Select>
          </Field>
          <Field label="Fuseau horaire" id={`${formId}-fuseau`} density="compact">
            <Select density="compact" defaultValue="Africa/Tunis">
              <option value="Africa/Tunis">Tunis (UTC+1)</option>
            </Select>
          </Field>
        </PanelBody>
      </form>
      <PanelFooter className="justify-end">
        <Button
          type="submit"
          form={formId}
          size="sm"
          shape="rounded"
          icon={<IconCheck />}
          loading={save.isPending}
          disabled={!isDirty}
        >
          Enregistrer
        </Button>
      </PanelFooter>
    </Panel>
  );
}
