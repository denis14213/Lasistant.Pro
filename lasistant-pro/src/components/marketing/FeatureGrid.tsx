import { FeatureIcon, ToValidate } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { FeatureItem, IconTone } from '@/types';

interface FeatureGridProps {
  items: readonly FeatureItem[];
  columns?: 3 | 4;
  /**
   * Repère de chaque carte :
   * - « icon » quand chaque élément désigne un objet concret (types de logement, étapes du dossier) ;
   * - « number » pour des qualités ou des engagements, que l'on numérote en italique éditorial
   *   plutôt que de leur prêter une icône littérale.
   */
  marker?: 'icon' | 'number';
  /** Teinte unique des icônes de la grille (celle du service présenté) */
  tone?: IconTone;
  className?: string;
}

/** Grille de cartes « caractéristique » : repère, titre et texte court. */
export function FeatureGrid({
  items,
  columns = 4,
  marker = 'number',
  tone = 'brand',
  className,
}: FeatureGridProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2',
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.title}
          className="flex flex-col gap-4 rounded-card border border-line bg-paper p-[30px]"
        >
          {marker === 'icon' && item.icon ? (
            <FeatureIcon icon={item.icon} tone={tone} />
          ) : (
            <span className="accent text-[44px] leading-none text-brand" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <h3 className="text-[21px] leading-[1.2] font-semibold tracking-[-0.02em]">{item.title}</h3>
          <p className="text-[15.5px] text-muted">{item.text}</p>
          {item.pending ? <ToValidate className="w-fit text-[12.5px]">{item.pending}</ToValidate> : null}
        </li>
      ))}
    </ul>
  );
}
