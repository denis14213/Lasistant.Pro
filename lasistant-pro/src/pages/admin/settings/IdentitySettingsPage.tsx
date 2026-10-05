import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useId, type ReactNode } from 'react';
import { Controller, useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { settingsQuery } from '@/api';
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
import { LogoMark } from '@/components/brand/Logo';
import { Seo } from '@/components/seo/Seo';
import { Button, IconButton, Tag, ToValidate } from '@/components/ui';
import { Field, FormErrorSummary, Input, Switch } from '@/components/ui/form';
import { IconAdd, IconAddress, IconDelete, IconEmail, IconPhone, IconWarning } from '@/components/ui/icons';
import { IconMoveDown, IconMoveUp } from '@/components/ui/icons-admin';
import { countDirty } from '@/features/admin/settings/count-dirty';
import { SaveBar, SettingsTabs, ToggleRow } from '@/features/admin/settings/SettingsParts';
import { useSaveSettings } from '@/features/admin/settings/useSaveSettings';
import { formatDateTime } from '@/lib/format';
import { uniqueId } from '@/lib/ids';
import { identitySettingsSchema, type IdentitySettingsValues } from '@/lib/validation/admin-forms';
import type { SiteSettings } from '@/types';

export const loader = () => prefetch(settingsQuery());

function toValues(settings: SiteSettings): IdentitySettingsValues {
  return {
    brandName: settings.brandName,
    tagline: settings.tagline,
    phones: settings.phones,
    emails: settings.emails.map((email) => ({
      ...email,
      receivesNotifications: email.receivesNotifications ?? false,
    })),
    street: settings.address.street,
    postalCode: settings.address.postalCode ?? '',
    city: settings.address.city ?? '',
    openingHours: settings.openingHours ?? '',
    facebookUrl: settings.facebook.url ?? '',
    addressValidated: settings.address.validated,
    whatsappEnabled: settings.whatsapp.enabled,
    whatsappNumber: settings.whatsapp.number ?? '',
  };
}

const FIELD_LABELS = {
  brandName: 'Nom de la marque',
  tagline: 'Accroche',
  phones: 'Téléphones',
  emails: 'Adresses e-mail',
  street: 'Rue',
  facebookUrl: 'Page Facebook',
} as const;

/** Identité et coordonnées : alimentent l'en-tête, le pied de page, la page Contact et les e-mails (cahier § 8.8). */
export function Component() {
  const { data: settings } = useSuspenseQuery(settingsQuery());
  return <IdentityForm key={settings.updatedAt} settings={settings} />;
}

function IdentityForm({ settings }: { settings: SiteSettings }) {
  const formId = useId();
  const save = useSaveSettings('Coordonnées enregistrées : le site est à jour.');
  const form = useForm<IdentitySettingsValues>({
    resolver: zodResolver(identitySettingsSchema),
    defaultValues: toValues(settings),
  });
  const { register, control, handleSubmit, reset, setValue, formState } = form;
  const { errors, dirtyFields, isDirty, submitCount } = formState;
  // « keyName » : la clé technique des lignes ne doit pas écraser l'identifiant des coordonnées.
  const phones = useFieldArray({ control, name: 'phones', keyName: 'key' });
  const emails = useFieldArray({ control, name: 'emails', keyName: 'key' });
  const [postalCode, city, addressValidated] = useWatch({
    control,
    name: ['postalCode', 'city', 'addressValidated'],
  });
  const canValidateAddress = postalCode.trim() !== '' && city.trim() !== '';

  const onSubmit = handleSubmit((values) => {
    save.mutate({
      brandName: values.brandName,
      tagline: values.tagline,
      phones: values.phones,
      emails: values.emails,
      address: {
        street: values.street,
        postalCode: values.postalCode || null,
        city: values.city || null,
        country: settings.address.country,
        validated: values.addressValidated && canValidateAddress,
      },
      openingHours: values.openingHours || null,
      facebook: { ...settings.facebook, url: values.facebookUrl || null },
      whatsapp: { enabled: values.whatsappEnabled, number: values.whatsappNumber || null },
    });
  });

  return (
    <AdminPage className="pb-0 md:pb-0">
      <Seo title="Coordonnées & réglages" description="Identité et coordonnées du site." noIndex />
      <UnsavedChangesGuard when={isDirty && !save.isPending} />
      <AdminPageHeader
        title="Coordonnées & réglages"
        description="Ces informations alimentent automatiquement l’en-tête, le pied de page, la page Contact et les e-mails."
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
          <Panel labelledBy={`${formId}-identite`}>
            <PanelHeader titleId={`${formId}-identite`} title="Identité de la marque" />
            <PanelBody className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <Field
                  label="Nom de la marque"
                  id="brandName"
                  error={errors.brandName?.message}
                  density="compact"
                >
                  <Input density="compact" {...register('brandName')} />
                </Field>
                <Field label="Accroche" id="tagline" error={errors.tagline?.message} density="compact">
                  <Input density="compact" {...register('tagline')} />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-16 items-center justify-center rounded-2xl border border-line bg-white p-2">
                  <LogoMark size={46} />
                </span>
                <p className="text-[13.5px] text-muted">
                  Icône et logo du site · logo complet horizontal (SVG ou PNG haute définition) :{' '}
                  <ToValidate>fichier officiel à fournir</ToValidate>
                </p>
              </div>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-telephones`}>
            <PanelHeader
              titleId={`${formId}-telephones`}
              title="Téléphones"
              description="Le premier numéro actif est mis en avant sur le site."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconAdd />}
                  onClick={() =>
                    phones.append({ id: uniqueId('tel'), label: 'Autre', value: '', active: true })
                  }
                >
                  Ajouter
                </Button>
              }
            />
            <ul>
              {phones.fields.map((phone, index) => (
                <ContactRow
                  key={phone.key}
                  control={control}
                  kind="phones"
                  index={index}
                  count={phones.fields.length}
                  onMove={(to) => phones.move(index, to)}
                  onRemove={() => phones.remove(index)}
                  labelInput={
                    <Input
                      density="compact"
                      aria-label={`Libellé du numéro ${index + 1}`}
                      className="max-w-[140px]"
                      {...register(`phones.${index}.label`)}
                    />
                  }
                  valueInput={
                    <Input
                      type="tel"
                      density="compact"
                      aria-label={`Numéro ${index + 1}`}
                      aria-invalid={errors.phones?.[index]?.value ? true : undefined}
                      {...register(`phones.${index}.value`)}
                    />
                  }
                />
              ))}
            </ul>
          </Panel>

          <Panel labelledBy={`${formId}-emails`}>
            <PanelHeader
              titleId={`${formId}-emails`}
              title="Adresses e-mail"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconAdd />}
                  onClick={() =>
                    emails.append({
                      id: uniqueId('mail'),
                      label: 'Autre',
                      value: '',
                      active: true,
                      receivesNotifications: false,
                    })
                  }
                >
                  Ajouter
                </Button>
              }
            />
            <ul>
              {emails.fields.map((email, index) => (
                <ContactRow
                  key={email.key}
                  control={control}
                  kind="emails"
                  index={index}
                  count={emails.fields.length}
                  onMove={(to) => emails.move(index, to)}
                  onRemove={() => emails.remove(index)}
                  valueInput={
                    <Input
                      type="email"
                      density="compact"
                      aria-label={`Adresse e-mail ${index + 1}`}
                      aria-invalid={errors.emails?.[index]?.value ? true : undefined}
                      {...register(`emails.${index}.value`)}
                    />
                  }
                  extra={
                    <Controller
                      control={control}
                      name={`emails.${index}.receivesNotifications`}
                      render={({ field }) => (
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[13px] font-medium whitespace-nowrap">
                          <input
                            type="radio"
                            name="adresse-notifications"
                            checked={Boolean(field.value)}
                            onChange={() =>
                              emails.fields.forEach((_, other) =>
                                setValue(`emails.${other}.receivesNotifications`, other === index, {
                                  shouldDirty: true,
                                }),
                              )
                            }
                            className="size-4 accent-brand"
                          />
                          Notifications
                        </label>
                      )}
                    />
                  }
                />
              ))}
            </ul>
            <PanelFooter>
              <span>
                Les notifications de nouvelles demandes sont envoyées à l’adresse cochée « Notifications ».
              </span>
            </PanelFooter>
          </Panel>

          <Panel labelledBy={`${formId}-adresse`}>
            <PanelHeader
              titleId={`${formId}-adresse`}
              title="Adresse"
              action={
                addressValidated && canValidateAddress ? (
                  <Tag tone="success">Adresse validée</Tag>
                ) : (
                  <Tag tone="gold" icon={<IconWarning />}>
                    Adresse complète à valider
                  </Tag>
                )
              }
            />
            <PanelBody className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <Field
                  label="Rue"
                  id="street"
                  error={errors.street?.message}
                  density="compact"
                  className="md:col-span-2"
                >
                  <Input density="compact" {...register('street')} />
                </Field>
                <Field label="Code postal" id="postalCode" density="compact">
                  <Input density="compact" placeholder="À renseigner" {...register('postalCode')} />
                </Field>
                <Field label="Ville" id="city" density="compact">
                  <Input density="compact" placeholder="À renseigner" {...register('city')} />
                </Field>
                <Field
                  label="Horaires d’ouverture"
                  id="openingHours"
                  optional
                  density="compact"
                  className="md:col-span-2"
                >
                  <Input
                    density="compact"
                    placeholder="Ex. : du lundi au samedi, 9 h – 17 h"
                    {...register('openingHours')}
                  />
                </Field>
              </div>
              <ToggleRow
                title="Adresse complète validée"
                hint={
                  canValidateAddress
                    ? 'Active la carte et l’adresse complète sur la page Contact.'
                    : 'Renseignez le code postal et la ville pour valider l’adresse.'
                }
                control={
                  <Controller
                    control={control}
                    name="addressValidated"
                    render={({ field }) => (
                      <Switch
                        checked={field.value && canValidateAddress}
                        disabled={!canValidateAddress}
                        onCheckedChange={field.onChange}
                        label="Adresse complète validée"
                      />
                    )}
                  />
                }
              />
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-reseaux`}>
            <PanelHeader titleId={`${formId}-reseaux`} title="Réseaux sociaux & messagerie" />
            <PanelBody className="flex flex-col gap-3.5">
              <Field
                label="Page Facebook"
                id="facebookUrl"
                error={errors.facebookUrl?.message}
                hint={
                  <>
                    Nom affiché : {settings.facebook.label} ·{' '}
                    <ToValidate>adresse exacte à confirmer</ToValidate>
                  </>
                }
                density="compact"
              >
                <Input
                  type="url"
                  density="compact"
                  placeholder="https://www.facebook.com/…"
                  {...register('facebookUrl')}
                />
              </Field>
              <ToggleRow
                title="Bouton WhatsApp"
                hint="Bouton flottant WhatsApp sur toutes les pages du site et choix « WhatsApp » dans la réservation."
                control={
                  <Controller
                    control={control}
                    name="whatsappEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Bouton WhatsApp"
                      />
                    )}
                  />
                }
              />
              <Field label="Numéro WhatsApp" id="whatsappNumber" optional density="compact">
                <Input type="tel" density="compact" placeholder="+216 …" {...register('whatsappNumber')} />
              </Field>
            </PanelBody>
          </Panel>
        </div>

        <aside aria-label="Aperçu" className="flex flex-col gap-5 xl:sticky xl:top-[92px]">
          <Panel labelledBy={`${formId}-apercu`}>
            <PanelHeader
              titleId={`${formId}-apercu`}
              title="Aperçu du pied de page"
              description="Mis à jour en direct"
            />
            <PanelBody>
              <FooterPreview control={control} />
            </PanelBody>
          </Panel>
          <Panel as="div">
            <PanelBody className="flex flex-col gap-2">
              <p className="text-[15px] font-semibold">Dernière modification</p>
              <p className="text-[13px] text-muted">
                {formatDateTime(settings.updatedAt)} par {settings.updatedBy}
              </p>
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
    </AdminPage>
  );
}

