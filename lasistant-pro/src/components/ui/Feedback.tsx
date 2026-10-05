import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconSpinner } from './icons';

/**
 * Indicateurs de chargement et états vides.
 */

/** Indicateur de chargement discret pour les actions courtes. */
export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <span role={label ? 'status' : undefined} className={cn('inline-flex items-center gap-2.5', className)}>
      <IconSpinner className="size-4.5 animate-spin text-brand" aria-hidden />
      {label ? <span className="text-sm text-muted">{label}</span> : null}
    </span>
  );
}

/** Bloc de contenu en cours de chargement (squelette animé). */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('skeleton', className)} aria-hidden />;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
  className?: string;
  headingLevel?: 'h2' | 'h3';
}

const EMPTY_TONES = {
  neutral: 'bg-neutral-soft text-ink-soft',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-gold-soft text-gold-deep',
} as const;

/** État vide : chaque liste vide explique quoi faire ensuite. */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  tone = 'neutral',
  className,
  headingLevel: Heading = 'h3',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      <span
        className={cn(
          'mb-1 flex size-[72px] items-center justify-center rounded-full [&_svg]:size-7',
          EMPTY_TONES[tone],
        )}
        aria-hidden
      >
        {icon}
      </span>
      <Heading className="text-h3 font-semibold">{title}</Heading>
      {description ? <div className="max-w-[520px] text-muted">{description}</div> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
