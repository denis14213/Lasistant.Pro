import { createContext, useContext } from 'react';

/**
 * Contexte d'un champ de formulaire : <Field> transmet l'identifiant et les attributs
 * d'accessibilité (aria-describedby, aria-invalid, aria-required) au contrôle qu'il contient.
 */
export interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  labelId: string;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** Attributs du champ englobant (utilisés par Input, Select, Textarea…), ou null hors d'un <Field>. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}
