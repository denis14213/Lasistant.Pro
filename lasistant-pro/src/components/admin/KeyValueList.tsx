import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

/** Liste « libellé : valeur » (fiches du back-office). */
export function KeyValueList({ items, className }: { items: KeyValueItem[]; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-y-3',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted max-sm:mt-2">{item.label}</dt>
          <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
