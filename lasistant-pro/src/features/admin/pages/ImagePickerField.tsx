import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { mediaQuery } from '@/api';
import { Button, Dialog, ResponsiveImage } from '@/components/ui';
import { IconCheck } from '@/components/ui/icons';
import { IconImages } from '@/components/ui/icons-admin';
import { cn } from '@/lib/cn';
import { imageKeys, resolveImage } from '@/lib/images';
import type { ImageRef } from '@/types';

interface ImagePickerFieldProps {
  label: string;
  value: ImageRef;
  onChange: (value: ImageRef) => void;
}

interface Choice {
  ref: ImageRef;
  alt: string;
}

/**
 * Choix d'une photo : photos du site (registre) et images téléversées dans la médiathèque.
 * Le texte alternatif de la photo choisie est repris automatiquement sur le site.
 */
export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const { data: media = [] } = useQuery({ ...mediaQuery(), enabled: open });
  const current = resolveImage(value);

  const siteChoices: Choice[] = imageKeys.map((key) => ({ ref: key, alt: resolveImage(key).alt }));
  const uploadedChoices: Choice[] = media
    .filter((item) => !item.isPrivate && /^https?:\/\//.test(item.image))
    .map((item) => ({ ref: item.image, alt: item.altText || item.title }));

  const select = (ref: ImageRef) => {
    onChange(ref);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13.5px] font-semibold">{label}</span>
      <div className="flex items-center gap-3.5 rounded-xl border border-line bg-white p-2.5">
        <ResponsiveImage
          image={value}
          alt=""
          sizes="96px"
          className="h-16 w-24 shrink-0 rounded-lg object-cover"
        />
        <p className="min-w-0 flex-1 text-[13px] text-muted">
          {current.alt || 'Image sans texte alternatif'}
        </p>
        <Button
          variant="outline"
          size="sm"
          shape="rounded"
          icon={<IconImages />}
          onClick={() => setOpen(true)}
        >
          Changer
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Choisir une photo"
        description="Photos du site et images ajoutées à la médiathèque. Les photos de personnes doivent avoir l’accord des personnes concernées."
      >
        <div className="flex flex-col gap-6">
          <ChoiceGrid title="Photos du site" choices={siteChoices} value={value} onSelect={select} />
          {uploadedChoices.length > 0 ? (
            <ChoiceGrid title="Médiathèque" choices={uploadedChoices} value={value} onSelect={select} />
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}

function ChoiceGrid({
  title,
  choices,
  value,
  onSelect,
}: {
  title: string;
  choices: Choice[];
  value: ImageRef;
  onSelect: (ref: ImageRef) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {choices.map((choice) => {
          const selected = choice.ref === value;
          return (
            <li key={choice.ref}>
              <button
                type="button"
                onClick={() => onSelect(choice.ref)}
                aria-pressed={selected}
                aria-label={choice.alt || 'Image sans description'}
                className={cn(
                  'relative block w-full overflow-hidden rounded-xl border-2 transition-colors',
                  selected ? 'border-brand' : 'border-transparent hover:border-line-strong',
                )}
              >
                <ResponsiveImage
                  image={choice.ref}
                  alt=""
                  sizes="180px"
                  className="aspect-[4/3] w-full object-cover"
                />
                {selected ? (
                  <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-brand text-white">
                    <IconCheck className="size-4" aria-hidden />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
