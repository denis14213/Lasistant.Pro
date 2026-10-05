/**
 * Questions fréquentes.
 */

export interface FaqCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  /** Mention « à valider » affichée tant que le propriétaire n'a pas confirmé la réponse */
  pendingNote: string | null;
  sortOrder: number;
}