interface ContactRowProps {
  control: Control<IdentitySettingsValues>;
  kind: 'phones' | 'emails';
  index: number;
  count: number;
  labelInput?: ReactNode;
  valueInput: ReactNode;
  extra?: ReactNode;
  onMove: (to: number) => void;
  onRemove: () => void;
}

/** Ligne d'une coordonnée : ordre, libellé, valeur, affichage sur le site, suppression. */
function ContactRow({
  control,
  kind,
  index,
  count,
  labelInput,
  valueInput,
  extra,
  onMove,
  onRemove,
}: ContactRowProps) {
  const noun = kind === 'phones' ? 'numéro' : 'adresse';
  return (
    <li className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3 last:border-b-0 sm:flex-nowrap">
      <div className="flex flex-col">
        <IconButton
          label={`Monter ce ${noun}`}
          variant="ghost"
          size="sm"
          className="size-6"
          disabled={index === 0}
          onClick={() => onMove(index - 1)}
        >
          <IconMoveUp aria-hidden />
        </IconButton>
        <IconButton
          label={`Descendre ce ${noun}`}
          variant="ghost"
          size="sm"
          className="size-6"
          disabled={index === count - 1}
          onClick={() => onMove(index + 1)}
        >
          <IconMoveDown aria-hidden />
        </IconButton>
      </div>
      {labelInput}
      <div className="min-w-[200px] flex-1">{valueInput}</div>
      {extra}
      <Controller
        control={control}
        name={`${kind}.${index}.active`}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            label={`Afficher ce ${noun} sur le site`}
          />
        )}
      />
      <IconButton
        label={`Supprimer ce ${noun}`}
        variant="ghost"
        size="sm"
        disabled={count === 1}
        onClick={onRemove}
      >
        <IconDelete aria-hidden />
      </IconButton>
    </li>
  );
}

