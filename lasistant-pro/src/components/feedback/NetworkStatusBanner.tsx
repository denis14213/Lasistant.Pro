import { useEffect, useState } from 'react';
import { IconOffline, IconOnline } from '@/components/ui/icons';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/cn';

/**
 * Bandeau de perte de connexion, puis confirmation du retour du réseau.
 * Les formulaires conservent la saisie : le visiteur ne perd rien.
 */
export function NetworkStatusBanner({ context = 'public' }: { context?: 'public' | 'admin' }) {
  const online = useOnlineStatus();
  const [previousOnline, setPreviousOnline] = useState(online);
  const [showRestored, setShowRestored] = useState(false);

  // Changement d'état du réseau : le message « Connexion rétablie » suit un retour en ligne.
  if (online !== previousOnline) {
    setPreviousOnline(online);
    setShowRestored(online);
  }

  // Le message de retour du réseau disparaît après quelques secondes.
  useEffect(() => {
    if (!showRestored) return;
    const timer = window.setTimeout(() => setShowRestored(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showRestored]);

  if (online && !showRestored) return null;

  return (
    <div
      role="status"
      className={cn(
        'fixed inset-x-0 top-0 z-[130] flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 text-center text-sm font-medium text-white',
        online ? 'bg-success' : 'bg-ink-soft',
      )}
    >
      {online ? (
        <IconOnline className="size-4" aria-hidden />
      ) : (
        <IconOffline className="size-4" aria-hidden />
      )}
      {online
        ? 'Connexion rétablie. Vous pouvez reprendre là où vous en étiez.'
        : context === 'admin'
          ? 'Connexion perdue. Vos modifications sont conservées et seront enregistrées au retour du réseau.'
          : 'Connexion perdue. Votre saisie est conservée sur cet appareil, nous réessayons automatiquement.'}
    </div>
  );
}
