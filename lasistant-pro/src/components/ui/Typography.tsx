import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { AccentText } from '@/types';

/**
 * Éléments typographiques de la marque.
 */

interface EyebrowProps {
  children: ReactNode;
  /** « light » sur fond sombre, « success » pour les sections vertes */
  tone?: 'brand' | 'light' | 'success';
  className?: string;
  as?: 'span' | 'p';
}

/** Sur-titre en capitales précédé du losange doré. */
export function Eyebrow({ children, tone = 'brand', className, as: Tag = 'span' }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'eyebrow',
        tone === 'light' && 'text-brand-pale',
        tone === 'success' && 'text-success',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface AccentTitleProps {
  value: AccentText;
  /** Couleur de l'accent : violet sur fond clair, violet clair sur fond sombre */
  tone?: 'brand' | 'light' | 'success';
}

const ACCENT_TONES = {
  brand: 'text-brand',
  light: 'text-brand-light',
  success: 'text-success',
} as const;

/** Espace placée avant la fin du titre, selon la typographie française. */
function spaceBefore(end: string): string {
  if (/^[?!;:]/.test(end)) return '\u202F'; // espace fine insécable avant « ? ! ; : »
  if (/^[,.)]/.test(end)) return '';
  return ' ';
}

/** Rendu d'un titre comportant un accent en italique (« Soutien médical … en Tunisie »). */
export function AccentTitle({ value, tone = 'brand' }: AccentTitleProps) {
  const end = value.end ?? '';
  const spaceBeforeEnd = end ? spaceBefore(end) : '';
  return (
    <>
      {value.start} <span className={cn('accent', ACCENT_TONES[tone])}>{value.accent}</span>
      {end ? `${spaceBeforeEnd}${end}` : null}
    </>
  );
}

interface LeadProps {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'on-dark';
}

/** Chapô : texte d'introduction d'une section. */
export function Lead({ children, className, tone = 'default' }: LeadProps) {
  return (
    <p className={cn('text-lead', tone === 'on-dark' ? 'text-on-dark' : 'text-muted', className)}>
      {children}
    </p>
  );
}
