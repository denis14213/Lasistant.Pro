import { cn } from '@/lib/cn';

export interface FilterTab<V extends string> {
  value: V;
  label: string;
  count: number;
}

interface FilterTabsProps<V extends string> {
  tabs: ReadonlyArray<FilterTab<V>>;
  value: V;
  onChange: (value: V) => void;
  label: string;
}

/** Onglets de filtre avec compteur (statuts des demandes, des articles…). */
export function FilterTabs<V extends string>({ tabs, value, onChange, label }: FilterTabsProps<V>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative flex gap-0.5 overflow-x-auto border-b border-line px-2.5"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 border-transparent px-3 py-[13px] text-sm font-medium whitespace-nowrap text-muted transition-colors hover:text-ink',
              active && 'border-brand font-semibold text-ink',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11.5px] font-bold',
                active ? 'bg-brand text-white' : 'bg-neutral-soft text-ink-soft',
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
