import { Button, Callout, Dialog } from '@/components/ui';
import { IconDelete } from '@/components/ui/icons';
import { IconArchive } from '@/components/ui/icons-admin';
import type { Article } from '@/types';

interface DeleteArticleDialogProps {
  article: Article | null;
  onClose: () => void;
  onArchive: (article: Article) => void;
  onDelete: (article: Article) => void;
  busy: boolean;
}

/** Confirmation de suppression d'un article, avec l'archivage proposé comme alternative. */
export function DeleteArticleDialog({
  article,
  onClose,
  onArchive,
  onDelete,
  busy,
}: DeleteArticleDialogProps) {
  return (
    <Dialog
      open={article !== null}
      onClose={onClose}
      role="alertdialog"
      size="sm"
      media={
        <span
          className="flex size-[52px] items-center justify-center rounded-full bg-danger-soft text-danger"
          aria-hidden
        >
          <IconDelete className="size-6" />
        </span>
      }
      title="Supprimer cet article ?"
      description={
        article
          ? `« ${article.title} » sera définitivement supprimé, ainsi que son historique de modifications. Cette action est irréversible.`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={onClose}>
            Annuler
          </Button>
          {article && article.status !== 'archive' ? (
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconArchive />}
              disabled={busy}
              onClick={() => onArchive(article)}
            >
              Archiver
            </Button>
          ) : null}
          <Button
            variant="danger"
            shape="rounded"
            icon={<IconDelete />}
            loading={busy}
            onClick={() => article && onDelete(article)}
          >
            Supprimer définitivement
          </Button>
        </>
      }
    >
      <Callout tone="privacy" size="sm" icon={<IconArchive />}>
        Astuce : archivez-le pour le retirer du site sans le perdre.
      </Callout>
    </Dialog>
  );
}
