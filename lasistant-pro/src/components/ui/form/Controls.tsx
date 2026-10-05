import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconCheck, IconChevronDown } from '../icons';
import { controlClasses } from './control-classes';
import { FieldError } from './Field';
import { useFieldContext } from './field-context';

/**
 * Contrôles de saisie natifs, stylisés et reliés à leur <Field>.
 * Les éléments natifs sont conservés pour l'accessibilité et la compatibilité mobile.
 */

type Density = { density?: 'default' | 'compact' };

/** Attributs d'accessibilité fournis par le champ englobant. */
function useControlAttributes(id?: string, describedBy?: string) {
  const field = useFieldContext();
  return {
    id: id ?? field?.id,
    'aria-describedby': describedBy ?? field?.describedBy,
    'aria-invalid': field?.invalid || undefined,
    'aria-required': field?.required || undefined,
    invalid: field?.invalid ?? false,
  };
}

export function Input({ className, density = 'default', id, ...props }: ComponentProps<'input'> & Density) {
  const { invalid, ...a11y } = useControlAttributes(id, props['aria-describedby']);
  return (
    <input
      className={cn(controlClasses({ invalid, compact: density === 'compact' }), className)}
      {...a11y}
      {...props}
    />
  );
}

export function Textarea({
  className,
  density = 'default',
  id,
  rows = 4,
  ...props
}: ComponentProps<'textarea'> & Density) {
  const { invalid, ...a11y } = useControlAttributes(id, props['aria-describedby']);
  return (
    <textarea
      rows={rows}
      className={cn(
        controlClasses({ invalid, compact: density === 'compact' }),
        'block min-h-32 resize-y py-3.5 leading-normal',
        density === 'compact' && 'py-3',
        className,
      )}
      {...a11y}
      {...props}
    />
  );
}

export function Select({
  className,
  density = 'default',
  id,
  children,
  ...props
}: ComponentProps<'select'> & Density) {
  const { invalid, ...a11y } = useControlAttributes(id, props['aria-describedby']);
  return (
    <div className="relative">
      <select
        className={cn(
          controlClasses({ invalid, compact: density === 'compact' }),
          'cursor-pointer appearance-none pr-11',
          className,
        )}
        {...a11y}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  label: ReactNode;
  error?: string;
  size?: 'sm' | 'md';
}

/** Case à cocher avec libellé cliquable et message d'erreur éventuel. */
export function Checkbox({ label, error, size = 'md', className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `case-${autoId.replace(/:/g, '')}`;
  const errorId = error ? `${inputId}-erreur` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-start gap-3 leading-normal text-ink-soft',
          size === 'md' ? 'text-[14.5px]' : 'text-[13.5px]',
          error && 'text-danger',
        )}
      >
        <span className="relative mt-px inline-flex shrink-0">
          <input
            id={inputId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              'peer size-[22px] cursor-pointer appearance-none rounded-md border-[1.5px] border-control bg-white transition-colors checked:border-brand checked:bg-brand',
              error && 'border-danger',
            )}
            {...props}
          />
          <IconCheck
            className="pointer-events-none absolute inset-0 m-auto size-4 text-white opacity-0 peer-checked:opacity-100"
            aria-hidden
          />
        </span>
        <span className="[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2">{label}</span>
      </label>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Libellé lu par les lecteurs d'écran */
  label: string;
  disabled?: boolean;
  id?: string;
}

/** Interrupteur (activation d'un service, d'une option…). */
export function Switch({ checked, onCheckedChange, label, disabled, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-success' : 'bg-switch-off',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.2)] transition-transform duration-200',
          checked && 'translate-x-4',
        )}
        aria-hidden
      />
    </button>
  );
}
