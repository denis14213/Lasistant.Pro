import { BOOKING_STATUS_HINTS, BOOKING_STATUS_LABELS, BOOKING_STATUS_ORDER } from '@/content/labels';
import { cn } from '@/lib/cn';
import type { BookingStatus } from '@/types';

const SELECTED: Record<BookingStatus, string> = {
  nouveau: 'bg-brand-soft text-brand-dark',
  en_cours: 'bg-info-soft text-info-dark',
  en_attente: 'bg-warning-soft text-warning',
  confirme: 'bg-success-soft text-success-dark',
  cloture: 'bg-neutral-soft text-neutral',
  annule: 'bg-danger-soft text-danger',
};

interface StatusSelectorProps {
  value: BookingStatus;
  onChange: (status: BookingStatus) => void;
  labelledBy: string;
  disabled?: boolean;
}

/** Choix du statut d'une demande : boutons radio natifs, l'usage de chaque statut est rappelé au survol. */
export function StatusSelector({ value, onChange, labelledBy, disabled = false }: StatusSelectorProps) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-1.5">
      {BOOKING_STATUS_ORDER.map((status) => {
        const checked = status === value;
        return (
          <label
            key={status}
            title={BOOKING_STATUS_HINTS[status]}
            className={cn(
              'relative inline-flex h-[34px] cursor-pointer items-center gap-[7px] rounded-full border px-3 text-[13px] font-semibold transition-colors',
              "before:size-[7px] before:rounded-full before:content-['']",
              'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
              checked
                ? cn(
                    'border-transparent shadow-[inset_0_0_0_1.5px_currentColor] before:bg-current',
                    SELECTED[status],
                  )
                : 'border-line-strong bg-white text-ink-soft before:bg-control hover:border-line-hover',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name="statut-demande"
              value={status}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(status)}
            />
            {BOOKING_STATUS_LABELS[status]}
          </label>
        );
      })}
    </div>
  );
}
