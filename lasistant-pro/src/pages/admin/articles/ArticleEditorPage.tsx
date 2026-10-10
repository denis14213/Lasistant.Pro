import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useParams, type LoaderFunctionArgs } from 'react-router';
import { articleByIdQuery, categoriesQuery, getErrorMessage, queryKeys, teamQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { queryClient } from '@/app/query-client';
import { notFound, orNotFound } from '@/app/route-errors';
import { AdminPage, Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { CharCount, SerpPreview } from '@/components/admin/SeoPreview';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Seo } from '@/components/seo/Seo';
import { Badge, Button, ButtonAnchor, ResponsiveImage } from '@/components/ui';
import { Checkbox, Field, FormErrorSummary, Input, Select, Textarea } from '@/components/ui/form';
import { IconCheck, IconChevronRight, IconDelete, IconSend } from '@/components/ui/icons';
import { IconImage, IconImages, IconPreview } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { ARTICLE_STATUS_LABELS } from '@/content/labels';
import { toDraft, wordCount } from '@/features/admin/articles/article-draft';
import { DeleteArticleDialog } from '@/features/admin/articles/DeleteArticleDialog';
import { MarkdownEditor } from '@/features/admin/articles/MarkdownEditor';
import { useArticleActions } from '@/features/admin/articles/useArticleActions';
import { checkUpload, uploadImage } from '@/features/admin/media/media-upload';
import { MediaPickerDialog } from '@/features/admin/media/MediaPickerDialog';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isoDateOf } from '@/lib/dates';
import { formatPublicationDate } from '@/lib/format';
import { slugify } from '@/lib/text';
import { articleEditorSchema, type ArticleEditorValues } from '@/lib/validation/admin-forms';
import type { Article, ArticleStatus } from '@/types';

const NEW_ID = 'nouveau';
const TEAM_AUTHOR = 'L’équipe LASISTANT.PRO';
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) notFound();
  await Promise.all([
    id === NEW_ID ? null : orNotFound(queryClient.ensureQueryData(articleByIdQuery(id))),
    prefetch(categoriesQuery(true), teamQuery()),
  ]);
  return null;
}

const EMPTY_VALUES: ArticleEditorValues = {
  title: '',
  slug: '',
  body: '::lede Une phrase d’introduction qui donne envie de lire la suite.\n\n## Premier intertitre\n\nVotre texte.',
  excerpt: '',
  categoryId: '',
  status: 'brouillon',
  coverImage: 'teamMeeting',
  coverAlt: '',
  seoTitle: '',
  seoDescription: '',
  useCoverForSharing: true,
};

function toValues(article: Article): ArticleEditorValues {
  return {
    title: article.title,
    slug: article.slug,
    body: article.body,
    excerpt: article.excerpt,
    categoryId: article.categoryId,
    status: article.status,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt,
    seoTitle: article.seo.title,
    seoDescription: article.seo.description,
    useCoverForSharing: article.useCoverForSharing,
  };
}

const FIELD_LABELS = {
  title: 'Titre',
  slug: 'Adresse (slug)',
  body: 'Contenu',
  excerpt: 'Résumé',
  categoryId: 'Catégorie',
  coverAlt: 'Texte alternatif',
  seoTitle: 'Titre SEO',
  seoDescription: 'Meta description',
} as const;

