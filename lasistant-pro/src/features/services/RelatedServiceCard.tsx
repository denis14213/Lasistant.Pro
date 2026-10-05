import { Link } from 'react-router';
import { ResponsiveImage } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import type { ImageRef } from '@/types';

interface RelatedServiceCardProps {
  tag: string;
  title: string;
  text: string;
  image: ImageRef;
  to: string;
}

/** Carte horizontale vers un service complémentaire (empilée sur mobile). */
export function RelatedServiceCard({ tag, title, text, image, to }: RelatedServiceCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-raised md:flex-row"
    >
      <div className="h-[220px] shrink-0 overflow-hidden bg-mist md:h-auto md:min-h-[220px] md:w-[42%]">
        <ResponsiveImage
          image={image}
          alt=""
          sizes="(min-width: 768px) 260px, 100vw"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-6 md:p-7">
        <span className="text-[12.5px] font-semibold tracking-[0.13em] text-success uppercase">{tag}</span>
        <h3 className="text-2xl leading-[1.15] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="text-base text-muted">{text}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-2 border-b border-transparent font-semibold text-brand group-hover:border-current">
          Découvrir
          <IconArrowRight
            className="size-[1.1em] transition-transform group-hover:translate-x-[3px]"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
