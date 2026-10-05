import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { IconName, IconTone } from '@/types';
import { iconRegistry } from './icon-registry';
import { IconWeightScope, type AppIcon, type IconProps as SystemIconProps } from './icons';

interface IconProps extends SystemIconProps {
  name: IconName;
}

/**
 * Icône désignée par son nom (contenus et base de données ne stockent que le nom).
 * Un nom inconnu (donnée ancienne ou saisie externe) n'affiche rien plutôt que de casser la page.
 */
export function Icon({ name, className, ...props }: IconProps) {
  const Component = (iconRegistry as Partial<Record<IconName, AppIcon>>)[name];
  if (!Component) return null;
  return <Component className={cn('size-5', className)} {...props} />;
}

const BOX_TONES: Record<IconTone | 'on-dark' | 'white', string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  gold: 'bg-gold-soft text-gold-deep',
  dark: 'bg-ink text-white',
  neutral: 'bg-neutral-soft text-ink-soft',
  'on-dark': 'bg-white/10 text-white',
  white: 'bg-white text-success',
};

const BOX_SIZES = {
  xs: 'size-9 rounded-[10px] [&_svg]:size-4.5',
  sm: 'size-11 rounded-xl [&_svg]:size-6',
  md: 'size-[52px] rounded-[15px] [&_svg]:size-6',
  lg: 'size-[60px] rounded-[18px] [&_svg]:size-7',
} as const;

interface IconBoxProps {
  icon?: IconName;
  children?: ReactNode;
  tone?: keyof typeof BOX_TONES;
  size?: keyof typeof BOX_SIZES;
  className?: string;
}

/**
 * Pastille colorée contenant une icône « duotone ».
 * Réservée aux services (avec la teinte propre à chaque service), aux encarts posés sur une
 * photo et au back-office. Une caractéristique dans une grille utilise FeatureIcon.
 */
export function IconBox({ icon, children, tone = 'brand', size = 'md', className }: IconBoxProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        BOX_TONES[tone],
        BOX_SIZES[size],
        className,
      )}
      aria-hidden
    >
      <IconWeightScope weight="duotone">{icon ? <Icon name={icon} /> : children}</IconWeightScope>
    </span>
  );
}

const FEATURE_TONES: Record<IconTone | 'on-dark', string> = {
  brand: 'text-brand',
  success: 'text-success',
  gold: 'text-gold-deep',
  dark: 'text-ink',
  neutral: 'text-ink-soft',
  'on-dark': 'text-brand-pale',
};

const FEATURE_SIZES = {
  md: 'size-7',
  lg: 'size-8',
  xl: 'size-10',
} as const;

interface FeatureIconProps {
  icon: IconName;
  tone?: keyof typeof FEATURE_TONES;
  size?: keyof typeof FEATURE_SIZES;
  className?: string;
}

/**
 * Icône d'identité posée sans pastille (dessin « duotone ») : caractéristiques d'une grille,
 * publics accompagnés, coordonnées. Plus légère qu'une pastille, elle laisse respirer la mise
 * en page et évite l'effet « une icône dans un carré pastel par carte ».
 */
export function FeatureIcon({ icon, tone = 'brand', size = 'lg', className }: FeatureIconProps) {
  return (
    <Icon
      name={icon}
      weight="duotone"
      className={cn('shrink-0', FEATURE_SIZES[size], FEATURE_TONES[tone], className)}
    />
  );
}
