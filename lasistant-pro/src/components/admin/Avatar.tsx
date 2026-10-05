import { cn } from '@/lib/cn';
import { initials } from '@/lib/text';

const TONES = {
  brand: 'bg-brand-soft text-brand-dark',
  success: 'bg-success-soft text-success-dark',
  gold: 'bg-gold-soft text-gold-dark',
  info: 'bg-info-soft text-info-dark',
  neutral: 'bg-neutral-soft text-neutral',
  dark: 'bg-ink text-white',
} as const;

export type AvatarTone = keyof typeof TONES;

const ROTATION: AvatarTone[] = ['brand', 'success', 'gold', 'info', 'neutral'];

/** Teinte stable déduite du nom : une même personne garde toujours la même couleur. */
function toneForName(name: string): AvatarTone {
  const hash = [...name].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
  return ROTATION[hash % ROTATION.length] ?? 'brand';
}

interface AvatarProps {
  name: string;
  tone?: AvatarTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Pastille aux initiales (décorative : le nom est toujours écrit à côté). */
export function Avatar({ name, tone, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-[0.02em]',
        { sm: 'size-7 text-[11px]', md: 'size-[34px] text-[12.5px]', lg: 'size-14 text-lg' }[size],
        TONES[tone ?? toneForName(name)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
