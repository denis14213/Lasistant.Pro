import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';
import { IconClose } from './icons';

/**
 * Fenêtre modale fondée sur l'élément natif <dialog> :
 * piège du focus, fermeture par Échap et arrière-plan inerte sont gérés par le navigateur.
 * Sur mobile, la variante « sheet » s'affiche comme un panneau venant du bas de l'écran.
 */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Icône ou visuel affiché au-dessus du titre */
  media?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'center' | 'sheet';
  /** « alertdialog » pour les confirmations d'actions sensibles */
  role?: 'dialog' | 'alertdialog';
  /** Masque la croix de fermeture (le choix doit alors être fait dans le pied) */
  hideCloseButton?: boolean;
  /** En-tête et pied restent visibles pendant le défilement du contenu */
  scrollable?: boolean;
  className?: string;
  bodyClassName?: string;
}

const SIZES = {
  sm: 'md:w-[min(460px,calc(100%-2rem))]',
  md: 'md:w-[min(560px,calc(100%-2rem))]',
  lg: 'md:w-[min(700px,calc(100%-2rem))]',
  xl: 'md:w-[min(860px,calc(100%-2rem))]',
} as const;

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  media,
  size = 'md',
  variant = 'center',
  role = 'dialog',
  hideCloseButton = false,
  scrollable = false,
  className,
  bodyClassName,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Synchronise l'état React avec l'ouverture native de la fenêtre.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Touche Échap : on laisse React piloter la fermeture.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clic sur l'arrière-plan (en dehors du contenu) : fermeture.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-[22px] bg-paper p-0 text-ink shadow-float',
        variant === 'sheet' &&
          'max-md:mb-0 max-md:max-h-[92dvh] max-md:w-full max-md:max-w-none max-md:rounded-t-[24px] max-md:rounded-b-none',
        SIZES[size],
        className,
      )}
    >
      {open ? (
        <div className={cn('flex max-h-[inherit] flex-col', scrollable && 'overflow-hidden')}>
          <div className="flex items-start justify-between gap-4 px-5 pt-6 pb-2 md:px-7 md:pt-7">
            <div className="flex min-w-0 flex-col gap-3">
              {media}
              <h2
                id={titleId}
                className="text-[21px] leading-tight font-semibold tracking-[-0.02em] md:text-2xl"
              >
                {title}
              </h2>
              {description ? (
                <div id={descriptionId} className="text-[15px] text-muted">
                  {description}
                </div>
              ) : null}
            </div>
            {hideCloseButton ? null : (
              <IconButton label="Fermer la fenêtre" variant="ghost" onClick={onClose} className="-mt-1 -mr-2">
                <IconClose aria-hidden />
              </IconButton>
            )}
          </div>
          {children ? (
            <div
              className={cn(
                'px-5 py-4 md:px-7',
                scrollable && 'min-h-0 flex-1 overflow-y-auto',
                bodyClassName,
              )}
            >
              {children}
            </div>
          ) : null}
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-smoke px-5 py-4 md:px-7">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
