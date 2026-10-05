import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Tone } from '@/types';
import { IconWeightScope } from './icons';

/**
 * Étiquettes, pastilles, filtres et statuts.
 */

const TAG_TONES: Record<Tone | 'on-dark', string> = {
  brand: 'bg-brand-soft text-brand-dark',
  success: 'bg-success-soft text-success-dark',
  gold: 'bg-gold-soft text-gold-dark',
  neutral: 'bg-neutral-soft text-ink-soft',
  info: 'bg-info-soft text-info-dark',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  'on-dark': 'bg-white/12 text-white',
};

interface TagProps {
  children: ReactNode;
  tone?: Tone | 'on-dark';
  icon?: ReactNode;
  className?: string;
}

/** Étiquette de catégorie (« Assistance médicale », « Logement »…). */
export function Tag({ children, tone = 'brand', icon, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full px-3 py-0.5 text-[12.5px] leading-tight font-semibold tracking-[0.01em] [&_svg]:size-3.5 [&_svg]:shrink-0',
        TAG_TONES[tone],
        className,
      )}
    >
      {icon ? <IconWeightScope weight="bold">{icon}</IconWeightScope> : null}
      {children}
    </span>
  );
}

/** Pastille d'information neutre (« 1 h », « Données protégées »…). */
export function Pill({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[34px] items-center gap-2 rounded-full border border-line bg-paper px-3.5 text-sm font-medium text-ink-soft [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      {icon ? <IconWeightScope weight="bold">{icon}</IconWeightScope> : null}
      {children}
    </span>
  );
}

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  count?: number;
}

/** Filtre activable (catégories de l'Espace infos…). */
export function Chip({ pressed, count, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-[42px] items-center gap-2 rounded-full border px-[17px] text-[14.5px] font-medium whitespace-nowrap transition-colors',
        pressed
          ? 'border-ink bg-ink text-white'
          : 'border-line-strong bg-paper text-ink-soft hover:border-ink',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined ? <span className="text-xs opacity-70">{count}</span> : null}
    </button>
  );
}

const BADGE_TONES: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand-dark',
  info: 'bg-info-soft text-info-dark',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success-dark',
  neutral: 'bg-neutral-soft text-neutral',
  danger: 'bg-danger-soft text-danger',
  gold: 'bg-gold-soft text-gold-dark',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Badge de statut avec pastille : la couleur n'est jamais le seul repère (libellé toujours présent). */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center gap-[7px] rounded-full px-2.5 text-[12.5px] font-semibold whitespace-nowrap',
        BADGE_TONES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/** Mention « à valider » : information à fournir ou à confirmer par le propriétaire. */
export function ToValidate({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-md bg-gold-soft px-[7px] py-px text-[0.9em] font-semibold text-gold-dark shadow-[inset_0_0_0_1px_var(--color-gold-line)]',
        className,
      )}
    >
      <span className="sr-only">À valider : </span>
      {children}
    </span>
  );
}
