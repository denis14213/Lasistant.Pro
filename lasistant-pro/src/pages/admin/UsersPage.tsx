import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getErrorMessage, queryKeys, teamQuery, teamRepository } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage, AdminPageHeader, Panel, PanelFooter, PanelHeader } from '@/components/admin/AdminPage';
import { AdminTable } from '@/components/admin/AdminTable';
import { Avatar } from '@/components/admin/Avatar';
import { Seo } from '@/components/seo/Seo';
import { ActionMenu, Badge, Button, Dialog, IconBox } from '@/components/ui';
import { Field, Input, RadioCards, Switch } from '@/components/ui/form';
import { IconCheck, IconInfo, IconRemove, IconSecure, IconSend, IconWarning } from '@/components/ui/icons';
import { IconUserAdd, IconUserRole } from '@/components/ui/icons-admin';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { useCurrentMinute } from '@/hooks/useNow';
import { formatRelative } from '@/lib/format';
import { PERMISSION_ROWS, permissionLevel, ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/lib/permissions';
import { pluralize } from '@/lib/text';
import { inviteUserSchema, type InviteUserValues } from '@/lib/validation/admin-forms';
import type { AdminRole, AdminUser, Tone } from '@/types';

export const loader = () => prefetch(teamQuery());

const ROLES: AdminRole[] = ['operateur', 'editeur', 'administrateur'];
const ROLE_TONES: Record<AdminRole, Tone> = {
  administrateur: 'brand',
  editeur: 'info',
  operateur: 'neutral',
};
const ROLE_OPTIONS = ROLES.map((role) => ({
  value: role,
  title: ROLE_LABELS[role],
  description: ROLE_DESCRIPTIONS[role],
}));

/** Comptes de l'équipe et droits par rôle (cahier des charges § 8.9). */
export function Component() {
  const session = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const now = useCurrentMinute();
  const { data: team } = useSuspenseQuery(teamQuery());
  const [inviting, setInviting] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminUser | null>(null);
  const [nextRole, setNextRole] = useState<AdminRole>('operateur');

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.team });
  const onError = (error: Error) => toast.error(getErrorMessage(error));

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<AdminUser, 'active' | 'role'>> }) =>
      teamRepository.update(id, patch, session.name),
    onSuccess: (user, { patch }) => {
      toast.success(
        patch.role
          ? `${user.name} est désormais ${ROLE_LABELS[user.role].toLowerCase()}.`
          : user.active
            ? `Le compte de ${user.name} est réactivé.`
            : `Le compte de ${user.name} est désactivé.`,
      );
      setEditingRole(null);
      return refresh();
    },
    onError,
  });

  return (
    <AdminPage>
      <Seo title="Utilisateurs & rôles" description="Comptes de l’équipe." noIndex />
      <AdminPageHeader
        title="Utilisateurs & rôles"
        description="Gérez les accès de l’équipe. Chaque rôle ne voit que les menus qui le concernent."
        actions={
          <Button shape="rounded" icon={<IconUserAdd />} onClick={() => setInviting(true)}>
            Inviter un utilisateur
          </Button>
        }
      />

      <Panel labelledBy="equipe">
        <PanelHeader
          titleId="equipe"
          title="Équipe"
          action={<span className="text-[13px] text-muted">{pluralize(team.length, 'compte')}</span>}
        />
        <AdminTable minWidth={820} caption="Comptes de l’équipe">
          <thead>
            <tr>
              <th scope="col">Utilisateur</th>
              <th scope="col">Rôle</th>
              <th scope="col">Double authentification</th>
              <th scope="col">Dernière connexion</th>
              <th scope="col">Actif</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((user) => {
              const isSelf = user.id === session.userId;
              return (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} tone={user.role === 'administrateur' ? 'dark' : undefined} />
                      <div className="min-w-0">
                        <strong className="block font-semibold">
                          {user.name}
                          {isSelf ? (
                            <span className="ml-1.5 text-[12.5px] font-normal text-muted">(vous)</span>
                          ) : null}
                        </strong>
                        <span className="text-[12.5px] text-muted">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td>
                    {user.invitationSentAt && !user.lastLoginAt ? (
                      <span className="text-muted">—</span>
                    ) : user.twoFactorEnabled ? (
                      <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-success">
                        <IconSecure className="size-4" aria-hidden />
                        Activée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gold-dark">
                        <IconWarning className="size-4" aria-hidden />À activer
                      </span>
                    )}
                  </td>
                  <td className="text-muted">
                    {user.lastLoginAt ? (
                      formatRelative(user.lastLoginAt, new Date(now))
                    ) : user.invitationSentAt ? (
                      <Badge tone="warning">Invitation envoyée</Badge>
                    ) : (
                      'Jamais'
                    )}
                  </td>
                  <td>
                    <Switch
                      checked={user.active}
                      disabled={isSelf || update.isPending}
                      label={`Compte de ${user.name} ${user.active ? 'actif' : 'inactif'}`}
                      onCheckedChange={(active) => update.mutate({ id: user.id, patch: { active } })}
                    />
                  </td>
                  <td className="text-right">
                    <ActionMenu
                      label={`Plus d’actions pour ${user.name}`}
                      items={[
                        {
                          id: 'role',
                          label: 'Changer le rôle',
                          icon: <IconUserRole />,
                          disabled: isSelf,
                          onSelect: () => {
                            setNextRole(user.role);
                            setEditingRole(user);
                          },
                        },
                        {
                          id: 'invitation',
                          label: 'Renvoyer l’invitation',
                          icon: <IconSend />,
                          disabled: !user.invitationSentAt || Boolean(user.lastLoginAt),
                          onSelect: () => toast.success(`Invitation renvoyée à ${user.email}.`),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      </Panel>

      <Panel labelledBy="droits">
        <PanelHeader
          titleId="droits"
          title="Droits par rôle"
          description="Les rôles sont aussi appliqués côté serveur : un menu masqué correspond à une page protégée."
        />
        <AdminTable minWidth={640} caption="Droits par rôle et par module">
          <thead>
            <tr>
              <th scope="col">Module</th>
              {(['administrateur', 'editeur', 'operateur'] as AdminRole[]).map((role) => (
                <th key={role} scope="col" className="text-center!">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="bg-transparent! text-left text-sm! font-normal! tracking-normal! text-ink! normal-case!"
                >
                  {row.label}
                </th>
                {(['administrateur', 'editeur', 'operateur'] as AdminRole[]).map((role) => {
                  const access = permissionLevel(role, row);
                  return (
                    <td key={role} className="text-center">
                      {access.level === 'complet' ? (
                        <IconCheck className="mx-auto size-4.5 text-success" aria-label="Oui" />
                      ) : access.level === 'aucun' ? (
                        <IconRemove className="mx-auto size-4.5 text-disabled" aria-label="Non" />
                      ) : (
                        <span className="text-[13px] text-muted">
                          {access.level === 'lecture' ? 'Lecture seule' : access.note}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </AdminTable>
        <PanelFooter>
          <span className="flex items-center gap-2">
            <IconInfo className="size-4" aria-hidden />
            Connectez-vous avec les comptes de démonstration pour voir l’affichage de chaque rôle.
          </span>
        </PanelFooter>
      </Panel>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} onInvited={refresh} />

      <Dialog
        open={editingRole !== null}
        onClose={() => setEditingRole(null)}
        size="md"
        title={`Rôle de ${editingRole?.name ?? ''}`}
        description="Le nouveau rôle s’applique à la prochaine page ouverte par cette personne."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setEditingRole(null)}>
              Annuler
            </Button>
            <Button
              shape="rounded"
              loading={update.isPending}
              disabled={editingRole?.role === nextRole}
              onClick={() => editingRole && update.mutate({ id: editingRole.id, patch: { role: nextRole } })}
            >
              Enregistrer le rôle
            </Button>
          </>
        }
      >
        <Field label="Rôle" kind="group" srOnlyLabel>
          <RadioCards
            name="role-utilisateur"
            columns={1}
            options={ROLE_OPTIONS}
            value={nextRole}
            onChange={setNextRole}
          />
        </Field>
      </Dialog>
    </AdminPage>
  );
}

/** Invitation d'un membre de l'équipe (adresse professionnelle uniquement). */
function InviteDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: () => Promise<unknown>;
}) {
  const session = useSession();
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: '', role: 'operateur' },
  });

  const invite = useMutation({
    mutationFn: (values: InviteUserValues) => teamRepository.invite(values.email, values.role, session.name),
    onSuccess: async (user) => {
      toast.success(`Invitation envoyée à ${user.email}.`);
      reset();
      onClose();
      await onInvited();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      media={
        <IconBox tone="brand" size="sm">
          <IconUserAdd />
        </IconBox>
      }
      title="Inviter un utilisateur"
      description="La personne recevra un e-mail pour activer son compte, choisir son mot de passe et configurer la double authentification."
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={close}>
            Annuler
          </Button>
          <Button
            shape="rounded"
            icon={<IconSend />}
            loading={invite.isPending}
            onClick={() => void handleSubmit((values) => invite.mutate(values))()}
          >
            Envoyer l’invitation
          </Button>
        </>
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => invite.mutate(values))}
        className="flex flex-col gap-4"
      >
        <Field
          label="Adresse e-mail professionnelle"
          id="invite-email"
          error={errors.email?.message}
          density="compact"
        >
          <Input
            type="email"
            density="compact"
            placeholder="prenom.nom@lasistant.pro"
            {...register('email')}
          />
        </Field>
        <Field label="Rôle" kind="group" density="compact">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RadioCards
                name={field.name}
                columns={1}
                options={ROLE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      </form>
    </Dialog>
  );
}
