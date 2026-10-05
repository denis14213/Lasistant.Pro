import { Link } from 'react-router';
import { ResponsiveImage, TickList } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { servicePath } from '@/config/routes';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  /** Rang d'affichage (01, 02, 03…) */
  position: number;
}

/** Carte de service de la page d'accueil : visuel, points forts et lien vers la page dédiée. */
export function ServiceCard({ service, position }: ServiceCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-raised">
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <ResponsiveImage
          image={service.image}
          alt={service.imageAlt}
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute top-4.5 left-4.5 inline-flex h-8 items-center rounded-full bg-white/94 px-[13px] text-[12.5px] font-bold tracking-[0.08em] text-ink">
          {String(position).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-6 pt-7 pb-6.5 md:px-7">
        <span className="text-[12.5px] font-semibold tracking-[0.13em] text-success uppercase">
          {service.subtitle}
        </span>
        <h3 className="text-h3 font-semibold">{service.title}</h3>
        <p className="text-base text-muted">{service.summary}</p>
        <TickList items={service.highlights} />
        <Link
          to={servicePath(service.slug)}
          className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5 font-semibold text-brand"
        >
          <span className="border-b border-transparent transition-colors group-hover:border-current">
            Découvrir le service<span className="sr-only"> {service.title}</span>
          </span>
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-[background-color,rotate] duration-300 group-hover:-rotate-45 group-hover:bg-brand"
            aria-hidden
          >
            <IconArrowRight className="size-4.5" />
          </span>
        </Link>
      </div>
    </article>
  );
}
