import type { ReactNode } from 'react';
import { IconWeightScope } from '@/components/ui/icons';

/**
 * Boutons des barres d'outils de mise en forme (articles, modèles d'e-mails).
 */

export function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // La sélection du champ est conservée : le bouton ne prend pas le focus au clic.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex h-[34px] min-w-[34px] items-center justify-center rounded-lg px-2 text-ink-soft transition-colors hover:bg-neutral-soft [&_svg]:size-4"
    >
      <IconWeightScope weight="bold">{children}</IconWeightScope>
    </button>
  );
}

export function ToolSeparator() {
  return <span className="mx-1.5 h-[22px] w-px bg-line-strong" aria-hidden />;
}
