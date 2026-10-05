import type { AnchorHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { IconWeightScope } from './icons';

/**
 * Boutons composés uniquement d'une icône.
 * Le libellé (`label`) est obligatoire : il est lu par les lecteurs d'écran.
 */

type IconButtonVariant = 'outline' | 'ghost' | 'on-dark' | 'dark';
type IconButtonSize = 'sm' | 'md';

interface IconButtonStyle {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
}

const VARIANTS: Record<IconButtonVariant, string> = {
  outline: 'border border-line-strong text-ink hover:border-ink hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-ink/5',
  'on-dark': 'border border-white/20 text-white hover:bg-white/10',
  dark: 'bg-ink text-white hover:bg-brand',
};

const SIZES: Record<IconButtonSize, string> = {
  md: 'size-11 rounded-full [&_svg]:size-4.5',
  sm: 'size-8 rounded-lg [&_svg]:size-4',
};

/** Icône de 16 ou 18 px : dessin « bold », comme dans les boutons à libellé. */
function sized(children: ReactNode) {
  return <IconWeightScope weight="bold">{children}</IconWeightScope>;
}

function iconButtonClasses({ variant = 'outline', size = 'md', className }: IconButtonStyle): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type IconButtonProps = ComponentProps<'button'> & IconButtonStyle & { label: string };

export function IconButton({
  label,
  variant,
  size,
  className,
  type = 'button',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={iconButtonClasses({ variant, size, className })}
      {...props}
    >
      {sized(children)}
    </button>
  );
}

type IconLinkProps = LinkProps & IconButtonStyle & { label: string };

export function IconLink({ label, variant, size, className, children, ...props }: IconLinkProps) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={iconButtonClasses({ variant, size, className })}
      {...props}
    >
      {sized(children)}
    </Link>
  );
}

type IconAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & IconButtonStyle & { label: string };

export function IconAnchor({ label, variant, size, className, children, ...props }: IconAnchorProps) {
  return (
    <a
      aria-label={label}
      title={label}
      className={iconButtonClasses({ variant, size, className })}
      {...props}
    >
      {sized(children)}
    </a>
  );
}
