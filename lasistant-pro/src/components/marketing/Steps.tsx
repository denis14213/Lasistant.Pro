import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { StepItem } from '@/types';

/**
 * Représentations d'un parcours en étapes numérotées.
 * La première étape est mise en avant : c'est celle que le visiteur peut franchir maintenant.
 */

const stepNumber = (index: number) => String(index + 1).padStart(2, '0');

interface StepsTimelineProps {
  steps: readonly StepItem[];
  columns?: 3 | 5;
}

/** Frise horizontale sur fond sombre (verticale sur mobile). */
export function StepsTimeline({ steps, columns = 5 }: StepsTimelineProps) {
  return (
    <ol className={cn('grid grid-cols-1 md:grid-cols-3 md:gap-y-11', columns === 5 && 'lg:grid-cols-5')}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        // Sur tablette, la frise de cinq étapes passe à la ligne après la troisième.
        const breaksOnTablet = columns === 5 && index === 2;
        return (
          <li
            key={step.title}
            className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-x-4.5 gap-y-1 pb-7 last:pb-0 md:flex md:flex-col md:gap-3.5 md:pr-7 md:pb-0"
          >
            <span
              className={cn(
                'relative z-[1] flex size-14 items-center justify-center rounded-full border text-[15px] font-bold tracking-[0.02em] text-white',
                index === 0 ? 'border-brand bg-brand' : 'border-white/24 bg-night',
              )}
            >
              {stepNumber(index)}
            </span>
            {isLast ? null : (
              <span
                aria-hidden
                className={cn(
                  'absolute top-14 bottom-0 left-7 w-px bg-white/18',
                  'md:top-7 md:right-0 md:bottom-auto md:left-14 md:h-px md:w-auto',
                  breaksOnTablet && 'md:max-lg:hidden',
                )}
              />
            )}
            <h3 className="mt-3.5 text-xl font-semibold tracking-[-0.015em] md:mt-3">{step.title}</h3>
            <p className="col-start-2 text-[15px] leading-[1.55] text-on-dark">{step.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

interface VerticalStepsProps {
  steps: readonly StepItem[];
  /** Informations complémentaires de la première étape (durée, modalités…) */
  firstStepMeta?: ReactNode;
  className?: string;
}

/** Parcours vertical relié par un filet (pages de service). */
export function VerticalSteps({ steps, firstStepMeta, className }: VerticalStepsProps) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4.5 pb-11 last:pb-0 md:grid-cols-[56px_minmax(0,1fr)] md:gap-6.5"
        >
          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-full border text-[15px] font-bold md:size-14',
              index === 0 ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white text-ink',
            )}
          >
            {stepNumber(index)}
          </span>
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className="absolute top-11 bottom-0 left-[21.5px] w-px bg-line-strong md:top-14 md:left-[27.5px]"
            />
          ) : null}
          <div>
            <h3 className="mt-2 mb-2 text-[21px] font-semibold tracking-[-0.015em] md:mt-[13px]">
              {step.title}
            </h3>
            <p className="text-base text-muted">{step.text}</p>
            {index === 0 && firstStepMeta ? (
              <div className="mt-3.5 flex flex-wrap gap-2">{firstStepMeta}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Étapes en colonnes, numérotées en italique éditorial. */
export function NumberedSteps({ steps }: { steps: readonly StepItem[] }) {
  return (
    <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-3">
          <span className="accent text-[52px] leading-none text-brand" aria-hidden>
            {stepNumber(index)}
          </span>
          <h3 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">{step.title}</h3>
          <p className="text-[15px] text-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
