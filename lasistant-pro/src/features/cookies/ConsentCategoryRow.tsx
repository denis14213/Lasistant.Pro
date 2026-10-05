import { useId, useState } from 'react';
import { IconBox, ToValidate } from '@/components/ui';
import { Switch } from '@/components/ui/form';
import { IconChevronDown } from '@/components/ui/icons';
import type { ConsentCategory, CookieDefinition } from '@/content/cookies';
import { cn } from '@/lib/cn';

interface ConsentCategoryRowProps {
  category: ConsentCategory;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Liste des cookies dépliable (fenêtre de préférences) ou toujours visible */
  collapsible?: boolean;
}

/**
 * Ligne d'une catégorie de cookies : description, interrupteur et détail des cookies.
 * Partagée par la fenêtre de préférences et la page « Gestion des cookies ».
 */
export function ConsentCategoryRow({
  category,
  checked,
  onChange,
  collapsible = true,
}: ConsentCategoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const titleId = useId();

  return (
    <div className="py-4.5">
      <div className="flex items-center gap-4">
        <IconBox icon={category.icon} tone={category.tone} size="sm" />
        <div className="min-w-0 flex-1">
          <p id={titleId} className="font-semibold">
            {category.title}
          </p>
          <p className="mt-0.5 text-sm text-muted">{category.description}</p>
        </div>
        {category.required ? (
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-success-dark">
            Toujours actifs
          </span>
        ) : (
          <Switch checked={checked} onCheckedChange={onChange} label={category.title} />
        )}
      </div>

      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand"
        >
          {expanded ? 'Masquer le détail' : 'Voir le détail'}
          <IconChevronDown
            className={cn('size-4 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      ) : null}

      <div
        id={detailsId}
        hidden={collapsible && !expanded}
        className="mt-3 overflow-hidden rounded-[14px] border border-line bg-canvas text-[13.5px]"
      >
        <table className="w-full border-collapse" aria-labelledby={titleId}>
          <thead>
            <tr className="text-left text-xs font-semibold tracking-[0.06em] text-muted uppercase">
              <th scope="col" className="px-3.5 py-2.5">
                Nom
              </th>
              <th scope="col" className="px-3.5 py-2.5">
                Finalité
              </th>
              <th scope="col" className="px-3.5 py-2.5">
                Durée
              </th>
            </tr>
          </thead>
          <tbody>
            {category.cookies.map((cookie) => (
              <tr key={cookie.name} className="border-t border-line align-top">
                <td className="px-3.5 py-2.5 font-mono text-[12.5px]">
                  {cookie.pendingName ? <ToValidate>{cookie.name}</ToValidate> : cookie.name}
                </td>
                <td className="px-3.5 py-2.5">{cookie.purpose}</td>
                <td className="px-3.5 py-2.5">
                  <CookieDuration cookie={cookie} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Durée de conservation d'un cookie (mention « à valider » si elle n'est pas confirmée). */
export function CookieDuration({ cookie }: { cookie: CookieDefinition }) {
  if (!cookie.duration) return <ToValidate>à définir</ToValidate>;
  return cookie.durationPending ? <ToValidate>{cookie.duration}</ToValidate> : <>{cookie.duration}</>;
}
