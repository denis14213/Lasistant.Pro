import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { accountQuery, accountRepository, getErrorMessage, isDataError } from '@/api';
import { Panel, PanelBody, PanelFooter, PanelHeader } from '@/components/admin/AdminPage';
import { Button } from '@/components/ui';
import { Field } from '@/components/ui/form';
import { env } from '@/config/env';
import { PasswordChecklist, PasswordInput } from '@/features/auth/AuthParts';
import { useToast } from '@/features/toasts/toast-context';
import { useCurrentMinute } from '@/hooks/useNow';
import { diffInDays } from '@/lib/dates';
import { pluralize } from '@/lib/text';
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/validation/admin-forms';
import type { AdminUser } from '@/types';

/** Changement du mot de passe : mot de passe actuel exigé, règles de robustesse vérifiées en direct. */
export function PasswordPanel({ user }: { user: AdminUser }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const now = useCurrentMinute();
  const formId = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: '', password: '', confirmation: '' },
  });
  const password = useWatch({ control, name: 'password' });

  const change = useMutation({
    mutationFn: (values: ChangePasswordValues) => accountRepository.changePassword(user.id, values.current),
    onSuccess: (saved) => {
      reset();
      queryClient.setQueryData(accountQuery(user.id).queryKey, saved);
      toast.success('Mot de passe mis à jour.');
    },
    onError: (error) => {
      if (isDataError(error, 'validation'))
        setError('current', { message: error.message }, { shouldFocus: true });
      else toast.error(getErrorMessage(error));
    },
  });

  const daysSinceChange = user.passwordChangedAt
    ? diffInDays(new Date(now), new Date(user.passwordChangedAt))
    : null;
  const changedAt =
    daysSinceChange === null
      ? 'Jamais modifié'
      : daysSinceChange < 1
        ? 'Modifié aujourd’hui'
        : `Modifié il y a ${pluralize(daysSinceChange, 'jour')}`;

  return (
    <Panel labelledBy={`${formId}-titre`}>
      <PanelHeader titleId={`${formId}-titre`} title="Mot de passe" description={changedAt} />
      <form id={formId} noValidate onSubmit={handleSubmit((values) => change.mutate(values))}>
        <PanelBody className="flex flex-col gap-3.5">
          <Field
            label="Mot de passe actuel"
            id={`${formId}-actuel`}
            error={errors.current?.message}
            density="compact"
          >
            <PasswordInput density="compact" autoComplete="current-password" {...register('current')} />
          </Field>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <Field
              label="Nouveau mot de passe"
              id={`${formId}-nouveau`}
              error={errors.password?.message}
              density="compact"
            >
              <PasswordInput density="compact" autoComplete="new-password" {...register('password')} />
            </Field>
            <Field
              label="Confirmation"
              id={`${formId}-confirmation`}
              error={errors.confirmation?.message}
              density="compact"
            >
              <PasswordInput density="compact" autoComplete="new-password" {...register('confirmation')} />
            </Field>
          </div>
          <PasswordChecklist value={password} />
          {env.dataSource === 'mock' ? (
            <p className="text-[13px] text-muted">
              Démonstration : la connexion continue d’utiliser le mot de passe de démonstration.
            </p>
          ) : null}
        </PanelBody>
      </form>
      <PanelFooter className="justify-end">
        <Button type="submit" form={formId} size="sm" shape="rounded" loading={change.isPending}>
          Mettre à jour le mot de passe
        </Button>
      </PanelFooter>
    </Panel>
  );
}
