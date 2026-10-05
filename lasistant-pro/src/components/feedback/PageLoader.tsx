import { Spinner } from '@/components/ui';

/** Indicateur affiché pendant le chargement d'une page (code ou données). */
export function PageLoader({ label = 'Chargement de la page…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <Spinner label={label} />
    </div>
  );
}
