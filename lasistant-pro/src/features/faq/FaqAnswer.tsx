import { ToValidate } from '@/components/ui';
import type { FaqItem } from '@/types';

/** Réponse d'une question fréquente, suivie de la mention « à valider » éventuelle. */
export function FaqAnswer({ item }: { item: FaqItem }) {
  return (
    <>
      <p>{item.answer}</p>
      {item.pendingNote ? (
        <p className="mt-3">
          <ToValidate>{item.pendingNote}</ToValidate>
        </p>
      ) : null}
    </>
  );
}
