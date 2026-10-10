import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetDatabase } from '@/api/mock/database';
import { queryClient } from '@/app/query-client';

/**
 * Préparation commune des tests.
 * Chaque test repart d'un état neuf : rendu démonté, stockage vidé, données de démonstration
 * régénérées et cache des requêtes effacé. Les compléments du navigateur ne s'appliquent
 * qu'aux tests d'interface (environnement jsdom).
 */

const isBrowserLike = typeof window !== 'undefined';

if (isBrowserLike) {
  // Le premier affichage d'une page charge ses modules à la demande : on laisse plus de temps
  // que la seconde par défaut, pour des tests stables sur une machine chargée.
  configure({ asyncUtilTimeout: 5000 });

  // jsdom ne gère pas toutes les API du navigateur utilisées par l'interface.
  if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
}

afterEach(() => {
  if (isBrowserLike) {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
  }
  resetDatabase();
  queryClient.clear();
});
