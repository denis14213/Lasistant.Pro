import type { ReactNode } from 'react';
import { ResponsiveImage } from '@/components/ui';
import { IconWeightScope } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { ImageRef } from '@/types';

const FLOAT_TONES = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  gold: 'bg-gold-soft text-gold-deep',
} as const;

interface HeroMediaProps {
  image: ImageRef;
  /** Texte alternatif ; par défaut, celui de la photo affichée */
  alt?: string;
  /** Cadrage de la photo (ex. « 60% center ») */
  objectPosition?: string;
  /** Pastille flottante posée sur le visuel */
  float?: { icon: ReactNode; title: string; text: ReactNode; tone?: keyof typeof FLOAT_TONES };
}

/**
 * Visuel principal d'une page intérieure : arche caractéristique de la marque
 * et pastille d'information flottante. Image prioritaire (premier affichage).
 */
export function HeroMedia({ image, alt, objectPosition, float }: HeroMediaProps) {
  return (
    <>
      <div className="relative z-[1] h-[340px] overflow-hidden rounded-[150px_22px_22px_22px] bg-mist shadow-float md:h-[540px] md:rounded-[220px_30px_30px_30px]">
        <ResponsiveImage
          image={image}
          alt={alt}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="size-full object-cover"
          style={objectPosition ? { objectPosition } : undefined}
        />
      </div>
      {float ? (
        <div className="absolute right-3 bottom-3 left-3 z-[3] flex items-center gap-3.5 rounded-[20px] bg-white px-4.5 py-4 shadow-raised md:right-auto md:bottom-10 md:left-6 md:max-w-[300px] lg:-left-9">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-6',
              FLOAT_TONES[float.tone ?? 'brand'],
            )}
            aria-hidden
          >
            {/* Encart posé sur la photo : icône d'identité, dessin « duotone ». */}
            <IconWeightScope weight="duotone">{float.icon}</IconWeightScope>
          </span>
          <p className="text-sm leading-[1.4] font-medium">
            <strong className="block text-[15px] font-semibold">{float.title}</strong>
            {float.text}
          </p>
        </div>
      ) : null}
    </>
  );
}
