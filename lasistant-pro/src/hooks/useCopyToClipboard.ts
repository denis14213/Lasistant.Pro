import { useCallback } from 'react';

/** Copie un texte dans le presse-papiers ; renvoie false si le navigateur refuse. */
export function useCopyToClipboard(): (text: string) => Promise<boolean> {
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);
}
