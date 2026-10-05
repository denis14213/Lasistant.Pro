import { useNavigation } from 'react-router';

/**
 * Fine barre de progression en haut de l'écran pendant le chargement d'une page.
 * Elle n'apparaît qu'après un court délai : une navigation instantanée reste invisible.
 */
export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;
  return (
    <div
      role="progressbar"
      aria-label="Chargement de la page"
      className="fixed inset-x-0 top-0 z-[150] h-[3px]"
    >
      <div className="h-full origin-left animate-nav-progress bg-linear-to-r from-brand to-brand-bright" />
    </div>
  );
}