/** Aperçu en direct des coordonnées affichées dans le pied de page. */
function FooterPreview({ control }: { control: Control<IdentitySettingsValues> }) {
  const [phones, emails, street, postalCode, city] = useWatch({
    control,
    name: ['phones', 'emails', 'street', 'postalCode', 'city'],
  });
  return (
    <div className="flex flex-col gap-3 rounded-[14px] bg-night p-5.5 text-[13.5px] text-on-dark">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-white p-1">
          <LogoMark size={30} />
        </span>
        <span className="text-[17px] font-bold tracking-[-0.03em] italic">
          <span className="text-brand-light">Lasistant</span>
          <span className="text-success-light">.Pro</span>
        </span>
      </div>
      <p className="text-xs font-semibold tracking-[0.14em] text-white uppercase">Contact</p>
      {phones
        .filter((phone) => phone.active && phone.value)
        .map((phone) => (
          <p key={phone.id} className="flex items-center gap-2">
            <IconPhone className="size-4" aria-hidden />
            {phone.value}
          </p>
        ))}
      {emails
        .filter((email) => email.active && email.value)
        .map((email) => (
          <p key={email.id} className="flex items-center gap-2 break-all">
            <IconEmail className="size-4 shrink-0" aria-hidden />
            {email.value}
          </p>
        ))}
      <p className="flex items-center gap-2">
        <IconAddress className="size-4 shrink-0" aria-hidden />
        {[street, [postalCode, city].filter(Boolean).join(' '), 'Tunisie'].filter(Boolean).join(', ')}
      </p>
    </div>
  );
}
