import { useEffect, useRef } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

interface BookingStepperProps {
  steps: ReadonlyArray<{ id: string; label: string }>;
  current: number;
  /** Étape la plus avancée atteinte : on peut revenir sur toutes les étapes déjà franchies */
  furthest: number;
  onSelect: (index: number) => void;
}

/** Barre des étapes de la réservation (défilement horizontal sur mobile). */
export function BookingStepper({ steps, current, furthest, onSelect }: BookingStepperProps) {
  const listRef = useRef<HTMLOListElement>(null);

  // Sur petit écran, la barre défile pour garder l'étape en cours au centre.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[current];
    if (!list || !(item instanceof HTMLElement)) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: Math.max(0, item.offsetLeft - (list.clientWidth - item.clientWidth) / 2),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [current]);

  return (
    <nav aria-label="Étapes de la réservation">
      <ol
        ref={listRef}
        className="relative flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-full border border-line bg-white p-1.5"
      >
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = index <= furthest;
          return (
            <li key={step.id} className="min-w-max flex-1">
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-full py-2 pr-4.5 pl-2 text-left text-[15px] leading-[1.25] font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-ink font-semibold text-white'
                    : done
                      ? 'text-ink hover:bg-canvas'
                      : 'text-muted',
                  reachable && !active && 'hover:bg-canvas',
                  !reachable && 'cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13.5px] font-bold',
                    active
                      ? 'border-brand bg-brand text-white'
                      : done
                        ? 'border-success-soft bg-success-soft text-success'
                        : 'border-line-strong bg-white text-muted',
                  )}
                  aria-hidden
                >
                  {done ? <IconCheck className="size-4" /> : index + 1}
                </span>
                {step.label}
                {done ? <span className="sr-only"> (terminée)</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
