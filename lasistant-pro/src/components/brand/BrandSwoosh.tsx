import { cn } from '@/lib/cn';

/**
 * Forme en croissant inspirée du symbole de la marque : signature graphique
 * utilisée en arrière-plan des sections. Purement décorative.
 */

const VIOLET_BLADE =
  'M478 18C330 22 178 96 120 268c-8 24-12 48-12 70 22-104 96-196 214-232 54-17 104-22 140-24 10-22 16-46 16-64Z';
const SECOND_BLADE =
  'M352 120c118 70 140 214 64 306-48 58-128 86-232 92 92-28 168-84 196-168 26-78 14-160-28-230Z';

interface BrandSwooshProps {
  className?: string;
  /** Teinte de la seconde lame : charbon (logo), vert (blocs d'appel) ou absente */
  secondBlade?: 'dark' | 'green' | 'none';
}

export function BrandSwoosh({ className, secondBlade = 'dark' }: BrandSwooshProps) {
  return (
    <svg viewBox="0 0 500 500" aria-hidden focusable="false" className={cn('pointer-events-none', className)}>
      <path d={VIOLET_BLADE} className="fill-swoosh" />
      {secondBlade === 'none' ? null : (
        <path
          d={SECOND_BLADE}
          className={secondBlade === 'green' ? 'fill-success-bright opacity-50' : 'fill-ink-soft'}
        />
      )}
    </svg>
  );
}
