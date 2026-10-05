import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { getErrorMessage, queryKeys, servicesRepository } from '@/api';
import { PanelBody, PanelFooter, PanelHeader } from '@/components/admin/AdminPage';
import { CharCount, SerpPreview } from '@/components/admin/SeoPreview';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Button, Icon, ResponsiveImage } from '@/components/ui';
import { Field, Input, Switch, Textarea } from '@/components/ui/form';
import { IconCheck, IconSearch } from '@/components/ui/icons';
import { IconArchive, IconImage } from '@/components/ui/icons-admin';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { serviceEditorSchema, type ServiceEditorValues } from '@/lib/validation/admin-forms';
import type { IconName, Service } from '@/types';
import { MediaPickerDialog } from '../media/MediaPickerDialog';

/** Icônes proposées pour un service : métiers et publics de LASISTANT.PRO, nommés par leur fonction. */
const SERVICE_ICONS: Array<{ name: IconName; label: string }> = [
  { name: 'medical', label: 'Assistance médicale' },
  { name: 'housing', label: 'Logement, domicile' },
  { name: 'care', label: 'Accompagnement' },
  { name: 'conversation', label: 'Échange avec un conseiller' },
  { name: 'arrival', label: 'Arrivée en Tunisie' },
  { name: 'stay', label: 'Organisation du séjour' },
  { name: 'orientation', label: 'Orientation' },
  { name: 'fileReview', label: 'Étude du dossier' },
  { name: 'family', label: 'Familles et proches' },
  { name: 'student', label: 'Étudiants' },
  { name: 'key', label: 'Remise des clés' },
  { name: 'partner', label: 'Partenariat' },
];

function toValues(service: Service): ServiceEditorValues {
  return {
    title: service.title,
    subtitle: service.subtitle,
    summary: service.summary,
    icon: service.icon,
    image: service.image,
    imageAlt: service.imageAlt,
    ctaLabel: service.ctaLabel,
    ctaHref: service.ctaHref,
    slug: service.slug,
    seoTitle: service.seo.title,
    seoDescription: service.seo.description,
    active: service.active,
  };
}

