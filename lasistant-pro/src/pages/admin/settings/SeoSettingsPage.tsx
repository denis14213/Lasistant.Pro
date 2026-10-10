import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { allArticlesQuery, backupRepository, getErrorMessage, servicesQuery, settingsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage, AdminPageHeader, Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { KeyValueList } from '@/components/admin/KeyValueList';
import { CharCount, SerpPreview } from '@/components/admin/SeoPreview';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, ButtonAnchor, Dialog, ToValidate } from '@/components/ui';
import { Field, FormErrorSummary, Input, Select, Switch, Textarea } from '@/components/ui/form';
import { IconHistory, IconRetry, IconUpload } from '@/components/ui/icons';
import { IconArchive, IconDownload, IconPreview } from '@/components/ui/icons-admin';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { countDirty } from '@/features/admin/settings/count-dirty';
import { SaveBar, SettingsTabs, ToggleRow } from '@/features/admin/settings/SettingsParts';
import { useSaveSettings } from '@/features/admin/settings/useSaveSettings';
import { useSession } from '@/features/auth/auth-context';
import { addressLine, primaryPhone } from '@/features/settings/useSiteSettings';
import { useToast } from '@/features/toasts/toast-context';
import { downloadText } from '@/lib/download';
import { formatDateTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import { buildSitemapUrls, buildSitemapXml } from '@/lib/sitemap';
import { seoSettingsSchema, type SeoSettingsValues } from '@/lib/validation/admin-forms';
import type { SiteSettings } from '@/types';

export const loader = () => prefetch(settingsQuery(), servicesQuery(true), allArticlesQuery());

function toValues(settings: SiteSettings): SeoSettingsValues {
  return {
    homeTitle: settings.seo.homeTitle,
    titleTemplate: settings.seo.titleTemplate,
    defaultDescription: settings.seo.defaultDescription,
    structuredData: settings.seo.structuredData,
    robotsTxt: settings.seo.robotsTxt,
    analyticsEnabled: settings.analytics.enabled,
    analyticsProvider: settings.analytics.provider ?? '',
    analyticsSiteId: settings.analytics.siteId ?? '',
    trackConversions: settings.analytics.trackConversions,
    maintenanceEnabled: settings.maintenance.enabled,
    maintenanceMessage: settings.maintenance.message,
    maintenanceReturnAt: settings.maintenance.returnAt ? settings.maintenance.returnAt.slice(0, 16) : '',
  };
}

const FIELD_LABELS = {
  homeTitle: 'Titre de l’accueil',
  titleTemplate: 'Modèle de titre',
  defaultDescription: 'Description par défaut',
  maintenanceMessage: 'Message de maintenance',
} as const;

/** Référencement, mesure d'audience, fichiers techniques, sauvegardes et maintenance (cahier § 8.8 et § 11). */
export function Component() {
  const { data: settings } = useSuspenseQuery(settingsQuery());
  return <SeoForm key={settings.updatedAt} settings={settings} />;
}

function SeoForm({ settings }: { settings: SiteSettings }) {
  const formId = useId();
  const session = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const restoreInput = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<File | null>(null);
  const [backupBusy, setBackupBusy] = useState<'export' | 'restore' | null>(null);
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { data: articles } = useSuspenseQuery(allArticlesQuery());
  const save = useSaveSettings('Réglages enregistrés.');
  const saveBackup = useSaveSettings('Sauvegarde téléchargée.');
  const isAdmin = can(session.role, 'users:manage');
  const form = useForm<SeoSettingsValues>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: toValues(settings),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors, dirtyFields, isDirty, submitCount } = formState;
  const [homeTitle, defaultDescription, maintenanceEnabled] = useWatch({
    control,
    name: ['homeTitle', 'defaultDescription', 'maintenanceEnabled'],
  });
  const sitemapCount = buildSitemapUrls(services, articles).length;

  const onSubmit = handleSubmit((values) => {
    save.mutate({
      seo: {
        ...settings.seo,
        homeTitle: values.homeTitle,
        titleTemplate: values.titleTemplate,
        defaultDescription: values.defaultDescription,
        structuredData: values.structuredData,
        robotsTxt: values.robotsTxt,
      },
      analytics: {
        ...settings.analytics,
        enabled: values.analyticsEnabled,
        provider: values.analyticsProvider || null,
        siteId: values.analyticsSiteId || null,
        trackConversions: values.trackConversions,
      },
      maintenance: {
        enabled: values.maintenanceEnabled,
        message: values.maintenanceMessage,
        returnAt: values.maintenanceReturnAt ? new Date(values.maintenanceReturnAt).toISOString() : null,
      },
    });
  });

  const downloadBackup = async () => {
    setBackupBusy('export');
    try {
      downloadText(
        `sauvegarde-lasistant-${new Date().toISOString().slice(0, 10)}.json`,
        await backupRepository.export(),
        'application/json',
      );
      saveBackup.mutate({ backups: { ...settings.backups, lastBackupAt: new Date().toISOString() } });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBackupBusy(null);
    }
  };

  const restore = async (file: File) => {
    setPendingRestore(null);
    setBackupBusy('restore');
    try {
      await backupRepository.restore(await file.text());
    } catch (error) {
      toast.error(getErrorMessage(error));
      setBackupBusy(null);
      return;
    }
    queryClient.clear();
    toast.success('Sauvegarde restaurée.');
    window.location.reload();
  };

  return (
    <AdminPage className="pb-0 md:pb-0">
      <Seo title="SEO, analytics & maintenance" description="Référencement et réglages techniques." noIndex />
      <UnsavedChangesGuard when={isDirty && !save.isPending} />
      <AdminPageHeader
        title="Coordonnées & réglages"
        description="Référencement, mesure d’audience, fichiers techniques et mode maintenance."
      />
      <SettingsTabs />
      <FormErrorSummary errors={errors} labels={FIELD_LABELS} submitCount={submitCount} />

      <form
        id={formId}
        noValidate
        onSubmit={onSubmit}
        className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          <Panel labelledBy={`${formId}-seo`}>
            <PanelHeader titleId={`${formId}-seo`} title="Référencement par défaut" />
            <PanelBody className="flex flex-col gap-3.5">
              <Field
                label="Titre de l’accueil"
                id="homeTitle"
                error={errors.homeTitle?.message}
                labelAside={<CharCount value={homeTitle} max={60} min={10} />}
                density="compact"
              >
                <Input density="compact" {...register('homeTitle')} />
              </Field>
              <Field
                label="Modèle de titre des pages"
                id="titleTemplate"
                error={errors.titleTemplate?.message}
                hint="« %s » est remplacé par le titre de chaque page."
                density="compact"
              >
                <Input density="compact" className="font-mono text-[13.5px]" {...register('titleTemplate')} />
              </Field>
              <Field
                label="Description par défaut"
                id="defaultDescription"
                error={errors.defaultDescription?.message}
                labelAside={<CharCount value={defaultDescription} max={160} min={50} />}
                density="compact"
              >
                <Textarea density="compact" rows={3} {...register('defaultDescription')} />
              </Field>
              <div className="flex items-center gap-3">
                <img
                  src={settings.seo.shareImage}
                  alt=""
                  className="h-20 w-[150px] rounded-[10px] object-cover"
                />
                <p className="text-[13.5px] text-muted">
                  Image de partage (réseaux sociaux) · 1200 × 630 px · fichier « og-image.jpg » du site.
                </p>
              </div>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-structure`}>
            <PanelHeader
              titleId={`${formId}-structure`}
              title="Données structurées"
              description="Aident les moteurs de recherche à présenter votre activité"
              action={
                <Controller
                  control={control}
                  name="structuredData"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      label="Données structurées"
                    />
                  )}
                />
              }
            />
            <PanelBody>
              <KeyValueList
                items={[
                  { label: 'Type', value: 'LocalBusiness · Organization' },
                  { label: 'Nom', value: settings.brandName },
                  { label: 'Téléphone', value: primaryPhone(settings) ?? '—' },
                  {
                    label: 'Adresse',
                    value: (
                      <>
                        {addressLine(settings)}{' '}
                        {settings.address.validated ? null : (
                          <ToValidate>adresse complète à valider</ToValidate>
                        )}
                      </>
                    ),
                  },
                  {
                    label: 'Source',
                    value: <span className="text-muted">Synchronisé avec « Identité & coordonnées »</span>,
                  },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-fichiers`}>
            <PanelHeader titleId={`${formId}-fichiers`} title="Fichiers techniques" />
            <PanelBody className="flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">sitemap.xml</p>
                  <p className="text-[13.5px] text-muted">
                    {sitemapCount} adresses (pages, services actifs et articles publiés)
                  </p>
                </div>
                <div className="flex gap-2">
                  <ButtonAnchor
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener"
                    variant="outline"
                    size="sm"
                    shape="rounded"
                    icon={<IconPreview />}
                  >
                    Voir
                  </ButtonAnchor>
                  <Button
                    variant="outline"
                    size="sm"
                    shape="rounded"
                    icon={<IconRetry />}
                    onClick={() => {
                      downloadText(
                        'sitemap.xml',
                        buildSitemapXml(env.siteUrl, services, articles),
                        'application/xml',
                      );
                      toast.success('Plan du site regénéré : fichier téléchargé, à publier avec le site.');
                    }}
                  >
                    Regénérer
                  </Button>
                </div>
              </div>
              <Field
                label="robots.txt"
                id="robotsTxt"
                hint="Pages exclues des moteurs de recherche et adresse du plan du site."
                density="compact"
              >
                <Textarea
                  density="compact"
                  rows={5}
                  className="font-mono text-[13px]"
                  {...register('robotsTxt')}
                />
              </Field>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-audience`}>
            <PanelHeader
              titleId={`${formId}-audience`}
              title="Mesure d’audience"
              description="À activer après validation de l’outil et de la politique de confidentialité"
              action={
                <Controller
                  control={control}
                  name="analyticsEnabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      label="Mesure d’audience"
                    />
                  )}
                />
              }
            />
            <PanelBody className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <Field
                  label="Outil"
                  id="analyticsProvider"
                  hint={<ToValidate>solution respectueuse de la vie privée à valider</ToValidate>}
                  density="compact"
                >
                  <Select density="compact" {...register('analyticsProvider')}>
                    <option value="">À choisir</option>
                    <option value="plausible">Plausible</option>
                    <option value="matomo">Matomo</option>
                    <option value="umami">Umami</option>
                  </Select>
                </Field>
                <Field label="Identifiant du site" id="analyticsSiteId" density="compact">
                  <Input density="compact" placeholder="À renseigner" {...register('analyticsSiteId')} />
                </Field>
              </div>
              <ToggleRow
                title="Uniquement après consentement"
                hint="Aucune mesure tant que le visiteur n’a pas accepté les cookies d’audience."
                control={
                  <Switch
                    checked
                    disabled
                    onCheckedChange={() => undefined}
                    label="Consentement obligatoire (verrouillé)"
                  />
                }
              />
              <ToggleRow
                title="Suivi des conversions"
                hint="Compter les demandes envoyées (réservation, logement, contact)."
                control={
                  <Controller
                    control={control}
                    name="trackConversions"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Suivi des conversions"
                      />
                    )}
                  />
                }
              />
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-sauvegardes`}>
            <PanelHeader
              titleId={`${formId}-sauvegardes`}
              title="Sauvegardes"
              description="Base de données et médias"
              action={<Badge tone="success">Dernière sauvegarde réussie</Badge>}
            />
            <PanelBody className="flex flex-col gap-3.5">
              <KeyValueList
                items={[
                  { label: 'Dernière sauvegarde', value: formatDateTime(settings.backups.lastBackupAt) },
                  {
                    label: 'Fréquence',
                    value: (
                      <>
                        {settings.backups.frequency} <ToValidate>à valider</ToValidate>
                      </>
                    ),
                  },
                  {
                    label: 'Conservation',
                    value: (
                      <>
                        {settings.backups.retentionDays} jours <ToValidate>à valider</ToValidate>
                      </>
                    ),
                  },
                  { label: 'Emplacement', value: 'Stockage chiffré, distinct du site' },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconDownload />}
                  loading={saveBackup.isPending || backupBusy === 'export'}
                  disabled={isDirty || backupBusy !== null}
                  title={isDirty ? 'Enregistrez d’abord vos modifications' : undefined}
                  onClick={() => void downloadBackup()}
                >
                  Télécharger une sauvegarde
                </Button>
                {isAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    shape="rounded"
                    icon={<IconHistory />}
                    loading={backupBusy === 'restore'}
                    disabled={backupBusy !== null}
                    onClick={() => restoreInput.current?.click()}
                  >
                    Restaurer une sauvegarde
                  </Button>
                ) : null}
                <input
                  ref={restoreInput}
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(event) => {
                    setPendingRestore(event.target.files?.[0] ?? null);
                    event.target.value = '';
                  }}
                />
              </div>
              <p className="flex items-start gap-2 text-[13.5px] text-muted">
                <IconArchive className="mt-0.5 size-4 shrink-0" aria-hidden />
                La restauration est réservée aux administrateurs. En production, elle demande une confirmation
                par double authentification.
              </p>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-maintenance`} className="border-warning-line">
            <PanelHeader
              titleId={`${formId}-maintenance`}
              title="Mode maintenance"
              description="Affiche la page de maintenance aux visiteurs. L’équipe connectée voit le site normalement."
              action={
                <Controller
                  control={control}
                  name="maintenanceEnabled"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} label="Mode maintenance" />
                  )}
                />
              }
            />
            <PanelBody className="flex flex-col gap-3.5">
              {maintenanceEnabled ? (
                <p
                  className="rounded-xl border border-warning-line bg-gold-wash px-4 py-3 text-[13.5px] font-semibold text-gold-dark"
                  role="status"
                >
                  Après enregistrement, les visiteurs verront uniquement la page de maintenance.
                </p>
              ) : null}
              <Field
                label="Message affiché"
                id="maintenanceMessage"
                error={errors.maintenanceMessage?.message}
                density="compact"
              >
                <Input density="compact" {...register('maintenanceMessage')} />
              </Field>
              <div className="grid grid-cols-1 items-end gap-3.5 md:grid-cols-2">
                <Field label="Retour prévu" id="maintenanceReturnAt" optional density="compact">
                  <Input type="datetime-local" density="compact" {...register('maintenanceReturnAt')} />
                </Field>
                <ButtonAnchor
                  href={ROUTES.maintenance}
                  target="_blank"
                  rel="noopener"
                  variant="outline"
                  shape="rounded"
                  icon={<IconPreview />}
                >
                  Voir la page de maintenance
                </ButtonAnchor>
              </div>
            </PanelBody>
          </Panel>
        </div>

        <aside aria-label="Aperçus" className="flex flex-col gap-5 xl:sticky xl:top-[92px]">
          <Panel labelledBy={`${formId}-google`}>
            <PanelHeader titleId={`${formId}-google`} title="Aperçu Google" />
            <PanelBody>
              <SerpPreview url="lasistant.pro" title={homeTitle} description={defaultDescription} />
            </PanelBody>
          </Panel>
          <Panel labelledBy={`${formId}-partage`}>
            <PanelHeader titleId={`${formId}-partage`} title="Aperçu du partage" />
            <PanelBody>
              <div className="overflow-hidden rounded-xl border border-line">
                <img src={settings.seo.shareImage} alt="" className="h-[170px] w-full object-cover" />
                <div className="bg-smoke px-3.5 py-3">
                  <p className="text-xs tracking-[0.06em] text-muted uppercase">lasistant.pro</p>
                  <p className="text-[15px] font-semibold">{homeTitle}</p>
                </div>
              </div>
            </PanelBody>
          </Panel>
          <Panel as="div">
            <PanelBody className="flex items-center gap-2 text-[13px] text-muted">
              <IconUpload className="size-4" aria-hidden />
              Dernière modification : {formatDateTime(settings.updatedAt)} par {settings.updatedBy}
            </PanelBody>
          </Panel>
        </aside>
      </form>

      <SaveBar
        changes={countDirty(dirtyFields)}
        saving={save.isPending}
        onCancel={() => reset(toValues(settings))}
        formId={formId}
      />

      <Dialog
        open={pendingRestore !== null}
        onClose={() => setPendingRestore(null)}
        role="alertdialog"
        size="sm"
        title="Restaurer cette sauvegarde ?"
        description="Les contenus et réglages du site (services, articles, FAQ, modèles d’e-mails, coordonnées, SEO) seront remplacés par ceux de la sauvegarde. Les demandes reçues depuis sont conservées."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setPendingRestore(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              shape="rounded"
              icon={<IconHistory />}
              onClick={() => pendingRestore && void restore(pendingRestore)}
            >
              Restaurer
            </Button>
          </>
        }
      />
    </AdminPage>
  );
}
