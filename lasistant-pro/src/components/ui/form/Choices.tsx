import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconAdd, IconRemove, IconWeightScope } from '../icons';
import { useFieldContext } from './field-context';

/**
 * Choix exclusifs fondés sur de vrais boutons radio (navigation clavier native),
 * présentés en pastilles (ChoiceGroup) ou en cartes (RadioCards).
 */

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  disabled?: boolean;
}

interface ChoiceGroupProps<V extends string> {
  name: string;
  options: ReadonlyArray<ChoiceOption<V>>;
  value: V | undefined;
  onChange: (value: V) => void;
  size?: 'md' | 'sm';
  className?: string;
}

const focusRing =
  'has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid';

export function ChoiceGroup<V extends string>({
  name,
  options,
  value,
  onChange,
  size = 'md',
  className,
}: ChoiceGroupProps<V>) {
  const field = useFieldContext();
  return (
    <div
      role="radiogroup"
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'relative inline-flex cursor-pointer items-center rounded-full border-[1.5px] border-line-strong bg-white font-medium transition-colors hover:border-line-hover',
            'has-checked:border-brand has-checked:bg-brand-soft has-checked:font-semibold has-checked:text-brand-dark',
            'has-disabled:cursor-not-allowed has-disabled:opacity-50',
            size === 'md' ? 'min-h-[46px] px-[18px] text-[15px]' : 'min-h-9 px-3 text-[13.5px]',
            focusRing,
          )}
        >
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

export interface RadioCardOption<V extends string> {
  value: V;
  title: string;
  description?: string;
  meta?: ReactNode;
}

interface RadioCardsProps<V extends string> {
  name: string;
  options: ReadonlyArray<RadioCardOption<V>>;
  value: V | undefined;
  onChange: (value: V) => void;
  columns?: 1 | 2;
  className?: string;
}

export function RadioCards<V extends string>({
  name,
  options,
  value,
  onChange,
  columns = 2,
  className,
}: RadioCardsProps<V>) {
  const field = useFieldContext();
  return (
    <div
      role="radiogroup"
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      className={cn('grid grid-cols-1 gap-3.5', columns === 2 && 'md:grid-cols-2', className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'group/card flex cursor-pointer items-start gap-4 rounded-box border-[1.5px] border-line-strong bg-white p-5 transition-[border-color,box-shadow,background-color] hover:border-line-hover',
            'has-checked:border-brand has-checked:bg-brand-wash has-checked:shadow-[0_0_0_4px_rgb(181_38_217/0.11)]',
            focusRing,
          )}
        >
          <input
            type="radio"
            className="peer sr-only"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span
            className="mt-0.5 grid size-[22px] shrink-0 grid-cols-1 place-content-center rounded-full border-[1.5px] border-control bg-white peer-checked:border-brand peer-checked:[&>span]:scale-100"
            aria-hidden
          >
            <span className="size-2.5 scale-0 rounded-full bg-brand transition-transform" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[16.5px] leading-snug font-semibold tracking-[-0.01em]">
              {option.title}
            </span>
            {option.description ? (
              <span className="mt-1 text-sm leading-normal text-muted">{option.description}</span>
            ) : null}
            {option.meta ? (
              <span className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] font-medium text-ink-soft [&_svg]:size-4">
                <IconWeightScope weight="bold">{option.meta}</IconWeightScope>
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Libellés des boutons pour les lecteurs d'écran */
  decrementLabel: string;
  incrementLabel: string;
}

/** Sélecteur numérique (nombre de personnes…). */
export function Counter({
  value,
  onChange,
  min = 1,
  max = 10,
  decrementLabel,
  incrementLabel,
}: CounterProps) {
  const field = useFieldContext();
  return (
    <div
      role="group"
      aria-labelledby={field?.labelId}
      className="inline-flex h-[52px] w-fit items-center rounded-field border border-line-strong bg-white"
    >
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-full w-12 items-center justify-center disabled:opacity-40"
      >
        <IconRemove className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className="min-w-11 text-center font-semibold">
        {value}
      </output>
      <button
        type="button"
        aria-label={incrementLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-full w-12 items-center justify-center disabled:opacity-40"
      >
        <IconAdd className="size-4" aria-hidden />
      </button>
    </div>
  );
}
