import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { mediaQuery } from '@/api';
import { Button, Dialog, ResponsiveImage } from '@/components/ui';
import { IconCheck } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { MediaItem } from '@/types';

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  /** Image actuellement utilisée */
  currentImage?: string;
}

/**
 * Choix d'une image de la médiathèque (couverture d'article, visuel de service).
 * Les documents privés n'y figurent jamais : ils ne doivent pas être publiés.
 */
export function MediaPickerDialog({ open, onClose, onSelect, currentImage }: MediaPickerDialogProps) {
  const { data: media = [] } = useQuery({ ...mediaQuery(), enabled: open });
  const images = media.filter((item) => item.kind === 'image' && !item.isPrivate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    images.find((item) => item.id === selectedId) ?? images.find((item) => item.image === currentImage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      scrollable
      title="Choisir une image"
      description="Images de la médiathèque. Pensez à vérifier le texte alternatif de l’image choisie."
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={onClose}>
            Annuler
          </Button>
          <Button
            shape="rounded"
            icon={<IconCheck />}
            disabled={!selected}
            onClick={() => {
              if (selected) onSelect(selected);
              onClose();
            }}
          >
            Utiliser cette image
          </Button>
        </>
      }
    >
      <div
        role="radiogroup"
        aria-label="Images disponibles"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {images.map((item) => {
          const checked = selected?.id === item.id;
          return (
            <label
              key={item.id}
              className={cn(
                'group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border-[1.5px] p-1.5 transition-colors',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
                checked ? 'border-brand bg-brand-wash' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="image-mediatheque"
                className="sr-only"
                checked={checked}
                onChange={() => setSelectedId(item.id)}
              />
              <ResponsiveImage
                image={item.image}
                alt=""
                sizes="200px"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <span className="truncate px-1 text-[12.5px] font-medium">{item.title}</span>
              {checked ? (
                <span
                  className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-brand text-white"
                  aria-hidden
                >
                  <IconCheck className="size-4" />
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </Dialog>
  );
}
