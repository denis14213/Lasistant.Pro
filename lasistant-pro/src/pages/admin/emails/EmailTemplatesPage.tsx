import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  emailTemplatesQuery,
  emailTemplatesRepository,
  getErrorMessage,
  queryKeys,
  servicesQuery,
  settingsQuery,
} from '@/api';
import { prefetch } from '@/app/prefetch';
import {
  AdminPage,
  AdminPageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from '@/components/admin/AdminPage';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, Callout, Dialog, IconBox, TextLink } from '@/components/ui';
import { Field, Input, Switch } from '@/components/ui/form';
import { IconAdd, IconCheck, IconDelete, IconInfo, IconSend, IconWarning } from '@/components/ui/icons';
import { IconPreview, IconRestore } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { defaultEmailTemplate } from '@/content/demo/email-templates';
import { isSystemTemplate, variablesFor } from '@/emails/catalog';
import { emailBodyToText } from '@/emails/email-markup';
import type { EmailContent } from '@/emails/types';
import { EmailBodyEditor } from '@/features/admin/emails/EmailBodyEditor';
import { EmailPreview } from '@/features/admin/emails/EmailPreview';
import { previewData } from '@/features/admin/emails/email-preview-data';
import { NewTemplateDialog } from '@/features/admin/emails/NewTemplateDialog';
import { templateMeta } from '@/features/admin/emails/template-meta';
import { useSession } from '@/features/auth/auth-context';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { useToast } from '@/features/toasts/toast-context';
import { cn } from '@/lib/cn';
import { fillTemplate } from '@/lib/text';
import { emailTemplateSchema, type EmailTemplateValues } from '@/lib/validation/admin-forms';
import type { EmailTemplate } from '@/types';

export const loader = () => prefetch(emailTemplatesQuery(), settingsQuery(), servicesQuery(true));

/** Paramètre d'URL du modèle ouvert dans l'éditeur. */
const SELECTED_PARAM = 'modele';

