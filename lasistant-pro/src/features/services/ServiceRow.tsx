import { ButtonLink, Pill, ResponsiveImage, TextLink, TickList } from '@/components/ui';
import { IconArrowRight, IconInfo } from '@/components/ui/icons';
import { servicePath } from '@/config/routes';
import { MEDICAL_DISCLAIMER } from '@/content/brand';
import { cn } from '@/lib/cn';
import type { ImageRef, Service } from '@/types';

interface ServiceRowProps {
  service: Service;
  position: number;
  /** Visuel propre à la page « Nos services » (sinon celui du service) */
  image?: ImageRef;
  /** Alterne l'image à droite et à gauche */
  reversed?: boolean;
}

/** Présentation détaillée d'un service, en alternance texte / image. */
export function ServiceRow({ service, position, image, reversed = false }: ServiceRowProps) {
  const titleId = `service-${service.slug}`;
  return (
    <article
      aria-labelledby={titleId}
      className="grid grid-cols-1 items-center gap-12 border-t border-line py-12 first:border-t-0 first:pt-0 md:py-18 lg:grid-cols-2 lg:gap-22"
    >
      <div
        className={cn(
          'relative h-[340px] overflow-hidden rounded-[30px] bg-mist md:h-[560px]',
          reversed && 'lg:order-2',
        )}
      >
        <ResponsiveImage
          image={image ?? service.image}
          alt={service.imageAlt}
          sizes="(min-width: 1024px) 600px, 100vw"
          className="size-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-5.5">
        <span className="accent text-[64px] leading-none text-brand" aria-hidden>
          {String(position).padStart(2, '0')}
        </span>
        <span className="text-[12.5px] font-semibold tracking-[0.13em] text-success uppercase">
          {service.subtitle}
        </span>
        <h2
          id={titleId}
          className="text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.06] font-semibold tracking-[-0.032em] max-[359px]:text-[min(2rem,9.3vw)]"
        >
          {service.title}
        </h2>
        <p className="text-lg leading-[1.6] text-muted">{service.description}</p>
        <TickList items={service.details} />
        {service.audiences.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Publics concernés">
            {service.audiences.map((audience) => (
              <li key={audience.label}>
                <Pill>{audience.label}</Pill>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-5">
          <ButtonLink to={service.ctaHref} trailingIcon={<IconArrowRight />}>
            {service.ctaLabel}
          </ButtonLink>
          <TextLink to={servicePath(service.slug)} arrow>
            Découvrir le service<span className="sr-only"> {service.title}</span>
          </TextLink>
        </div>
        {service.showMedicalDisclaimer ? (
          <p className="flex items-center gap-2 text-[13.5px] leading-[1.45] text-muted">
            <IconInfo className="size-4 shrink-0" aria-hidden />
            {MEDICAL_DISCLAIMER}
          </p>
        ) : null}
      </div>
    </article>
  );
}
