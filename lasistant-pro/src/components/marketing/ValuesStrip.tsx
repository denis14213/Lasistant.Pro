import { BRAND_VALUES } from '@/content/brand';
import { cn } from '@/lib/cn';

/**
 * Bandeau des quatre valeurs de la marque, séparées par des filets verticaux.
 * Des valeurs ne se dessinent pas : elles sont numérotées en italique éditorial, comme les
 * étapes du parcours, plutôt qu'illustrées par une icône littérale (bulle, bouclier, canapé…).
 */
export function ValuesStrip() {
  return (
    <ul className="grid grid-cols-1 border-t border-line md:grid-cols-2 lg:grid-cols-4">
      {BRAND_VALUES.map((value, index) => (
        <li
          key={value.id}
          className={cn(
            'flex flex-col gap-3.5 border-b border-line py-7 last:border-b-0 md:border-b-0 md:pt-9 md:pr-8 md:pb-1',
            // Filets verticaux : devant la 2e colonne sur tablette, devant chaque colonne sauf la 1re sur ordinateur.
            index % 2 === 1 && 'md:border-l md:pl-8',
            index % 4 === 2 && 'lg:border-l lg:pl-8',
          )}
        >
          <span className="accent text-[40px] leading-none text-brand" aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-[21px] font-semibold tracking-[-0.02em]">{value.title}</h3>
          <p className="text-[15.5px] text-muted">{value.text}</p>
        </li>
      ))}
    </ul>
  );
}