/** Modèles d'e-mails : messages automatiques et réponses standards (cahier des charges § 7.3). */
export function Component() {
  const { data: templates } = useSuspenseQuery(emailTemplatesQuery());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectedKey = searchParams.get(SELECTED_PARAM);
  const selected = templates.find((template) => template.key === selectedKey) ?? templates[0];

  // Liste et éditeur sont empilés sous 1024 px : on amène l'éditeur à l'écran après un choix.
  useEffect(() => {
    if (!selectedKey || !window.matchMedia('(max-width: 1023px)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    editorRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [selectedKey]);

  const groups = [
    {
      id: 'automatiques',
      title: 'Automatiques',
      items: templates.filter((template) => template.kind === 'automatique'),
    },
    {
      id: 'reponses',
      title: 'Réponses standards',
      items: templates.filter((template) => template.kind === 'manuel'),
    },
  ];

  return (
    <AdminPage>
      <Seo title="Modèles d’e-mails" description="Messages automatiques et réponses standards." noIndex />
      <AdminPageHeader
        title="Modèles d’e-mails"
        description="Messages automatiques et réponses standards envoyés aux demandeurs et à l’équipe."
        actions={
          <Button shape="rounded" icon={<IconAdd />} onClick={() => setCreating(true)}>
            Nouveau modèle
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <Panel labelledBy="liste-modeles" className="lg:sticky lg:top-[88px]">
          <PanelHeader
            titleId="liste-modeles"
            title="Modèles"
            action={<span className="text-[13px] text-muted">{templates.length}</span>}
          />
          <div className="pb-2">
            {groups.map((group) => (
              <div key={group.id} role="group" aria-labelledby={`groupe-${group.id}`}>
                <p
                  id={`groupe-${group.id}`}
                  className="px-[18px] pt-3.5 pb-1.5 text-[11.5px] font-bold tracking-[0.12em] text-muted uppercase"
                >
                  {group.title}
                </p>
                <ul>
                  {group.items.map((template) => (
                    <li key={template.id}>
                      <TemplateRow template={template} current={template.id === selected?.id} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <div ref={editorRef} className="min-w-0 scroll-mt-24">
          {selected ? (
            <TemplateEditor key={`${selected.id}-${selected.updatedAt}`} template={selected} />
          ) : null}
        </div>
      </div>

      <NewTemplateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(template) => {
          setCreating(false);
          void navigate({ search: `?${SELECTED_PARAM}=${template.key}` });
        }}
      />
    </AdminPage>
  );
}

function TemplateRow({ template, current }: { template: EmailTemplate; current: boolean }) {
  const { icon: TemplateIcon } = templateMeta(template.key);
  const automatic = template.kind === 'automatique';
  // Les réponses standards n'affichent leur état que lorsqu'elles sont masquées.
  const status = !template.active ? (
    <Badge tone="neutral">Inactif</Badge>
  ) : automatic ? (
    <Badge tone="success">Actif</Badge>
  ) : null;
  return (
    <Link
      to={{ search: `?${SELECTED_PARAM}=${template.key}` }}
      aria-current={current ? 'true' : undefined}
      className={cn(
        'flex items-center gap-3 border-l-[3px] border-transparent px-[15px] py-3 transition-colors hover:bg-smoke',
        current && 'border-brand bg-brand-wash hover:bg-brand-wash',
      )}
    >
      <IconBox tone={automatic ? 'brand' : 'success'} size="xs">
        <TemplateIcon />
      </IconBox>
      <span className="min-w-0 flex-1">
        <strong className="block text-[14.5px] leading-snug font-semibold text-ink">{template.name}</strong>
        <span className="text-[12.5px] text-muted">{template.trigger}</span>
      </span>
      {status}
    </Link>
  );
}

const toValues = (template: EmailTemplate): EmailTemplateValues => ({
  name: template.name,
  senderName: template.senderName,
  replyTo: template.replyTo,
  subject: template.subject,
  heading: template.heading,
  body: template.body,
  active: template.active,
});

/** Champs rétablis par « Rétablir le modèle par défaut ». */
const RESTORABLE_FIELDS = ['senderName', 'replyTo', 'subject', 'heading', 'body'] as const;

function TemplateEditor({ template }: { template: EmailTemplate }) {
  const session = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settings = useSiteSettings();
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const formId = useId();
  const meta = templateMeta(template.key);
  const system = isSystemTemplate(template.key);
  const automatic = template.kind === 'automatique';
  const [preview, setPreview] = useState<EmailContent | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<EmailTemplateValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: toValues(template),
  });
  const active = useWatch({ control, name: 'active' });

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates });

  const save = useMutation({
    mutationFn: (values: EmailTemplateValues) =>
      emailTemplatesRepository.update(template.id, values, session.name),
    onSuccess: (saved, values) => {
      // Le formulaire repart des valeurs enregistrées avant le rechargement de la liste.
      reset(values);
      toast.success(`Modèle « ${saved.name} » enregistré.`);
      return refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => emailTemplatesRepository.remove(template.id, session.name),
    onSuccess: async () => {
      reset(getValues());
      setConfirmingDelete(false);
      toast.success(`Modèle « ${template.name} » supprimé.`);
      await refresh();
      void navigate({ search: '' }, { replace: true });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const draft = (): EmailContent => ({ key: template.key, ...getValues() });

  const restoreDefault = () => {
    const original = isSystemTemplate(template.key) ? defaultEmailTemplate(template.key) : undefined;
    if (!original) return;
    for (const field of RESTORABLE_FIELDS)
      setValue(field, original[field], { shouldDirty: true, shouldValidate: true });
    toast.info('Texte d’origine rétabli. Enregistrez pour l’appliquer.');
  };

  /** Phase statique : le test s'ouvre dans la messagerie de l'utilisateur, avec les données d'exemple. */
  const sendTest = () => {
    const siteUrl = window.location.origin;
    const content = draft();
    const { values } = previewData(template.key, settings, services, siteUrl);
    const text = [fillTemplate(content.heading, values), emailBodyToText(content.body, values, siteUrl)]
      .filter(Boolean)
      .join('\n\n');
    const subject = `[Test] ${fillTemplate(content.subject, values)}`;
    window.open(
      `mailto:${encodeURIComponent(session.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      '_self',
    );
    toast.info(`Votre messagerie s’ouvre avec un e-mail de test adressé à ${session.email}.`);
  };

  const titleId = `${formId}-titre`;

  return (
    <Panel labelledBy={titleId}>
      <UnsavedChangesGuard when={isDirty && !save.isPending && !remove.isPending} includeSearch />
      <PanelHeader
        titleId={titleId}
        title={template.name}
        description={meta.description}
        action={
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <span
                className="flex items-center gap-2.5 text-[13px] font-semibold"
                title={meta.required ? 'Indispensable à la sécurité des comptes' : undefined}
              >
                {field.value ? 'Actif' : 'Inactif'}
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={meta.required}
                  label={
                    meta.required
                      ? `Modèle « ${template.name} » toujours actif`
                      : `Modèle « ${template.name} » actif`
                  }
                />
              </span>
            )}
          />
        }
      />
      <form id={formId} noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
        <PanelBody className="flex flex-col gap-4">
          {!active ? (
            <Callout tone="warning" icon={<IconWarning />} title="Modèle désactivé">
              <p>
                {automatic
                  ? 'Cet e-mail n’est plus envoyé. Réactivez le modèle puis enregistrez pour reprendre les envois.'
                  : 'Cette réponse n’est plus proposée dans la fiche des demandes.'}
              </p>
            </Callout>
          ) : null}
          {!system ? (
            <Field label="Nom du modèle" id={`${formId}-nom`} error={errors.name?.message} density="compact">
              <Input density="compact" {...register('name')} />
            </Field>
          ) : null}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <Field
              label="Nom de l’expéditeur"
              id={`${formId}-expediteur`}
              error={errors.senderName?.message}
              density="compact"
            >
              <Input density="compact" {...register('senderName')} />
            </Field>
            <Field
              label="Adresse de réponse"
              id={`${formId}-reponse`}
              error={errors.replyTo?.message}
              density="compact"
            >
              <Input type="email" density="compact" {...register('replyTo')} />
            </Field>
          </div>
          <Field label="Objet" id={`${formId}-objet`} error={errors.subject?.message} density="compact">
            <Input density="compact" {...register('subject')} />
          </Field>
          {automatic ? (
            <Field
              label="Titre de l’e-mail"
              id={`${formId}-titre-email`}
              error={errors.heading?.message}
              hint="Grand titre affiché en haut du message."
              density="compact"
            >
              <Input density="compact" {...register('heading')} />
            </Field>
          ) : null}
          <Field label="Message" id={`${formId}-message`} error={errors.body?.message} density="compact">
            <Controller
              control={control}
              name="body"
              render={({ field }) => (
                <EmailBodyEditor
                  value={field.value}
                  onChange={field.onChange}
                  variables={variablesFor(template.key)}
                />
              )}
            />
          </Field>
          {automatic ? (
            <p className="flex items-start gap-2 text-[13px] text-muted">
              <IconInfo className="mt-0.5 size-4 shrink-0" aria-hidden />
              Le récapitulatif, les boutons et le pied de page sont ajoutés automatiquement : utilisez «
              Aperçu » pour voir l’e-mail complet.
            </p>
          ) : null}
        </PanelBody>
      </form>
      <PanelFooter>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            shape="rounded"
            icon={<IconPreview />}
            onClick={() => setPreview(draft())}
          >
            Aperçu
          </Button>
          <Button variant="outline" size="sm" shape="rounded" icon={<IconSend />} onClick={sendTest}>
            M’envoyer un test
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {system ? (
            <Button variant="outline" shape="rounded" icon={<IconRestore />} onClick={restoreDefault}>
              Rétablir le modèle par défaut
            </Button>
          ) : (
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconDelete />}
              onClick={() => setConfirmingDelete(true)}
            >
              Supprimer
            </Button>
          )}
          <Button
            type="submit"
            form={formId}
            shape="rounded"
            icon={<IconCheck />}
            loading={save.isPending}
            disabled={!isDirty}
          >
            Enregistrer
          </Button>
        </div>
      </PanelFooter>

      <Dialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        size="xl"
        scrollable
        title={`Aperçu : ${template.name}`}
        description={isDirty ? 'Aperçu de vos modifications, avant enregistrement.' : undefined}
        footer={
          <>
            {!isDirty ? (
              <TextLink
                to={ROUTES.admin.emailPreview(template.key)}
                className="mr-auto self-center text-sm"
                target="_blank"
                rel="noopener"
              >
                Ouvrir en pleine page
              </TextLink>
            ) : null}
            <Button variant="outline" shape="rounded" onClick={() => setPreview(null)}>
              Fermer
            </Button>
          </>
        }
      >
        {preview ? <EmailPreview content={preview} name={template.name} /> : null}
      </Dialog>

      <Dialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        role="alertdialog"
        size="sm"
        title={`Supprimer « ${template.name} » ?`}
        description="La réponse ne sera plus proposée dans la fiche des demandes. Les e-mails déjà envoyés ne sont pas concernés."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setConfirmingDelete(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              shape="rounded"
              loading={remove.isPending}
              onClick={() => remove.mutate()}
            >
              Supprimer le modèle
            </Button>
          </>
        }
      />
    </Panel>
  );
}
