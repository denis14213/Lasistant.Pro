import { useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { accountActivityQuery } from '@/api';
import { Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { IconDocument, IconWeightScope } from '@/components/ui/icons';
import { IconInbox, IconSettings, IconSignIn, IconUsers } from '@/components/ui/icons-admin';
import { useCurrentMinute } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { formatDayAndTime } from '@/lib/format';
import type { AccountActivity } from '@/types';

const KIND_STYLES: Record<AccountActivity['kind'], { icon: ReactNode; tone: string }> = {
  login: { icon: <IconSignIn />, tone: 'bg-success-soft text-success' },
  request: { icon: <IconInbox />, tone: 'bg-brand-soft text-brand' },
  settings: { icon: <IconSettings />, tone: 'bg-info-soft text-info' },
  team: { icon: <IconUsers />, tone: 'bg-gold-soft text-gold-deep' },
  content: { icon: <IconDocument />, tone: 'bg-cloud text-ink-soft' },
};

/** Dernières actions de la personne connectée (connexion, demandes traitées, réglages). */
export function ActivityPanel({ userId }: { userId: string }) {
  const now = useCurrentMinute();
  const { data: activity } = useSuspenseQuery(accountActivityQuery(userId));

  return (
    <Panel labelledBy="activite-recente">
      <PanelHeader titleId="activite-recente" title="Activité récente" />
      <PanelBody>
        {activity.length === 0 ? (
          <p className="text-muted">Aucune activité récente.</p>
        ) : (
          <ol className="flex flex-col">
            {activity.map((item, index) => {
              const style = KIND_STYLES[item.kind];
              return (
                <li
                  key={item.id}
                  className="relative grid grid-cols-[30px_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
                >
                  {index < activity.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-[30px] bottom-0 left-[14.5px] w-px bg-line-strong"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'flex size-[30px] items-center justify-center rounded-full [&_svg]:size-4',
                      style.tone,
                    )}
                    aria-hidden
                  >
                    <IconWeightScope weight="bold">{style.icon}</IconWeightScope>
                  </span>
                  <div>
                    <p className="text-sm leading-[1.45]">{item.label}</p>
                    <time dateTime={item.createdAt} className="text-[12.5px] text-muted">
                      {formatDayAndTime(item.createdAt, new Date(now))}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </PanelBody>
    </Panel>
  );
}
