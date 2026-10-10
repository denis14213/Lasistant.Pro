import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState, type FormEvent } from 'react';
import { Link, useParams, type LoaderFunctionArgs } from 'react-router';
import { getErrorMessage, mediaQuery, pageContentsQuery, pagesRepository, queryKeys } from '@/api';
import { prefetch } from '@/app/prefetch';
import { notFound } from '@/app/route-errors';
import { AdminPage, AdminPageHeader } from '@/components/admin/AdminPage';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Seo } from '@/components/seo/Seo';
import { Button, ButtonAnchor, Callout, Dialog } from '@/components/ui';
import { IconExternalLink, IconInfo } from '@/components/ui/icons';
import { IconRestore } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { PAGE_DEFAULTS, PAGE_DEFINITIONS, type PageContents, type PageKey } from '@/content/pages';
import {
  countDifferences,
  fieldLabel,
  sectionKeys,
  setAt,
  type ContentPath,
} from '@/features/admin/pages/content-fields';
import { ContentEditor } from '@/features/admin/pages/ContentEditor';
import { SaveBar } from '@/features/admin/settings/SettingsParts';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';

function isPageKey(value: string | undefined): value is PageKey {
  return value !== undefined && Object.hasOwn(PAGE_DEFAULTS, value);
}

export async function loader({ params }: LoaderFunctionArgs) {
  if (!isPageKey(params.key)) throw notFound();
  await prefetch(pageContentsQuery(), mediaQuery());
  return null;
}

/** Modification des textes et des visuels d'une page du site. */
export function Component() {
  const { key } = useParams();
  if (!isPageKey(key)) throw notFound();
  return <PageEditor key={key} pageKey={key} />;
}

function PageEditor({ pageKey }: { pageKey: PageKey }) {
  const session = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const formId = useId();
  const definition = PAGE_DEFINITIONS[pageKey];
  const { data: contents } = useSuspenseQuery(pageContentsQuery());
  const saved = contents[pageKey] as unknown as Record<string, unknown>;
  const [draft, setDraft] = useState<Record<string, unknown>>(saved);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const changes = countDifferences(saved, draft);

  const save = useMutation({
    mutationFn: () =>
      pagesRepository.update(pageKey, draft as unknown as PageContents[PageKey], session.name),
    onSuccess: async () => {
      toast.success(`Page « ${definition.label} » enregistrée.`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.pages });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const update = (path: ContentPath, value: unknown) => setDraft((current) => setAt(current, path, value));
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (changes > 0) save.mutate();
  };

  return (
    <AdminPage className="pb-0 md:pb-0">
      <Seo title={`Page « ${definition.label} »`} description="Modification d’une page du site." noIndex />
      <UnsavedChangesGuard when={changes > 0 && !save.isPending} />
      <AdminPageHeader
        before={
          <Link to={ROUTES.admin.pages} className="text-[13.5px] text-muted hover:text-ink">
            Pages du site
          </Link>
        }
        title={definition.label}
        description={definition.description}
        actions={
          <>
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconRestore />}
              onClick={() => setConfirmRestore(true)}
            >
              Contenu d’origine
            </Button>
            {definition.path ? (
              <ButtonAnchor
                href={definition.path}
                target="_blank"
                rel="noopener"
                variant="outline"
                shape="rounded"
                icon={<IconExternalLink />}
              >
                Voir la page
              </ButtonAnchor>
            ) : null}
          </>
        }
      />

      <Callout tone="info" size="sm" icon={<IconInfo />}>
        Les mentions surlignées en doré sur le site (« à valider ») se renseignent dans les champs « Mention à
        valider ». Videz-les une fois l’information confirmée.
      </Callout>

      <nav aria-label="Rubriques de la page" className="flex flex-wrap gap-2">
        {sectionKeys(draft).map((section) => (
          <a
            key={section}
            href={`#section-${section}`}
            className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13.5px] font-semibold hover:border-brand hover:text-brand"
          >
            {fieldLabel(section)}
          </a>
        ))}
      </nav>

      <form id={formId} noValidate onSubmit={onSubmit}>
        <ContentEditor pageKey={pageKey} value={draft} onChange={update} />
      </form>

      <SaveBar changes={changes} saving={save.isPending} onCancel={() => setDraft(saved)} formId={formId} />

      <Dialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        role="alertdialog"
        size="sm"
        title="Revenir au contenu d’origine ?"
        description="Les textes et photos d’origine de cette page sont rechargés dans le formulaire. Rien n’est modifié sur le site tant que vous n’enregistrez pas."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setConfirmRestore(false)}>
              Annuler
            </Button>
            <Button
              shape="rounded"
              icon={<IconRestore />}
              onClick={() => {
                setDraft(PAGE_DEFAULTS[pageKey] as unknown as Record<string, unknown>);
                setConfirmRestore(false);
              }}
            >
              Recharger le contenu d’origine
            </Button>
          </>
        }
      />
    </AdminPage>
  );
}
