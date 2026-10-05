import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { Button, Dialog } from '@/components/ui';

/**
 * Protection des modifications non enregistrées :
 * - navigation dans l'application : confirmation avant de quitter la page ;
 * - fermeture ou rechargement de l'onglet : avertissement du navigateur.
 */
interface UnsavedChangesGuardProps {
  when: boolean;
  /** Bloque aussi les changements de paramètres d'URL (page dont la sélection est dans l'URL) */
  includeSearch?: boolean;
}

export function UnsavedChangesGuard({ when, includeSearch = false }: UnsavedChangesGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when &&
      (currentLocation.pathname !== nextLocation.pathname ||
        (includeSearch && currentLocation.search !== nextLocation.search)),
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  return (
    <Dialog
      open={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      role="alertdialog"
      size="sm"
      title="Quitter sans enregistrer ?"
      description="Vos modifications n’ont pas été enregistrées. Si vous quittez cette page, elles seront perdues."
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={() => blocker.reset?.()}>
            Rester sur la page
          </Button>
          <Button variant="danger" shape="rounded" onClick={() => blocker.proceed?.()}>
            Quitter sans enregistrer
          </Button>
        </>
      }
    />
  );
}