/** Modification d'un service : contenu, visuel, action principale et référencement. */
export function ServiceEditor({ service }: { service: Service }) {
  const session = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const form = useForm<ServiceEditorValues>({
    resolver: zodResolver(serviceEditorSchema),
    defaultValues: toValues(service),
  });
  const { register, control, handleSubmit, reset, setValue, formState } = form;
  const { errors, isDirty } = formState;
  const [image, slug, seoTitle, seoDescription] = useWatch({
    control,
    name: ['image', 'slug', 'seoTitle', 'seoDescription'],
  });
  // Les pages de service ont une adresse fixe dans le site ; seuls les autres services peuvent la changer.
  const slugLocked = service.kind === 'page';

  const save = useMutation({
    mutationFn: (values: ServiceEditorValues) =>
      servicesRepository.update(
        service.id,
        {
          title: values.title,
          subtitle: values.subtitle,
          summary: values.summary,
          icon: values.icon as IconName,
          image: values.image,
          imageAlt: values.imageAlt,
          ctaLabel: values.ctaLabel,
          ctaHref: values.ctaHref,
          slug: slugLocked ? service.slug : values.slug,
          active: values.active,
          seo: { title: values.seoTitle, description: values.seoDescription },
        },
        session.name,
      ),
    onSuccess: async (updated) => {
      reset(toValues(updated));
      toast.success('Service enregistré : le site est à jour.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const archive = () => {
    setValue('active', false, { shouldDirty: true });
    void handleSubmit((values) => save.mutate(values))();
  };

  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
      <UnsavedChangesGuard when={isDirty} />
      <PanelHeader
        titleId="edition-service"
        title={`Modifier : ${service.title}`}
        description={`Dernière modification le ${formatDateTime(service.updatedAt)} par ${service.updatedBy}`}
        action={
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <span className="flex items-center gap-2.5 text-[13px] font-semibold">
                {field.value ? 'Actif' : 'Masqué'}
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Service actif sur le site"
                />
              </span>
            )}
          />
        }
      />
      <PanelBody className="flex flex-col gap-4.5">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Field label="Titre" id="title" error={errors.title?.message} density="compact">
            <Input density="compact" {...register('title')} />
          </Field>
          <Field label="Sous-titre" id="subtitle" error={errors.subtitle?.message} density="compact">
            <Input density="compact" {...register('subtitle')} />
          </Field>
          <Field
            label="Description"
            id="summary"
            error={errors.summary?.message}
            density="compact"
            className="md:col-span-2"
          >
            <Textarea density="compact" rows={3} {...register('summary')} />
          </Field>
        </div>

        <div className="grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
          <Field
            label="Image"
            kind="group"
            error={errors.image?.message ?? errors.imageAlt?.message}
            density="compact"
          >
            <div className="flex items-start gap-3">
              <ResponsiveImage
                image={image}
                alt=""
                sizes="112px"
                className="h-[76px] w-28 shrink-0 rounded-[10px] object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconImage />}
                  className="w-fit"
                  onClick={() => setPickerOpen(true)}
                >
                  Remplacer
                </Button>
                <Input
                  density="compact"
                  aria-label="Texte alternatif de l’image"
                  placeholder="Texte alternatif"
                  {...register('imageAlt')}
                />
              </div>
            </div>
          </Field>
          <Field label="Icône" kind="group" density="compact">
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Choisir une icône" className="grid grid-cols-6 gap-2">
                  {SERVICE_ICONS.map((icon) => (
                    <label
                      key={icon.name}
                      title={icon.label}
                      className={cn(
                        'flex h-[46px] cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] text-ink-soft transition-colors [&_svg]:size-6',
                        'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
                        field.value === icon.name
                          ? 'border-brand bg-brand-soft text-brand-dark'
                          : 'border-line-strong bg-white hover:border-line-hover',
                      )}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={field.name}
                        aria-label={icon.label}
                        checked={field.value === icon.name}
                        onChange={() => field.onChange(icon.name)}
                      />
                      <Icon name={icon.name} weight="duotone" />
                    </label>
                  ))}
                </div>
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Field label="Libellé du bouton" id="ctaLabel" error={errors.ctaLabel?.message} density="compact">
            <Input density="compact" {...register('ctaLabel')} />
          </Field>
          <Field label="Lien du bouton" id="ctaHref" error={errors.ctaHref?.message} density="compact">
            <Input density="compact" {...register('ctaHref')} />
          </Field>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-line pt-4.5">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            <IconSearch className="size-4" aria-hidden />
            Référencement (SEO)
          </p>
          <Field
            label="Slug"
            id="slug"
            error={errors.slug?.message}
            hint={
              slugLocked
                ? 'L’adresse des pages de service est fixe : elle garantit que les liens existants restent valides.'
                : undefined
            }
            density="compact"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <span className="font-mono text-[12.5px] text-muted">lasistant.pro/services/</span>
              <Input density="compact" readOnly={slugLocked} {...register('slug')} />
            </div>
          </Field>
          <Field
            label="Titre SEO"
            id="seoTitle"
            error={errors.seoTitle?.message}
            labelAside={<CharCount value={seoTitle} max={60} />}
            density="compact"
          >
            <Input density="compact" {...register('seoTitle')} />
          </Field>
          <Field
            label="Meta description"
            id="seoDescription"
            error={errors.seoDescription?.message}
            labelAside={<CharCount value={seoDescription} max={160} min={50} />}
            density="compact"
          >
            <Textarea density="compact" rows={2} {...register('seoDescription')} />
          </Field>
          <SerpPreview
            url={`lasistant.pro › services › ${slug}`}
            title={`${seoTitle} | LASISTANT.PRO`}
            description={seoDescription}
          />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button
          variant="danger-outline"
          size="sm"
          shape="rounded"
          icon={<IconArchive />}
          disabled={!service.active}
          onClick={archive}
        >
          Masquer du site
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            shape="rounded"
            disabled={!isDirty}
            onClick={() => reset(toValues(service))}
          >
            Annuler
          </Button>
          <Button type="submit" shape="rounded" icon={<IconCheck />} loading={save.isPending}>
            Enregistrer
          </Button>
        </div>
      </PanelFooter>
      <MediaPickerDialog
        open={pickerOpen}
        currentImage={image}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setValue('image', media.image, { shouldDirty: true });
          if (media.altText) setValue('imageAlt', media.altText, { shouldDirty: true });
        }}
      />
    </form>
  );
}
