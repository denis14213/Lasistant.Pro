import { useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';

/**
 * Brouillon de formulaire conservé sur l'appareil.
 * En cas de coupure réseau ou de fermeture accidentelle, le visiteur retrouve
 * sa saisie. Les champs sensibles (consentement, pièce jointe…) sont exclus.
 */
export function useFormDraft<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  options: { exclude?: Array<keyof T & string> } = {},
): { clearDraft: () => void } {
  const storageKey = `lp-brouillon-${key}`;
  const excludeRef = useRef(options.exclude ?? []);
  const restored = useRef(false);

  // Restauration unique au montage du formulaire.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = readStorage<Partial<T> | null>(storageKey, null);
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      if (!excludeRef.current.includes(name as keyof T & string)) {
        form.setValue(name as never, value as never, { shouldDirty: true });
      }
    }
  }, [form, storageKey]);

  // Sauvegarde à chaque modification.
  useEffect(() => {
    const subscription = form.watch((values) => {
      const copy: Record<string, unknown> = { ...values };
      for (const name of excludeRef.current) delete copy[name];
      writeStorage(storageKey, copy);
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  return { clearDraft: () => removeStorage(storageKey) };
}
