import type { ReactNode } from 'react';
import { IconWeightScope } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  detail?: ReactNode;
  /** Mise en avant (élément nécessitant une action) */
  highlight?: boolean;
}

/** Indicateur clé du tableau de bord. */
export function KpiCard({ label, value, icon, detail, highlight = false }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-2xl border px-5.5 py-5',
        highlight ? 'border-brand-line bg-brand-wash' : 'border-line bg-paper',
      )}
    >
      <p className="flex items-center justify-between gap-3 text-[13.5px] font-medium text-muted [&_svg]:size-4">
        {label}
        <span aria-hidden>
          <IconWeightScope weight="bold">{icon}</IconWeightScope>
        </span>
      </p>
      <p
        className={cn(
          'text-[34px] leading-[1.1] font-semibold tracking-[-0.035em] tabular-nums',
          highlight && 'text-brand-dark',
        )}
      >
        {value}
      </p>
      {detail ? <p className="text-[13px] text-muted">{detail}</p> : null}
    </div>
  );
}
