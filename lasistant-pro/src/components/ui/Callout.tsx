import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconError, IconInfo, IconLock, IconSuccess, IconWarning, IconWeightScope } from './icons';

/**
 * Encart d'information, d'avertissement ou d'erreur.
 */

export type CalloutTone = 'info' | 'warning' | 'danger' | 'neutral' | 'success' | 'privacy';

const TONES: Record<CalloutTone, { box: string; icon: string; title: string; text: string }> = {
  info: {
    box: 'border-brand-line bg-brand-wash',
    icon: 'bg-brand-soft text-brand',
    title: 'text-ink',
    text: 'text-muted',
  },
  privacy: {
    box: 'border-brand-line bg-brand-wash',
    icon: 'bg-brand-soft text-brand',
    title: 'text-ink',
    text: 'text-muted',
  },
  warning: {
    box: 'border-warning-line bg-gold-wash',
    icon: 'bg-gold-soft text-gold-deep',
    title: 'text-ink',
    text: 'text-muted',
  },
  danger: {
    box: 'border-danger-line bg-danger-soft',
    icon: 'bg-white text-danger',
    title: 'text-danger-dark',
    text: 'text-danger-dark',
  },
  neutral: {
    box: 'border-line bg-paper',
    icon: 'bg-brand-soft text-brand',
    title: 'text-ink',
    text: 'text-muted',
  },
  success: {
    box: 'border-success-line bg-success-soft',
    icon: 'bg-white text-success',
    title: 'text-success-dark',
    text: 'text-success-dark',
  },
};

const DEFAULT_ICONS: Record<CalloutTone, ReactNode> = {
  info: <IconInfo />,
  privacy: <IconLock />,
  warning: <IconWarning />,
  danger: <IconError />,
  neutral: <IconInfo />,
  success: <IconSuccess />,
};

interface CalloutProps {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  /** Actions affichées sous le texte (boutons « Réessayer », « Appeler »…) */
  actions?: ReactNode;
  size?: 'sm' | 'md';
  role?: 'alert' | 'status';
  className?: string;
}

export function Callout({
  tone = 'info',
  title,
  children,
  icon,
  actions,
  size = 'md',
  role,
  className,
}: CalloutProps) {
  const style = TONES[tone];
  return (
    <div
      role={role}
      className={cn(
        'flex items-start rounded-box border',
        size === 'md' ? 'gap-4 p-5 md:gap-[18px] md:px-[26px] md:py-6' : 'gap-3 px-4 py-3.5',
        style.box,
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center',
          size === 'md' ? 'size-11 rounded-xl [&_svg]:size-6' : 'size-8 rounded-[9px] [&_svg]:size-4',
          style.icon,
        )}
        aria-hidden
      >
        <IconWeightScope weight={size === 'md' ? 'regular' : 'bold'}>
          {icon ?? DEFAULT_ICONS[tone]}
        </IconWeightScope>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title ? (
          <p className={cn('text-[17px] font-semibold tracking-[-0.01em]', style.title)}>{title}</p>
        ) : null}
        {children ? (
          <div className={cn(size === 'md' ? 'text-[15.5px]' : 'text-sm', style.text)}>{children}</div>
        ) : null}
        {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
