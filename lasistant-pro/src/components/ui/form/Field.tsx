import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconError } from '../icons';
import { FieldContext } from './field-context';

/**
 * Champ de formulaire : libellé, contrôle, aide et message d'erreur.
 * Le contexte transmet automatiquement l'identifiant et les attributs d'accessibilité
 * (aria-describedby, aria-invalid, aria-required) au contrôle placé à l'intérieur.
 */

interface FieldProps {
  label: ReactNode;
  id?: string;
  required?: boolean;
  /** Affiche la mention « (facultatif) » */
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  /** « group » pour un ensemble de choix : le libellé n'est pas un <label> */
  kind?: 'control' | 'group';
  /** Contenu aligné à droite du libellé (compteur, lien…) */
  labelAside?: ReactNode;
  srOnlyLabel?: boolean;
  density?: 'default' | 'compact';
}

export function Field({
  label,
  id,
  required = false,
  optional = false,
  hint,
  error,
  children,
  className,
  kind = 'control',
  labelAside,
  srOnlyLabel = false,
  density = 'default',
}: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? `champ-${autoId.replace(/:/g, '')}`;
  const hintId = hint ? `${fieldId}-aide` : undefined;
  const errorId = error ? `${fieldId}-erreur` : undefined;
  const labelId = `${fieldId}-libelle`;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const labelContent = (
    <>
      {label}
      {required ? (
        <span className="text-brand" aria-hidden>
          {' '}
          *
        </span>
      ) : null}
      {optional ? <span className="font-normal text-muted"> (facultatif)</span> : null}
    </>
  );
  const labelClasses = cn(
    'leading-snug font-semibold text-ink',
    density === 'compact' ? 'text-[13.5px]' : 'text-[14.5px]',
    srOnlyLabel && 'sr-only',
  );

  return (
    <FieldContext.Provider value={{ id: fieldId, describedBy, invalid: Boolean(error), required, labelId }}>
      <div className={cn('flex min-w-0 flex-col', density === 'compact' ? 'gap-[7px]' : 'gap-2', className)}>
        <div className={cn('flex items-center justify-between gap-3', srOnlyLabel && 'contents')}>
          {kind === 'control' ? (
            <label id={labelId} htmlFor={fieldId} className={labelClasses}>
              {labelContent}
            </label>
          ) : (
            <span id={labelId} className={labelClasses}>
              {labelContent}
            </span>
          )}
          {labelAside}
        </div>
        {children}
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
        {hint ? (
          <p id={hintId} className="text-[13.5px] leading-snug text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-2 text-[13.5px] leading-snug font-medium text-danger">
      <IconError className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
