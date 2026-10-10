import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useId, useRef, useState, type DragEvent } from 'react';
import { getErrorMessage, mediaQuery, mediaRepository, queryKeys } from '@/api';
import { prefetch } from '@/app/prefetch';
import {
  AdminPage,
  AdminPageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from '@/components/admin/AdminPage';
import { FilterTabs } from '@/components/admin/FilterTabs';
import { KeyValueList } from '@/components/admin/KeyValueList';
import { Seo } from '@/components/seo/Seo';
import { Button, Callout, Dialog, EmptyState, IconButton, ResponsiveImage } from '@/components/ui';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import {
  IconCheck,
  IconClose,
  IconDelete,
  IconDocument,
  IconLock,
  IconSearch,
  IconUpload,
  IconWarning,
} from '@/components/ui/icons';
import { IconCopy, IconDownload, IconImage } from '@/components/ui/icons-admin';
import { checkUpload, uploadImage, uploadPrivateDocument } from '@/features/admin/media/media-upload';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/cn';
import { isoDateOf } from '@/lib/dates';
import { formatFileSize, formatShortDate } from '@/lib/format';
import { resolveImage } from '@/lib/images';
import { can } from '@/lib/permissions';
import { matchesQuery, pluralize } from '@/lib/text';
import type { MediaItem } from '@/types';

export const loader = () => prefetch(mediaQuery());

type Tab = 'images' | 'documents';
type Sort = 'recent' | 'nom' | 'poids';

/** Médiathèque : images du site et documents privés (cahier des charges § 8.7). */
export function Component() {
  const session = useSession();
  const toast = useToast();
  const copy = useCopyToClipboard();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropHintId = useId();
  const canSeePrivate = can(session.role, 'private-documents:view');
  const { data: media } = useSuspenseQuery(mediaQuery());
  const [tab, setTab] = useState<Tab>('images');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [selectedId, setSelectedId] = useState<string | null>(
    media.find((item) => !item.isPrivate)?.id ?? null,
  );
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const images = media.filter((item) => !item.isPrivate);
  const documents = media.filter((item) => item.isPrivate);
  const current = tab === 'images' ? images : documents;
  const missingAlt = images.filter((item) => !item.altText.trim()).length;
  const visible = current
    .filter((item) => matchesQuery(`${item.fileName} ${item.title}`, query))
    .sort((a, b) =>
      sort === 'nom'
        ? a.fileName.localeCompare(b.fileName, 'fr')
        : sort === 'poids'
          ? b.sizeBytes - a.sizeBytes
          : b.createdAt.localeCompare(a.createdAt),
    );
  const selected = media.find((item) => item.id === selectedId) ?? null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.media });

  const upload = async (files: FileList | File[]) => {
    const list = [...files];
    if (list.length === 0) return;
    setUploading(true);
    let added = 0;
    for (const file of list) {
      const problem = checkUpload(file, tab === 'images' ? 'image' : 'document');
      if (problem) {
        toast.error(problem);
        continue;
      }
      try {
        const item =
          tab === 'images'
            ? await uploadImage(file, session.name)
            : await uploadPrivateDocument(file, session.name);
        added += 1;
        setSelectedId(item.id);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
    setUploading(false);
    if (added > 0) {
      toast.success(
        `${pluralize(added, 'fichier ajouté', 'fichiers ajoutés')}${tab === 'images' ? ' et optimisé(s) en WebP' : ''}.`,
      );
      await refresh();
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files);
  };

  const remove = useMutation({
    mutationFn: (id: string) => mediaRepository.remove(id),
    onSuccess: async () => {
      toast.success('Fichier supprimé.');
      setConfirmDelete(false);
      setSelectedId(null);
      await refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const tabs = [
    { value: 'images' as const, label: 'Images', count: images.length },
    ...(canSeePrivate
      ? [{ value: 'documents' as const, label: 'Documents privés', count: documents.length }]
      : []),
  ];

  return (
    <AdminPage>
      <Seo title="Médiathèque" description="Images et documents." noIndex />
      <AdminPageHeader
        title="Médiathèque"
        description="Images du site et documents privés. Les images sont optimisées automatiquement (WebP, 1 600 px maximum)."
        actions={
          <Button
            shape="rounded"
            icon={<IconUpload />}
            loading={uploading}
            loadingLabel="Envoi…"
            onClick={() => inputRef.current?.click()}
          >
            Téléverser des fichiers
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={tab === 'images' ? 'image/jpeg,image/png,image/webp' : 'application/pdf,image/jpeg,image/png'}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          if (event.target.files) void upload(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel labelledBy="fichiers">
          <h2 id="fichiers" className="sr-only">
            Fichiers
          </h2>
          <FilterTabs
            label="Type de fichiers"
            tabs={tabs}
            value={tab}
            onChange={(value) => {
              setTab(value);
              setSelectedId(null);
            }}
          />
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5">
            <label className="flex h-[38px] w-full max-w-[300px] items-center gap-2.5 rounded-[10px] bg-cloud px-3.5 text-muted focus-within:bg-white focus-within:ring-1 focus-within:ring-brand">
              <IconSearch className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">Rechercher un fichier</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un fichier…"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder md:text-sm"
              />
            </label>
            <Select
              aria-label="Trier"
              density="compact"
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="min-h-[38px] w-auto text-sm"
            >
              <option value="recent">Plus récents</option>
              <option value="nom">Nom (A → Z)</option>
              <option value="poids">Poids</option>
            </Select>
            {tab === 'images' && missingAlt > 0 ? (
              <span className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold text-gold-dark">
                <IconWarning className="size-4" aria-hidden />
                {pluralize(missingAlt, 'image sans texte alternatif', 'images sans texte alternatif')}
              </span>
            ) : null}
          </div>
          <PanelBody className="flex flex-col gap-4">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              aria-describedby={dropHintId}
              className={cn(
                'flex flex-wrap items-center justify-center gap-4 rounded-box border-[1.5px] border-dashed border-line-strong bg-canvas p-4.5 transition-colors',
                dragging && 'border-brand bg-brand-wash',
              )}
            >
              <span
                className="flex size-[42px] items-center justify-center rounded-xl bg-brand-soft text-brand"
                aria-hidden
              >
                <IconUpload className="size-4.5" />
              </span>
              <p id={dropHintId} className="text-[15px]">
                <strong>Glissez-déposez vos fichiers ici</strong> ·{' '}
                {tab === 'images' ? 'JPG, PNG, WebP' : 'PDF, JPG, PNG (stockage privé)'} · 10 Mo max.{' '}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-semibold text-brand hover:underline"
                >
                  Parcourir
                </button>
              </p>
            </div>
            {tab === 'documents' ? (
              <Callout tone="privacy" size="sm" icon={<IconLock />}>
                Documents privés : jamais publiés sur le site, consultables uniquement par les rôles
                autorisés.
              </Callout>
            ) : null}
            {visible.length === 0 ? (
              <EmptyState
                icon={tab === 'images' ? <IconImage /> : <IconDocument />}
                title={query ? 'Aucun fichier ne correspond à la recherche' : 'Aucun fichier pour le moment'}
              />
            ) : (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5">
                {visible.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={item.id === selectedId}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        'flex w-full flex-col overflow-hidden rounded-xl border border-line bg-white text-left transition-shadow hover:shadow-raised',
                        item.id === selectedId && 'outline-2 outline-offset-2 outline-brand outline-solid',
                      )}
                    >
                      {item.isPrivate ? (
                        <span className="flex aspect-[4/3] w-full items-center justify-center bg-cloud text-muted">
                          <IconDocument className="size-9" aria-hidden />
                        </span>
                      ) : (
                        <ResponsiveImage
                          image={item.image}
                          alt=""
                          sizes="180px"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      )}
                      <span className="flex flex-col gap-0.5 px-3 py-2.5 text-[12.5px]">
                        <strong className="truncate text-[13px] font-semibold">{item.fileName}</strong>
                        {!item.isPrivate && !item.altText.trim() ? (
                          <span className="flex items-center gap-1 font-semibold text-gold-dark">
                            <IconWarning className="size-3.5" aria-hidden />
                            Sans texte alt.
                          </span>
                        ) : (
                          <span className="text-muted">
                            {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
                            {formatFileSize(item.sizeBytes)}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PanelBody>
        </Panel>

        <Panel labelledBy="details-fichier">
          {selected ? (
            <MediaDetails
              key={selected.id}
              item={selected}
              onClose={() => setSelectedId(null)}
              onDelete={() => setConfirmDelete(true)}
              onCopy={(value) =>
                void copy(value).then((ok) =>
                  ok ? toast.success('Adresse copiée.') : toast.error('Copie impossible.'),
                )
              }
            />
          ) : (
            <>
              <PanelHeader titleId="details-fichier" title="Détails du fichier" />
              <PanelBody>
                <p className="text-muted">
                  Sélectionnez un fichier pour afficher ses détails et modifier son texte alternatif.
                </p>
              </PanelBody>
            </>
          )}
        </Panel>
      </div>

      <Dialog
        open={confirmDelete && selected !== null}
        onClose={() => setConfirmDelete(false)}
        role="alertdialog"
        size="sm"
        title="Supprimer ce fichier ?"
        description={
          selected
            ? selected.usedOn.length > 0
              ? `« ${selected.fileName} » est utilisé sur : ${selected.usedOn.join(', ')}. Ces pages afficheront une image manquante.`
              : `« ${selected.fileName} » sera définitivement supprimé.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              shape="rounded"
              icon={<IconDelete />}
              loading={remove.isPending}
              onClick={() => selected && remove.mutate(selected.id)}
            >
              Supprimer définitivement
            </Button>
          </>
        }
      />
    </AdminPage>
  );
}

interface MediaDetailsProps {
  item: MediaItem;
  onClose: () => void;
  onDelete: () => void;
  onCopy: (value: string) => void;
}

/** Panneau de détails : informations, texte alternatif, titre et droits d'utilisation. */
function MediaDetails({ item, onClose, onDelete, onCopy }: MediaDetailsProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [altText, setAltText] = useState(item.altText);
  const [title, setTitle] = useState(item.title);
  const [rightsConfirmed, setRightsConfirmed] = useState(item.rightsConfirmed);
  const address = item.isPrivate ? 'Stockage privé (non public)' : resolveImage(item.image).src;
  const altMissing = !item.isPrivate && altText.trim().length < 5;

  // Document privé : lien temporaire demandé au moment du clic (onglet ouvert pendant le clic).
  const download = async () => {
    const tab = window.open('', '_blank');
    const url = await mediaRepository.downloadUrl(item).catch(() => null);
    if (!url) {
      tab?.close();
      toast.error('Ce document n’est pas disponible au téléchargement.');
      return;
    }
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const save = useMutation({
    mutationFn: () =>
      mediaRepository.update(item.id, { altText: altText.trim(), title: title.trim(), rightsConfirmed }),
    onSuccess: async () => {
      toast.success('Fichier enregistré.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.media });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <>
      <PanelHeader
        titleId="details-fichier"
        title="Détails du fichier"
        action={
          <IconButton label="Fermer le panneau" variant="ghost" size="sm" onClick={onClose}>
            <IconClose aria-hidden />
          </IconButton>
        }
      />
      <PanelBody className="flex flex-col gap-3.5">
        {item.isPrivate ? (
          <div className="flex flex-col gap-2.5">
            <span className="flex h-[210px] items-center justify-center rounded-xl bg-cloud text-muted">
              <IconDocument className="size-12" aria-hidden />
            </span>
            <Button
              variant="outline"
              size="sm"
              shape="rounded"
              icon={<IconDownload />}
              onClick={() => void download()}
            >
              Télécharger le document
            </Button>
          </div>
        ) : (
          <ResponsiveImage
            image={item.image}
            alt=""
            sizes="340px"
            className="h-[210px] w-full rounded-xl object-cover"
          />
        )}
        <KeyValueList
          className="sm:grid-cols-[110px_minmax(0,1fr)] [&_dd]:text-[13.5px] [&_dt]:text-[13.5px]"
          items={[
            { label: 'Fichier', value: item.fileName },
            ...(item.width && item.height
              ? [{ label: 'Dimensions', value: `${item.width} × ${item.height} px` }]
              : []),
            { label: 'Poids', value: `${formatFileSize(item.sizeBytes)}${item.isPrivate ? '' : ' · WebP'}` },
            { label: 'Ajouté par', value: item.uploadedBy },
            { label: 'Date', value: formatShortDate(isoDateOf(item.createdAt)) },
            { label: 'Utilisé sur', value: item.usedOn.length > 0 ? item.usedOn.join(', ') : 'Non utilisé' },
          ]}
        />
        {item.isPrivate ? null : (
          <Field
            label="Texte alternatif"
            id="media-alt"
            required
            error={
              altMissing && altText.length > 0
                ? 'Décrivez l’image en quelques mots (5 caractères minimum).'
                : undefined
            }
            hint="Décrivez l’image pour les personnes qui ne la voient pas."
            density="compact"
          >
            <Textarea
              density="compact"
              rows={2}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
            />
          </Field>
        )}
        <Field label="Titre" id="media-title" density="compact">
          <Input density="compact" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Adresse du fichier" id="media-url" density="compact">
          <div className="flex gap-2">
            <Input
              density="compact"
              readOnly
              value={address.startsWith('data:') ? 'Image optimisée (stockée sur cet appareil)' : address}
              className="font-mono text-[12.5px]"
            />
            {item.isPrivate || address.startsWith('data:') ? null : (
              <IconButton
                label="Copier l’adresse"
                size="sm"
                className="size-[42px] rounded-[10px]"
                onClick={() => onCopy(new URL(address, window.location.origin).href)}
              >
                <IconCopy aria-hidden />
              </IconButton>
            )}
          </div>
        </Field>
        <Checkbox
          size="sm"
          checked={rightsConfirmed}
          onChange={(event) => setRightsConfirmed(event.target.checked)}
          label="Droits d’utilisation confirmés (photo libre de droits ou autorisée)"
        />
        {rightsConfirmed ? null : (
          <p className="flex w-fit items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[12.5px] font-semibold text-gold-dark">
            <IconWarning className="size-3.5" aria-hidden />
            Droits d’utilisation à confirmer avant publication
          </p>
        )}
      </PanelBody>
      <PanelFooter>
        <Button variant="danger-outline" size="sm" shape="rounded" icon={<IconDelete />} onClick={onDelete}>
          Supprimer
        </Button>
        <Button
          size="sm"
          shape="rounded"
          icon={<IconCheck />}
          loading={save.isPending}
          disabled={altMissing}
          onClick={() => save.mutate()}
        >
          Enregistrer
        </Button>
      </PanelFooter>
    </>
  );
}
