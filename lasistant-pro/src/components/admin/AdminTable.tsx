import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AdminTableProps {
  children: ReactNode;
  /** Largeur minimale avant défilement horizontal (petits écrans) */
  minWidth?: number;
  className?: string;
  /** Description du tableau pour les lecteurs d'écran */
  caption?: string;
}

/**
 * Tableau du back-office : en-têtes discrets, lignes séparées, défilement horizontal sur mobile.
 */
export function AdminTable({ children, minWidth = 760, className, caption }: AdminTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table
        style={{ minWidth }}
        className={cn(
          'w-full border-collapse text-sm',
          '[&_th]:border-b [&_th]:border-line [&_th]:bg-smoke [&_th]:px-4 [&_th]:py-[11px] [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-[0.06em] [&_th]:whitespace-nowrap [&_th]:text-muted [&_th]:uppercase',
          '[&_tbody_tr:hover]:bg-smoke [&_tbody_tr:last-child_td]:border-b-0 [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-[13px] [&_td]:align-middle',
          className,
        )}
      >
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}
