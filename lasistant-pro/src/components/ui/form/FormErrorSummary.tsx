import { useEffect, useRef } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { Callout } from '../Callout';

interface FormErrorSummaryProps<T extends FieldValues> {
  errors: FieldErrors<T>;
  /** Libellé lisible de chaque champ, dans l'ordre du formulaire */
  labels: Partial<Record<keyof T & string, string>>;
  /** Incrémenté à chaque tentative d'envoi : le résumé reçoit alors le focus */
  submitCount: number;
}

/**
 * Résumé des erreurs en haut du formulaire, avec un lien vers chaque champ.
 * Reçoit le focus après une tentative d'envoi invalide (lecteurs d'écran, clavier).
 */
export function FormErrorSummary<T extends FieldValues>({
  errors,
  labels,
  submitCount,
}: FormErrorSummaryProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = (Object.keys(labels) as Array<keyof T & string>)
    .filter((key) => errors[key])
    .map((key) => ({ key, label: labels[key] ?? key, message: String(errors[key]?.message ?? '') }));

  useEffect(() => {
    if (submitCount > 0 && entries.length > 0) ref.current?.focus();
    // On ne déplace le focus qu'au moment de l'envoi, pas à chaque frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  if (entries.length === 0) return null;

  return (
    <div ref={ref} tabIndex={-1} className="outline-none">
      <Callout
        tone="danger"
        role="alert"
        title={`${entries.length} champ${entries.length > 1 ? 's' : ''} à corriger`}
      >
        <ul className="mt-1 list-disc space-y-1 pl-4.5">
          {entries.map((entry) => (
            <li key={entry.key}>
              <a
                href={`#${entry.key}`}
                className="underline underline-offset-2"
                onClick={(event) => {
                  const target = document.getElementById(entry.key);
                  if (target) {
                    event.preventDefault();
                    target.focus();
                    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  }
                }}
              >
                {entry.label} : {entry.message}
              </a>
            </li>
          ))}
        </ul>
      </Callout>
    </div>
  );
}
