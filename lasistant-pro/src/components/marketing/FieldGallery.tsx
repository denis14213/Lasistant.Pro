import { ResponsiveImage } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { GalleryItem } from '@/types';

interface FieldGalleryProps {
  items: readonly GalleryItem[];
  /**
   * - « mosaic » : grande photo, photo verticale et bandeau final (page d'accueil, 5 photos) ;
   * - « row » : photos de même format côte à côte (pages de service, 3 photos).
   */
  layout?: 'mosaic' | 'row';
  className?: string;
}

/** Emplacements de la mosaïque (grille de 6 colonnes), dans l'ordre des photos. */
const MOSAIC_CELLS = [
  'md:col-span-4',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-6',
];
/** Bandeau final, sur toute la largeur : plus haut que les autres rangées, cadrage remonté. */
const BAND_INDEX = MOSAIC_CELLS.length - 1;

/**
 * Photos commentées de moments réels d'accompagnement (« Sur le terrain ») : chaque photo
 * porte un titre et une phrase, lisibles sur un dégradé sombre en bas du visuel.
 */
export function FieldGallery({ items, layout = 'row', className }: FieldGalleryProps) {
  const mosaic = layout === 'mosaic';
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-5 md:gap-6',
        mosaic ? 'md:auto-rows-[290px] md:grid-cols-6 md:grid-rows-[290px_290px_400px]' : 'md:grid-cols-3',
        className,
      )}
    >
      {items.map((item, index) => {
        const band = mosaic && index % MOSAIC_CELLS.length === BAND_INDEX;
        return (
          <li
            key={`${item.title}-${index}`}
            className={cn(
              'group relative h-[300px] overflow-hidden rounded-[24px] bg-mist md:h-auto',
              mosaic ? MOSAIC_CELLS[index % MOSAIC_CELLS.length] : 'md:h-[440px]',
            )}
          >
            <ResponsiveImage
              image={item.image}
              sizes={band ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
              className={cn(
                'size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]',
                // Le sujet d'une photo large se situe rarement tout en bas : il reste au-dessus de la légende.
                band && 'md:object-[50%_38%]',
              )}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-night/88 via-night/45 to-transparent px-5.5 pt-18 pb-5.5 text-white md:px-6.5 md:pb-6.5">
              <h3 className="text-[19px] leading-[1.2] font-semibold tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-1.5 max-w-[46ch] text-[14.5px] leading-[1.45] text-white/86">{item.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
