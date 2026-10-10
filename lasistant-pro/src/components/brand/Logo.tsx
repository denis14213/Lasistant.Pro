import logoMark from '@/assets/brand/logo-mark.webp';
import { cn } from '@/lib/cn';

/**
 * Logo LASISTANT.PRO : symbole « MA » couronné + mot-symbole « Lasistant.Pro ».
 * Le symbole officiel n'est jamais déformé (dimensions intrinsèques respectées).
 */

const MARK_RATIO = 533 / 512;

interface LogoMarkProps {
  size?: number;
  /** Symbole posé sur une tuile blanche (fonds sombres, favicon) */
  framed?: boolean;
  className?: string;
}

export function LogoMark({ size = 44, framed = false, className }: LogoMarkProps) {
  const image = (
    <img
      src={logoMark}
      alt=""
      width={Math.round(size * MARK_RATIO)}
      height={size}
      className={cn('block h-auto shrink-0', !framed && className)}
      style={{ width: Math.round(size * MARK_RATIO) }}
    />
  );
  if (!framed) return image;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[14px] bg-white p-1.5',
        className,
      )}
      style={{ width: size + 16, height: size + 16 }}
    >
      {image}
    </span>
  );
}

interface LogoProps {
  tone?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
  /** « desktop » : accroche masquée sur mobile */
  showTagline?: boolean | 'desktop';
  /** Classes supplémentaires de l'accroche (masquage à certaines largeurs) */
  taglineClassName?: string;
  framed?: boolean;
  className?: string;
}

const SIZES = {
  sm: { mark: 34, text: 'text-[17px]' },
  md: { mark: 44, text: 'text-[22px]' },
  lg: { mark: 52, text: 'text-2xl' },
} as const;

export function Logo({
  tone = 'default',
  size = 'md',
  showTagline = false,
  taglineClassName,
  framed = false,
  className,
}: LogoProps) {
  const dimensions = SIZES[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-3', className)}>
      <LogoMark size={framed ? dimensions.mark - 8 : dimensions.mark} framed={framed} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-bold tracking-[-0.03em] whitespace-nowrap italic', dimensions.text)}>
          <span className={tone === 'light' ? 'text-brand-light' : 'text-brand'}>Lasistant</span>
          <span className={tone === 'light' ? 'text-success-light' : 'text-wordmark-green'}>.Pro</span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              'mt-1.5 text-[10.5px] font-semibold tracking-[0.15em] uppercase',
              showTagline === 'desktop' && 'max-md:hidden',
              tone === 'light' ? 'text-on-dark-muted' : 'text-muted',
              taglineClassName,
            )}
          >
            Soutien médical &amp; hébergement
          </span>
        ) : null}
      </span>
    </span>
  );
}
