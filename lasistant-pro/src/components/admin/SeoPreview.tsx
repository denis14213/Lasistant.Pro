import { cn } from '@/lib/cn';

/** Compteur de caractères « 54 / 60 » : vert dans la plage recommandée, rouge au-delà. */
export function CharCount({ value, max, min = 1 }: { value: string; max: number; min?: number }) {
  const length = value.trim().length;
  const ok = length >= min && length <= max;
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        ok ? 'text-success' : length > max ? 'text-danger' : 'text-muted',
      )}
      aria-live="polite"
    >
      {length} / {max}
      <span className="sr-only"> caractères</span>
    </span>
  );
}

interface SerpPreviewProps {
  /** Adresse affichée (« lasistant.pro › services › assistance-medicale ») */
  url: string;
  title: string;
  description: string;
}

/** Aperçu de la page dans les résultats d'un moteur de recherche. */
export function SerpPreview({ url, title, description }: SerpPreviewProps) {
  return (
    <div
      aria-label="Aperçu dans les résultats de recherche"
      role="img"
      className="flex flex-col gap-1 rounded-xl border border-line bg-white px-4.5 py-4"
    >
      <span className="truncate text-[13px] text-serp-url">{url}</span>
      <span className="line-clamp-1 text-lg leading-[1.3] text-serp-title">
        {title || 'Titre de la page'}
      </span>
      <span className="line-clamp-2 text-[13.5px] leading-normal text-serp-text">
        {description || 'Ajoutez une description pour donner envie de cliquer.'}
      </span>
    </div>
  );
}
