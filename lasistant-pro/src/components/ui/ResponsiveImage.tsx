import type { ComponentProps } from 'react';
import { resolveImage } from '@/lib/images';
import type { ImageAsset, ImageRef } from '@/types';

interface ResponsiveImageProps extends Omit<
  ComponentProps<'img'>,
  'src' | 'srcSet' | 'width' | 'height' | 'alt'
> {
  image: ImageRef | ImageAsset;
  /** Texte alternatif ; chaîne vide pour une image purement décorative */
  alt?: string;
  /** Largeur d'affichage, pour que le navigateur choisisse la bonne variante */
  sizes?: string;
  /** Image principale visible au chargement (LCP) : chargée en priorité */
  priority?: boolean;
}

/**
 * Image optimisée : variantes WebP (srcset), dimensions déclarées (aucun décalage
 * de mise en page) et chargement différé hors écran (cahier des charges § 11.2).
 */
export function ResponsiveImage({
  image,
  alt,
  sizes = '100vw',
  priority = false,
  ...props
}: ResponsiveImageProps) {
  const asset = typeof image === 'string' ? resolveImage(image, alt) : image;
  return (
    <img
      src={asset.src}
      srcSet={asset.srcSet}
      sizes={asset.srcSet ? sizes : undefined}
      width={asset.width}
      height={asset.height}
      alt={alt ?? asset.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      {...props}
    />
  );
}
