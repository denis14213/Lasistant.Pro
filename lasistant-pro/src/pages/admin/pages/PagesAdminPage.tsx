import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { pagesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage, AdminPageHeader, Panel, PanelHeader } from '@/components/admin/AdminPage';
import { Seo } from '@/components/seo/Seo';
import { Badge } from '@/components/ui';
import { IconChevronRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { PAGE_DEFINITIONS, PAGE_KEYS, type PageDefinition } from '@/content/pages';
import { useCurrentMinute } from '@/hooks/useNow';
import { formatRelative } from '@/lib/format';

export const loader = () => prefetch(pagesQuery());

const GROUPS: PageDefinition['group'][] = [
  'Pages principales',
  'Services',
  'Demandes et informations',
  'Légal',
  'Commun',
];

/** Pages du site : textes et visuels de chaque page, modifiables sans intervention technique. */
export function Component() {
  const { data: records } = useSuspenseQuery(pagesQuery());
  const now = useCurrentMinute();
  const recordOf = new Map(records.map((record) => [record.key, record]));

  return (
    <AdminPage>
      <Seo title="Pages du site" description="Textes et visuels des pages du site." noIndex />
      <AdminPageHeader
        title="Pages du site"
        description="Modifiez les textes et les photos de chaque page. Les modifications sont visibles sur le site dès leur enregistrement."
      />
      {GROUPS.map((group) => {
        const keys = PAGE_KEYS.filter((key) => PAGE_DEFINITIONS[key].group === group);
        const titleId = `groupe-${group.replace(/\W+/g, '-').toLowerCase()}`;
        return (
          <Panel key={group} labelledBy={titleId}>
            <PanelHeader titleId={titleId} title={group} />
            <ul>
              {keys.map((key) => {
                const definition = PAGE_DEFINITIONS[key];
                const record = recordOf.get(key);
                return (
                  <li key={key} className="border-b border-line last:border-b-0">
                    <Link
                      to={ROUTES.admin.page(key)}
                      className="flex items-center gap-4 px-5.5 py-4 transition-colors hover:bg-cloud"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold">{definition.label}</p>
                        <p className="text-[13.5px] text-muted">{definition.description}</p>
                      </div>
                      {record?.updatedAt ? (
                        <span className="hidden text-right text-[13px] text-muted sm:block">
                          Modifié {formatRelative(record.updatedAt, new Date(now))}
                          {record.updatedBy ? <span className="block">par {record.updatedBy}</span> : null}
                        </span>
                      ) : (
                        <Badge tone="neutral">Contenu d’origine</Badge>
                      )}
                      <IconChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        );
      })}
    </AdminPage>
  );
}
