import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { accountRepository, accountSessionsQuery, getErrorMessage } from '@/api';
import { Panel, PanelHeader } from '@/components/admin/AdminPage';
import { Badge, Button, IconBox } from '@/components/ui';
import { IconDesktop, IconMobile, IconTablet } from '@/components/ui/icons-admin';
import { useToast } from '@/features/toasts/toast-context';
import { useCurrentMinute } from '@/hooks/useNow';
import { formatRelative } from '@/lib/format';
import { env } from '@/config/env';
import { DEVICE_LABELS, describeUserAgent } from '@/lib/user-agent';
import type { AccountSession } from '@/types';

const DEVICE_ICONS: Record<AccountSession['device'], ReactNode> = {
  ordinateur: <IconDesktop />,
  telephone: <IconMobile />,
  tablette: <IconTablet />,
};

/**
 * Appareils connectés au compte : la session en cours, puis les autres, déconnectables.
 * Avec Supabase Auth, les autres appareils ne sont pas listés : ils se déconnectent en une fois.
 */
export function SessionsPanel({ userId }: { userId: string }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const now = useCurrentMinute();
  const { data: sessions } = useSuspenseQuery(accountSessionsQuery(userId));
  const current = describeUserAgent(navigator.userAgent);
  // Les autres sessions ne sont pas énumérables en production : l'action reste toujours proposée.
  const canSignOutOthers = sessions.length > 0 || env.dataSource === 'supabase';

  const revoke = useMutation({
    mutationFn: (sessionId?: string) => accountRepository.revokeSessions(userId, sessionId),
    onSuccess: (_, sessionId) => {
      toast.success(sessionId ? 'Session déconnectée.' : 'Toutes les autres sessions sont déconnectées.');
      return queryClient.invalidateQueries({ queryKey: accountSessionsQuery(userId).queryKey });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Panel labelledBy="sessions-actives">
      <PanelHeader
        titleId="sessions-actives"
        title="Sessions actives"
        action={
          canSignOutOthers ? (
            <button
              type="button"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(undefined)}
              className="text-[13.5px] font-semibold text-danger hover:underline disabled:opacity-50"
            >
              Déconnecter les autres sessions
            </button>
          ) : null
        }
      />
      <ul>
        <SessionRow
          icon={DEVICE_ICONS[current.device]}
          title={`${DEVICE_LABELS[current.device]} · ${current.browser}`}
          detail="Actif maintenant"
          action={<Badge tone="success">Cet appareil</Badge>}
        />
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            icon={DEVICE_ICONS[session.device]}
            title={`${DEVICE_LABELS[session.device]} · ${session.browser}`}
            detail={`${session.location} · ${formatRelative(session.lastActiveAt, new Date(now))}`}
            action={
              <Button
                variant="outline"
                size="sm"
                shape="rounded"
                loading={revoke.isPending && revoke.variables === session.id}
                onClick={() => revoke.mutate(session.id)}
                aria-label={`Déconnecter la session ${DEVICE_LABELS[session.device]} · ${session.browser}`}
              >
                Déconnecter
              </Button>
            }
          />
        ))}
      </ul>
    </Panel>
  );
}

function SessionRow({
  icon,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  action: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3.5 border-b border-line px-5.5 py-3.5 last:border-b-0">
      <IconBox tone="brand" size="xs" className="size-10">
        {icon}
      </IconBox>
      <div className="min-w-0 flex-1">
        <strong className="block text-[14.5px] font-semibold">{title}</strong>
        <span className="text-[13px] text-muted">{detail}</span>
      </div>
      {action}
    </li>
  );
}
