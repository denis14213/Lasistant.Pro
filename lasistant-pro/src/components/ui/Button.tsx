import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { IconSpinner, IconWeightScope } from './icons';

/**
 * Boutons du système de design.
 * Trois rendus partagent les mêmes styles : <Button> (action), <ButtonLink> (navigation
 * interne) et <ButtonAnchor> (lien externe, téléphone, e-mail).
 * Forme « pill » pour le site public, « rounded » (plus compacte) pour le back-office.
 */

export type ButtonVariant =
  | 'primary'
  | 'dark'
  | 'outline'
  | 'light'
  | 'outline-light'
  | 'success'
  | 'danger'
  | 'danger-outline'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'pill' | 'rounded';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  className?: string;
}

/**
 * Classes communes. Le libellé peut passer sur deux lignes équilibrées quand la place manque
 * (petits téléphones) : un bouton ne dépasse jamais de son conteneur (« max-w-full »).
 */
const BASE =
  'group inline-flex max-w-full items-center justify-center gap-2.5 border border-transparent text-center font-semibold leading-tight text-balance transition-[background-color,color,border-color,box-shadow,opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-cta hover:bg-brand-dark',
  dark: 'bg-ink text-white hover:bg-black',
  outline: 'border-line-strong bg-transparent text-ink hover:border-ink hover:bg-paper',
  light: 'bg-white text-ink hover:bg-brand-soft',
  'outline-light': 'border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10',
  success: 'bg-success text-white hover:bg-success-dark',
  danger: 'bg-danger text-white hover:bg-danger-dark',
  'danger-outline': 'border-line-strong bg-transparent text-danger hover:border-danger hover:bg-danger-soft',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
};

const PILL_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[42px] rounded-full px-[18px] text-[14.5px]',
  md: 'min-h-[52px] rounded-full px-6 text-base',
  lg: 'min-h-[60px] rounded-full px-5 text-base sm:px-[30px] sm:text-[17px]',
};

const ROUNDED_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[34px] rounded-[9px] px-3 text-[13.5px]',
  md: 'min-h-10 rounded-[10px] px-4 text-sm',
  lg: 'min-h-12 rounded-xl px-5 text-[15px]',
};

/** Classes d'un bouton : utile pour styliser un élément tiers comme un bouton. */
function buttonClasses({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  block = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    BASE,
    VARIANTS[variant],
    shape === 'pill' ? PILL_SIZES[size] : cn(ROUNDED_SIZES[size], 'shadow-none'),
    block && 'w-full',
    className,
  );
}

interface ButtonContentProps {
  /** Icône placée avant le libellé */
  icon?: ReactNode;
  /** Icône placée après le libellé (légère animation au survol) */
  trailingIcon?: ReactNode;
  loading?: boolean;
  /** Libellé affiché pendant le chargement (« Envoi en cours… ») */
  loadingLabel?: string;
  children?: ReactNode;
}

/** Contenu d'un bouton. Les icônes prennent le dessin « bold », accordé au libellé semi-gras. */
function ButtonContent({ icon, trailingIcon, loading, loadingLabel, children }: ButtonContentProps) {
  const label = loading && loadingLabel ? loadingLabel : children;
  return (
    <IconWeightScope weight="bold">
      {loading ? <IconSpinner className="animate-spin" aria-hidden /> : icon}
      {label !== undefined && label !== null ? <span>{label}</span> : null}
      {!loading && trailingIcon ? (
        <span
          className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        >
          {trailingIcon}
        </span>
      ) : null}
    </IconWeightScope>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions & ButtonContentProps;

export function Button({
  variant,
  size,
  shape,
  block,
  className,
  icon,
  trailingIcon,
  loading = false,
  loadingLabel,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, shape, block, className })}
      {...props}
    >
      <ButtonContent icon={icon} trailingIcon={trailingIcon} loading={loading} loadingLabel={loadingLabel}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = LinkProps & ButtonStyleOptions & Omit<ButtonContentProps, 'loading' | 'loadingLabel'>;

export function ButtonLink({
  variant,
  size,
  shape,
  block,
  className,
  icon,
  trailingIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, shape, block, className })} {...props}>
      <ButtonContent icon={icon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleOptions &
  Omit<ButtonContentProps, 'loading' | 'loadingLabel'>;

export function ButtonAnchor({
  variant,
  size,
  shape,
  block,
  className,
  icon,
  trailingIcon,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a className={buttonClasses({ variant, size, shape, block, className })} {...props}>
      <ButtonContent icon={icon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </a>
  );
}
