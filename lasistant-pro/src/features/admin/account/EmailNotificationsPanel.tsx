import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountQuery, accountRepository, getErrorMessage } from '@/api';
import { Panel, PanelHeader } from '@/components/admin/AdminPage';
import { Switch } from '@/components/ui/form';
import { useToast } from '@/features/toasts/toast-context';
import type { AdminUser, NotificationPreferences } from '@/types';

const ROWS: Array<{ key: keyof NotificationPreferences; title: string; hint: string }> = [
  { key: 'newRequest', title: 'Nouvelle demande reçue', hint: 'Dès qu’un formulaire du site est envoyé' },
  { key: 'overdueReminder', title: 'Demande non traitée depuis 24 h', hint: 'Rappel quotidien' },
  { key: 'weeklySummary', title: 'Résumé hebdomadaire', hint: 'Chaque lundi matin' },
];

/** Notifications par e-mail : chaque interrupteur est enregistré immédiatement. */
export function EmailNotificationsPanel({ user }: { user: AdminUser }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: ({ key, value }: { key: keyof NotificationPreferences; value: boolean }) =>
      accountRepository.updateNotifications(user.id, { [key]: value }),
    onSuccess: (saved, { value }) => {
      queryClient.setQueryData(accountQuery(user.id).queryKey, saved);
      toast.success(value ? 'Notification activée.' : 'Notification désactivée.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Panel labelledBy="notifications-email">
      <PanelHeader titleId="notifications-email" title="Notifications par e-mail" />
      <ul>
        {ROWS.map((row) => {
          // Pendant l'enregistrement, l'interrupteur affiche déjà la nouvelle valeur.
          const pendingValue =
            update.isPending && update.variables?.key === row.key ? update.variables.value : undefined;
          const checked = pendingValue ?? user.notifications[row.key];
          return (
            <li
              key={row.key}
              className="flex items-center gap-4 border-b border-line px-5.5 py-3.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <strong className="block text-[14.5px] font-semibold">{row.title}</strong>
                <span className="text-[13px] text-muted">{row.hint}</span>
              </div>
              <Switch
                checked={checked}
                disabled={pendingValue !== undefined}
                label={`${row.title} : ${checked ? 'activé' : 'désactivé'}`}
                onCheckedChange={(value) => update.mutate({ key: row.key, value })}
              />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
