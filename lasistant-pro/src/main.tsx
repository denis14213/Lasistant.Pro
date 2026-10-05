import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource-variable/instrument-sans/wght-italic.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

/**
 * Point d'entrée de l'application.
 */

// Après la mise en ligne d'une nouvelle version, un ancien onglet peut réclamer des fichiers
// qui n'existent plus : on recharge alors la page une seule fois pour récupérer la version à jour.
const RELOAD_FLAG = 'lp-rechargement-version';
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => sessionStorage.removeItem(RELOAD_FLAG));

const container = document.getElementById('root');
if (!container) throw new Error('Élément #root introuvable dans index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
