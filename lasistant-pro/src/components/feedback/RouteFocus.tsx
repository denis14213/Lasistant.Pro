import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * Accessibilité de la navigation : après un changement de page, le focus est placé
 * sur le contenu principal pour que les lecteurs d'écran annoncent la nouvelle page.
 * Les ancres (« #recherche ») sont respectées : le défilement est alors géré par le routeur.
 */
export function RouteFocus({ targetId = 'contenu' }: { targetId?: string }) {
  const { pathname, hash } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (hash) return;
    document.getElementById(targetId)?.focus({ preventScroll: true });
  }, [pathname, hash, targetId]);

  return null;
}

/** Lien d'évitement : permet d'atteindre directement le contenu au clavier. */
export function SkipLink({ targetId = 'contenu' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-full bg-ink px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]"
    >
      Aller au contenu
    </a>
  );
}
