import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { settingsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage, AdminPageHeader, Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Seo } from '@/components/seo/Seo';
import { ButtonAnchor, Callout } from '@/components/ui';
import { Field, Input } from '@/components/ui/form';
import { IconLegal, IconPreview } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { countDirty } from '@/features/admin/settings/count-dirty';
import { SaveBar, SettingsTabs } from '@/features/admin/settings/SettingsParts';
import { useSaveSettings } from '@/features/admin/settings/useSaveSettings';
import { legalSettingsSchema, type LegalSettingsValues } from '@/lib/validation/admin-forms';
import type { SiteSettings } from '@/types';

export const loader = () => prefetch(settingsQuery());

function toValues(settings: SiteSettings): LegalSettingsValues {
  const { legal } = settings;
  return {
    companyName: legal.companyName ?? '',
    legalForm: legal.legalForm ?? '',
    taxId: legal.taxId ?? '',
    registryNumber: legal.registryNumber ?? '',
    publicationDirector: legal.publicationDirector ?? '',
    host: legal.host ?? '',
    lastUpdated: legal.lastUpdated ? legal.lastUpdated.slice(0, 10) : '',
  };
}

const FIELDS: Array<{ name: keyof LegalSettingsValues; label: string; placeholder: string }> = [
  {
    name: 'companyName',
    label: 'Dénomination officielle',
    placeholder: 'Raison sociale inscrite au registre',
  },
  { name: 'legalForm', label: 'Forme juridique', placeholder: 'SARL, SUARL…' },
  { name: 'taxId', label: 'Matricule fiscal', placeholder: 'À compléter' },
  { name: 'registryNumber', label: 'Registre national des entreprises', placeholder: 'Identifiant unique' },
  { name: 'publicationDirector', label: 'Directeur de la publication', placeholder: 'Nom et fonction' },
  { name: 'host', label: 'Hébergeur du site', placeholder: 'Nom, adresse et coordonnées' },
];

/** Informations légales de l'éditeur, reprises dans les mentions légales du site. */
export function Component() {
  const { data: settings } = useSuspenseQuery(settingsQuery());
  return <LegalForm key={settings.updatedAt} settings={settings} />;
}

function LegalForm({ settings }: { settings: SiteSettings }) {
  const formId = useId();
  const save = useSaveSettings('Informations légales enregistrées : les mentions légales sont à jour.');
  const { register, handleSubmit, reset, formState } = useForm<LegalSettingsValues>({
    resolver: zodResolver(legalSettingsSchema),
    defaultValues: toValues(settings),
  });
  const { dirtyFields, isDirty } = formState;
  const empty = (value: string) => (value.trim() === '' ? null : value.trim());

  const onSubmit = handleSubmit((values) =>
    save.mutate({
      legal: {
        companyName: empty(values.companyName),
        legalForm: empty(values.legalForm),
        taxId: empty(values.taxId),
        registryNumber: empty(values.registryNumber),
        publicationDirector: empty(values.publicationDirector),
        host: empty(values.host),
        lastUpdated: values.lastUpdated ? new Date(`${values.lastUpdated}T12:00:00`).toISOString() : null,
      },
    }),
  );

  return (
    <AdminPage className="pb-0 md:pb-0">
      <Seo title="Mentions légales" description="Informations légales de l’éditeur." noIndex />
      <UnsavedChangesGuard when={isDirty && !save.isPending} />
      <AdminPageHeader
        title="Coordonnées & réglages"
        description="Informations légales de l’éditeur, publiées dans les mentions légales."
        actions={
          <ButtonAnchor
            href={ROUTES.legalNotice}
            target="_blank"
            rel="noopener"
            variant="outline"
            shape="rounded"
            icon={<IconPreview />}
          >
            Voir les mentions légales
          </ButtonAnchor>
        }
      />
      <SettingsTabs />
      <form id={formId} noValidate onSubmit={onSubmit} className="flex max-w-[860px] flex-col gap-5">
        <Callout tone="warning" icon={<IconLegal />} title="À compléter avant publication">
          <p>
            Les champs vides apparaissent sur le site avec la mention « à valider ». Ces textes doivent être
            validés par un conseil juridique.
          </p>
        </Callout>
        <Panel labelledBy={`${formId}-editeur`}>
          <PanelHeader titleId={`${formId}-editeur`} title="Éditeur du site" />
          <PanelBody className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {FIELDS.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                id={field.name}
                density="compact"
                className={field.name === 'host' ? 'md:col-span-2' : undefined}
              >
                <Input density="compact" placeholder={field.placeholder} {...register(field.name)} />
              </Field>
            ))}
            <Field label="Date de dernière mise à jour" id="lastUpdated" density="compact">
              <Input type="date" density="compact" {...register('lastUpdated')} />
            </Field>
          </PanelBody>
        </Panel>
      </form>
      <SaveBar
        changes={countDirty(dirtyFields)}
        saving={save.isPending}
        onCancel={() => reset(toValues(settings))}
        formId={formId}
      />
    </AdminPage>
  );
}
