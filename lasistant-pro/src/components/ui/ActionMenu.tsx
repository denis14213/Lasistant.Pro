import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';
import { IconMore, IconWeightScope } from './icons';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionMenuProps {
  /** Nom du bouton pour les lecteurs d'écran (« Plus d'actions pour LP-2026-0148 ») */
  label: string;
  items: ActionMenuItem[];
  align?: 'start' | 'end';
}

/**
 * Menu d'actions contextuel (modèle « menu button » des pratiques ARIA) :
 * ouverture au clic ou au clavier, flèches haut / bas, Échap pour fermer.
 */
export function ActionMenu({ label, items, align = 'end' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ouverture : le premier élément reçoit le focus ; un clic à l'extérieur referme le menu.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const entries = [
      ...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []),
    ];
    const index = entries.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      entries[(index + 1) % entries.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      entries[(index - 1 + entries.length) % entries.length]?.focus();
    }
  };

  return (
    <div className="relative inline-flex">
      <IconButton
        ref={buttonRef}
        label={label}
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <IconMore aria-hidden />
      </IconButton>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute top-full z-40 mt-1.5 min-w-[220px] rounded-xl border border-line bg-paper p-1.5 shadow-raised',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                close();
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-cloud focus:bg-cloud focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4',
                item.tone === 'danger' ? 'text-danger' : 'text-ink-soft',
              )}
            >
              <IconWeightScope weight="bold">{item.icon}</IconWeightScope>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
