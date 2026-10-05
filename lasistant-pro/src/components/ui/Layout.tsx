import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Eyebrow } from './Typography';

/**
 * Primitives de mise en page : conteneur, section, en-tête de section, carte.
 */

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('container-site', className)} {...props} />;
}

export type SectionTone = 'canvas' | 'paper' | 'mist' | 'sage' | 'sand' | 'night' | 'plum';
export type SectionSpacing = 'lg' | 'md' | 'sm' | 'none';

const SECTION_TONES: Record<SectionTone, string> = {
  canvas: '',
  paper: 'bg-paper',
  mist: 'bg-mist',
  sage: 'bg-sage',
  sand: 'bg-sand',
  night: 'bg-night text-white',
  plum: 'bg-plum text-white',
};

const SECTION_SPACING: Record<SectionSpacing, string> = {
  lg: 'py-18 md:py-30',
  md: 'py-15 md:py-22',
  sm: 'py-11 md:py-16',
  none: '',
};

interface SectionProps extends ComponentProps<'section'> {
  tone?: SectionTone;
  spacing?: SectionSpacing;
  /** Filet en haut de section */
  bordered?: boolean;
}

export function Section({ tone = 'canvas', spacing = 'lg', bordered, className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        SECTION_TONES[tone],
        SECTION_SPACING[spacing],
        bordered && 'border-t border-line',
        className,
      )}
      {...props}
    />
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  titleId?: string;
  /** Contenu complémentaire aligné à droite (chapô, lien, bouton) */
  aside?: ReactNode;
  tone?: 'default' | 'dark';
  titleClassName?: string;
  className?: string;
}

/** En-tête de section : sur-titre, titre H2 et contenu complémentaire. */
export function SectionHeader({
  eyebrow,
  title,
  titleId,
  aside,
  tone = 'default',
  titleClassName,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-9 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 md:mb-14', className)}>
      {/* « min-w-0 » : sur très petit écran, un mot long du titre passe à la ligne au lieu de déborder. */}
      <div className="flex max-w-[720px] min-w-0 flex-col gap-5">
        {eyebrow ? <Eyebrow tone={tone === 'dark' ? 'light' : 'brand'}>{eyebrow}</Eyebrow> : null}
        <h2 id={titleId} className={cn('text-h2 font-semibold', titleClassName)}>
          {title}
        </h2>
      </div>
      {aside ? <div className="flex max-w-[440px] min-w-0 flex-col gap-4.5">{aside}</div> : null}
    </div>
  );
}

interface CardProps extends ComponentProps<'div'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CARD_PADDING = { none: '', sm: 'p-5 md:p-6', md: 'p-6 md:p-8', lg: 'p-8 md:p-14' } as const;

/** Carte blanche bordée, rayon de 26 px. */
export function Card({ padding = 'none', className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-card border border-line bg-paper', CARD_PADDING[padding], className)}
      {...props}
    />
  );
}
