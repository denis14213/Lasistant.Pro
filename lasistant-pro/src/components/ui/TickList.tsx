import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconCheck } from './icons';

interface TickListProps {
  /** Contenus statiques : l'ordre ne change jamais, l'index sert donc de clé. */
  items: readonly ReactNode[];
  tone?: 'default' | 'on-dark';
  className?: string;
  /** Espacement vertical entre les éléments */
  spacing?: 'md' | 'lg';
}

/**
 * Liste à coches vertes : points forts d'un service, éléments inclus…
 * La coche vient du système d'icônes (mêmes terminaisons arrondies que le reste du site),
 * centrée sur la première ligne du texte.
 */
export function TickList({ items, tone = 'default', className, spacing = 'md' }: TickListProps) {
  return (
    <ul className={cn('flex flex-col', spacing === 'md' ? 'gap-2.5' : 'gap-3.5', className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className={cn(
            'flex items-start gap-3 text-[15.5px] leading-[1.45]',
            tone === 'on-dark' ? 'text-on-dark-strong' : 'text-ink-soft',
          )}
        >
          <IconCheck
            className={cn(
              'mt-[3px] size-4 shrink-0',
              tone === 'on-dark' ? 'text-success-bright' : 'text-success',
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
