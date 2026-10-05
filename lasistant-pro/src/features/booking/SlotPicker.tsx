import { cn } from '@/lib/cn';
import type { Slot } from './availability';

interface SlotPickerProps {
  name: string;
  slots: readonly Slot[];
  value: string;
  onChange: (time: string) => void;
  labelledBy: string;
  describedBy?: string;
}

const STATUS_LABELS = { available: '', taken: ' (déjà réservé)', 'too-soon': ' (délai trop court)' } as const;

/** Choix de l'heure : boutons radio natifs, les créneaux indisponibles sont barrés. */
export function SlotPicker({ name, slots, value, onChange, labelledBy, describedBy }: SlotPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="grid grid-cols-3 gap-2.5"
    >
      {slots.map((slot) => {
        const disabled = slot.status !== 'available';
        return (
          <label
            key={slot.time}
            className={cn(
              'relative flex min-h-12 items-center justify-center rounded-xl border-[1.5px] text-[15px] font-semibold transition-colors',
              'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
              disabled
                ? 'cursor-not-allowed border-dashed border-line-strong bg-canvas text-disabled line-through'
                : 'cursor-pointer border-line-strong bg-white hover:border-line-hover has-checked:border-brand has-checked:bg-brand-soft has-checked:text-brand-dark',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={slot.time}
              checked={value === slot.time}
              disabled={disabled}
              onChange={() => onChange(slot.time)}
            />
            {slot.time}
            <span className="sr-only">{STATUS_LABELS[slot.status]}</span>
          </label>
        );
      })}
    </div>
  );
}
