import type { ReactNode } from 'react';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { AccentTitle, Breadcrumbs, Container, Eyebrow, Lead, type BreadcrumbItem } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { AccentText } from '@/types';

interface PageHeroProps {
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: AccentText | string;
  lead: ReactNode;
  /** Boutons d'action principaux (pleine largeur sur mobile) */
  actions?: ReactNode;
  /** Mention complémentaire affichée sous les actions */
  note?: ReactNode;
  /** Colonne de droite : visuel, carte d'orientation… */
  aside?: ReactNode;
  className?: string;
}

/**
 * En-tête des pages intérieures : fil d'Ariane, sur-titre, titre H1, chapô et actions,
 * avec la forme de la marque en arrière-plan.
 */
export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  actions,
  note,
  aside,
  className,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby="titre-page"
      className={cn('relative overflow-hidden pt-4 pb-14 md:pt-9 md:pb-24', className)}
    >
      {/* Sur mobile, l'arc reste un accent dans le coin : il ne doit pas croiser le titre. */}
      <BrandSwoosh className="absolute -top-16 -right-20 z-0 size-[220px] md:-top-15 md:-right-35 md:size-[560px]" />
      <Container className="relative">
        <Breadcrumbs items={breadcrumbs} className="mb-6 md:mb-12" />
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-12',
            aside && 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-18',
          )}
        >
          <div className="relative z-[2] flex flex-col gap-7">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-h1 font-semibold">
              {typeof title === 'string' ? title : <AccentTitle value={title} />}
            </h1>
            <Lead className="max-w-[560px]">{lead}</Lead>
            {actions ? <div className="flex flex-wrap gap-3 max-md:*:w-full">{actions}</div> : null}
            {note}
          </div>
          {aside ? <div className="relative">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