/** Rédaction et publication d'un article (cahier des charges § 8.6). */
export function Component() {
  const { id = NEW_ID } = useParams();
  const isNew = id === NEW_ID;
  const navigate = useNavigate();
  const toast = useToast();
  const session = useSession();
  const formId = useId();
  const { data: article } = useQuery({ ...articleByIdQuery(id), enabled: !isNew });
  const { data: categories } = useSuspenseQuery(categoriesQuery(true));
  const { data: team } = useSuspenseQuery(teamQuery());
  const { save, remove } = useArticleActions();
  // « mutate » est stable : la sauvegarde automatique ne se relance pas à chaque rendu.
  const { mutate: saveArticle } = save;
  const [author, setAuthor] = useState(article?.author ?? TEAM_AUTHOR);
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [editingSlug, setEditingSlug] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  // Navigation différée après création ou suppression : l'état « enregistré » est d'abord affiché.
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [initialValues] = useState<ArticleEditorValues>(() =>
    article ? toValues(article) : { ...EMPTY_VALUES, categoryId: categories[0]?.id ?? '' },
  );
  // Dernière version enregistrée : la sauvegarde automatique ne part que si le contenu a changé.
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialValues));

  const form = useForm<ArticleEditorValues>({
    resolver: zodResolver(articleEditorSchema),
    defaultValues: initialValues,
  });
  const { register, control, handleSubmit, setValue, getValues, reset, formState } = form;
  const { errors, isDirty, submitCount } = formState;
  const values = useWatch({ control });
  const status = values.status ?? 'brouillon';
  const words = wordCount(values.body ?? '');

  /** Enregistrement ; « silent » : sauvegarde automatique d'un brouillon (sans notification). */
  const persist = useCallback(
    (data: ArticleEditorValues, nextStatus: ArticleStatus, silent = false) => {
      saveArticle(
        {
          draft: {
            ...(article ? toDraft(article) : {}),
            id: article?.id,
            slug: data.slug,
            title: data.title,
            excerpt: data.excerpt,
            body: data.body,
            coverImage: data.coverImage,
            coverAlt: data.coverAlt,
            categoryId: data.categoryId,
            status: nextStatus,
            seo: { title: data.seoTitle || data.title, description: data.seoDescription || data.excerpt },
            useCoverForSharing: data.useCoverForSharing,
          },
          author,
        },
        {
          onSuccess: (saved) => {
            const savedValues = { ...data, status: nextStatus };
            // Les valeurs saisies deviennent la nouvelle référence (sans toucher aux champs en cours de frappe).
            reset(savedValues, { keepValues: true });
            setValue('status', nextStatus);
            setSavedSnapshot(JSON.stringify(savedValues));
            setLastSavedAt(saved.updatedAt);
            if (!silent) {
              toast.success(
                nextStatus === 'publie'
                  ? 'Article publié : il est visible dans l’Espace infos.'
                  : nextStatus === 'archive'
                    ? 'Article archivé.'
                    : 'Brouillon enregistré.',
              );
            }
            if (isNew) setRedirectTo(ROUTES.admin.articleEdit(saved.id));
          },
        },
      );
    },
    [article, author, isNew, reset, saveArticle, setValue, toast],
  );

  // Sauvegarde automatique des brouillons, 3 secondes après la dernière modification.
  const snapshot = useDebouncedValue(JSON.stringify(values), 3000);
  const saving = save.isPending;
  useEffect(() => {
    if (saving || snapshot === savedSnapshot) return;
    const current = getValues();
    if (current.status !== 'brouillon' || current.title.trim().length < 8 || !SLUG_PATTERN.test(current.slug))
      return;
    persist(current, 'brouillon', true);
  }, [snapshot, savedSnapshot, saving, persist, getValues]);

  useEffect(() => {
    if (redirectTo) navigate(redirectTo, { replace: true });
  }, [redirectTo, navigate]);

  const publish = handleSubmit((data) => persist(data, 'publie'));
  const saveAs = (nextStatus: ArticleStatus) => handleSubmit((data) => persist(data, nextStatus))();

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    const problem = checkUpload(file, 'image');
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      const media = await uploadImage(file, session.name);
      await queryClient.invalidateQueries({ queryKey: queryKeys.media });
      setValue('coverImage', media.image, { shouldDirty: true });
      toast.success('Image optimisée et ajoutée à la médiathèque. Pensez au texte alternatif.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const authors = [TEAM_AUTHOR, ...team.filter((user) => user.active).map((user) => user.name)];
  const publishedLabel = article?.publishedAt
    ? formatPublicationDate(article.publishedAt)
    : status === 'publie'
      ? 'À la publication'
      : 'Dès la publication';

  return (
    <AdminPage>
      <Seo
        title={isNew ? 'Nouvel article' : `Modifier : ${article?.title ?? ''}`}
        description="Éditeur d’article."
        noIndex
      />
      <UnsavedChangesGuard when={isDirty && !save.isPending && redirectTo === null} />
      <div>
        <nav aria-label="Fil d’Ariane" className="mb-2.5 flex items-center gap-2 text-[13.5px] text-muted">
          <Link to={ROUTES.admin.articles} className="hover:text-ink">
            Articles
          </Link>
          <IconChevronRight className="size-4" aria-hidden />
          <span aria-current="page">{isNew ? 'Nouvel article' : 'Modifier'}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.028em] md:text-[28px]">
              {isNew ? 'Nouvel article' : 'Modifier l’article'}
            </h1>
            <Badge tone={status === 'publie' ? 'success' : 'neutral'}>{ARTICLE_STATUS_LABELS[status]}</Badge>
            <span className="flex items-center gap-1.5 text-[13px] text-muted" aria-live="polite">
              {save.isPending ? (
                'Enregistrement…'
              ) : lastSavedAt ? (
                <>
                  <IconCheck className="size-4" aria-hidden />
                  Enregistré à{' '}
                  {new Date(lastSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </>
              ) : isDirty ? (
                'Modifications non enregistrées'
              ) : null}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {article && article.status === 'publie' ? (
              <ButtonAnchor
                href={ROUTES.article(article.slug)}
                target="_blank"
                rel="noopener"
                variant="outline"
                shape="rounded"
                icon={<IconPreview />}
              >
                Voir sur le site<span className="sr-only"> (nouvel onglet)</span>
              </ButtonAnchor>
            ) : null}
            {status !== 'publie' ? (
              <Button
                variant="outline"
                shape="rounded"
                loading={save.isPending}
                onClick={() => void saveAs('brouillon')}
              >
                Enregistrer le brouillon
              </Button>
            ) : null}
            <Button
              shape="rounded"
              icon={<IconSend />}
              loading={save.isPending}
              onClick={() => void publish()}
            >
              {status === 'publie' ? 'Mettre à jour' : 'Publier'}
            </Button>
          </div>
        </div>
      </div>

      <FormErrorSummary errors={errors} labels={FIELD_LABELS} submitCount={submitCount} />

      <form
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          <Panel as="div">
            <PanelBody className="flex flex-col gap-4">
              <div>
                <label htmlFor="title" className="sr-only">
                  Titre de l’article
                </label>
                <input
                  id="title"
                  {...register('title', {
                    onChange: (event: { target: { value: string } }) => {
                      if (!slugEdited) setValue('slug', slugify(event.target.value), { shouldDirty: true });
                    },
                  })}
                  placeholder="Titre de l’article"
                  aria-invalid={errors.title ? true : undefined}
                  className="min-h-16 w-full rounded-xl border border-transparent px-1 text-[26px] font-semibold tracking-[-0.02em] outline-none hover:border-line focus:border-brand focus:shadow-focus"
                />
                {errors.title?.message ? (
                  <p className="px-1 text-[13.5px] text-danger">{errors.title.message}</p>
                ) : null}
              </div>
              <div className="px-1 text-[13px] text-muted">
                {editingSlug ? (
                  <Field
                    label="Adresse de l’article"
                    id="slug"
                    error={errors.slug?.message}
                    density="compact"
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                      <span className="font-mono text-[12.5px]">lasistant.pro/espace-infos/</span>
                      <Input
                        density="compact"
                        {...register('slug', { onChange: () => setSlugEdited(true) })}
                        onBlur={() => setEditingSlug(false)}
                      />
                    </div>
                  </Field>
                ) : (
                  <p>
                    lasistant.pro/espace-infos/
                    <strong className="text-ink">{values.slug || 'adresse-de-l-article'}</strong> ·{' '}
                    <button
                      type="button"
                      className="font-semibold text-brand hover:underline"
                      onClick={() => setEditingSlug(true)}
                    >
                      Modifier le slug
                    </button>
                    {errors.slug?.message ? (
                      <span className="ml-2 text-danger">{errors.slug.message}</span>
                    ) : null}
                  </p>
                )}
              </div>
              <Controller
                control={control}
                name="body"
                render={({ field }) => (
                  <MarkdownEditor
                    id="body"
                    label="Contenu de l’article"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.body)}
                  />
                )}
              />
              {errors.body?.message ? (
                <p className="text-[13.5px] text-danger">{errors.body.message}</p>
              ) : null}
              <p className="text-right text-[13px] text-muted">
                {words} mots · environ {Math.max(1, Math.round(words / 200))} min de lecture
              </p>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-resume`}>
            <PanelHeader
              titleId={`${formId}-resume`}
              title="Résumé"
              action={<CharCount value={values.excerpt ?? ''} max={160} min={30} />}
            />
            <PanelBody className="flex flex-col gap-2">
              <label htmlFor="excerpt" className="sr-only">
                Résumé de l’article
              </label>
              <Textarea
                id="excerpt"
                density="compact"
                rows={3}
                aria-invalid={errors.excerpt ? true : undefined}
                {...register('excerpt')}
              />
              {errors.excerpt?.message ? (
                <p className="text-[13.5px] text-danger">{errors.excerpt.message}</p>
              ) : null}
              <p className="text-[13px] text-muted">
                Affiché sur les cartes de l’Espace infos et la page d’accueil.
              </p>
            </PanelBody>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel labelledBy={`${formId}-publication`}>
            <PanelHeader titleId={`${formId}-publication`} title="Publication" />
            <PanelBody className="flex flex-col gap-3.5">
              <Field label="Statut" id="status" density="compact">
                <Select density="compact" {...register('status')}>
                  {(Object.keys(ARTICLE_STATUS_LABELS) as ArticleStatus[]).map((value) => (
                    <option key={value} value={value}>
                      {ARTICLE_STATUS_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Date de publication" id="publication" density="compact">
                <Input
                  density="compact"
                  readOnly
                  value={
                    article?.publishedAt
                      ? `${publishedLabel} · ${isoDateOf(article.publishedAt)}`
                      : publishedLabel
                  }
                />
              </Field>
              <Field label="Catégorie" id="categoryId" error={errors.categoryId?.message} density="compact">
                <Select density="compact" {...register('categoryId')}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.active ? '' : ' (masquée)'}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Auteur" id="author" density="compact">
                <Select density="compact" value={author} onChange={(event) => setAuthor(event.target.value)}>
                  {authors.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </Field>
              {article ? (
                <Button
                  variant="danger-outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconDelete />}
                  className="w-fit"
                  onClick={() => setConfirmDelete(true)}
                >
                  Supprimer l’article
                </Button>
              ) : null}
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-couverture`}>
            <PanelHeader titleId={`${formId}-couverture`} title="Image de couverture" />
            <PanelBody className="flex flex-col gap-3">
              <ResponsiveImage
                image={values.coverImage ?? 'teamMeeting'}
                alt=""
                sizes="340px"
                className="h-[180px] w-full rounded-xl object-cover"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  icon={<IconImages />}
                  onClick={() => setPickerOpen(true)}
                >
                  Médiathèque
                </Button>
                <label className="inline-flex min-h-[34px] cursor-pointer items-center gap-2 rounded-[9px] border border-line-strong px-3 text-[13.5px] font-semibold transition-colors hover:border-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid">
                  <IconImage className="size-4" aria-hidden />
                  Téléverser
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => void onUpload(event.target.files?.[0])}
                  />
                </label>
              </div>
              <Field
                label="Texte alternatif"
                id="coverAlt"
                error={errors.coverAlt?.message}
                density="compact"
              >
                <Input density="compact" {...register('coverAlt')} />
              </Field>
            </PanelBody>
          </Panel>

          <Panel labelledBy={`${formId}-seo`}>
            <PanelHeader titleId={`${formId}-seo`} title="Référencement (SEO)" />
            <PanelBody className="flex flex-col gap-3.5">
              <Field
                label="Titre SEO"
                id="seoTitle"
                error={errors.seoTitle?.message}
                labelAside={<CharCount value={values.seoTitle ?? ''} max={60} />}
                density="compact"
              >
                <Input density="compact" placeholder={values.title} {...register('seoTitle')} />
              </Field>
              <Field
                label="Meta description"
                id="seoDescription"
                error={errors.seoDescription?.message}
                labelAside={<CharCount value={values.seoDescription ?? ''} max={160} min={50} />}
                density="compact"
              >
                <Textarea
                  density="compact"
                  rows={3}
                  placeholder={values.excerpt}
                  {...register('seoDescription')}
                />
              </Field>
              <SerpPreview
                url={`lasistant.pro › espace-infos › ${values.slug ?? ''}`}
                title={values.seoTitle || values.title || ''}
                description={values.seoDescription || values.excerpt || ''}
              />
              <Checkbox
                size="sm"
                label="Utiliser l’image de couverture pour le partage (Open Graph)"
                {...register('useCoverForSharing')}
              />
            </PanelBody>
          </Panel>
        </div>
      </form>

      <MediaPickerDialog
        open={pickerOpen}
        currentImage={values.coverImage}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setValue('coverImage', media.image, { shouldDirty: true });
          if (media.altText) setValue('coverAlt', media.altText, { shouldDirty: true });
        }}
      />
      {article ? (
        <DeleteArticleDialog
          article={confirmDelete ? article : null}
          busy={remove.isPending || save.isPending}
          onClose={() => setConfirmDelete(false)}
          onArchive={() => {
            setConfirmDelete(false);
            void saveAs('archive');
          }}
          onDelete={() =>
            remove.mutate(article.id, {
              onSuccess: () => {
                reset(getValues());
                setRedirectTo(ROUTES.admin.articles);
              },
            })
          }
        />
      ) : null}
    </AdminPage>
  );
}
