import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Structure commune des pages du back-office : conteneur, en-tête et panneaux.
 */

/** Conteneur d'une page du back-office. */
export function AdminPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full max-w-[1480px] flex-col gap-6 px-4 pt-5 pb-10 md:px-8 md:pt-7 md:pb-14',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Actions principales de la page (créer, enregistrer…) */
  actions?: ReactNode;
  /** Élément placé au-dessus du titre (lien de retour, fil d'Ariane) */
  before?: ReactNode;
}

export function AdminPageHeader({ title, description, actions, before }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        {before}
        <h1 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.028em] md:text-[28px]">
          {title}
        </h1>
        {description ? <p className="text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  /** Nom du panneau pour les technologies d'assistance */
  labelledBy?: string;
  as?: 'section' | 'div';
}

/** Panneau blanc bordé. */
export function Panel({ children, className, labelledBy, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cn('min-w-0 rounded-2xl border border-line bg-paper', className)}
    >
      {children}
    </Tag>
  );
}

interface PanelHeaderProps {
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PanelHeader({ title, titleId, description, action, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-line px-5.5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id={titleId} className="text-base leading-snug font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5.5 py-5', className)}>{children}</div>;
}

export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-line px-5.5 py-3.5 text-[13.5px] text-muted',
        className,
      )}
    >
      {children}
    </div>
  );
}
