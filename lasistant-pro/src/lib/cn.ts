import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Fusion intelligente de classes Tailwind.
 * On déclare nos tailles de texte personnalisées (« text-h2 », « text-lead »…)
 * pour que tailwind-merge ne les confonde pas avec les couleurs (« text-muted »…).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'lead', 'md'] }],
      shadow: [{ shadow: ['soft', 'raised', 'float', 'cta', 'focus', 'invalid'] }],
      rounded: [{ rounded: ['field', 'box', 'card', 'panel'] }],
    },
  },
});

/** Concatène des classes conditionnelles puis résout les conflits Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
