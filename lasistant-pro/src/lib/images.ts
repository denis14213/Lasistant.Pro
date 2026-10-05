import { images, type ImageKey } from '@/assets/images';
import type { ImageAsset, ImageRef } from '@/types';

/**
 * Résolution des références d'images.
 * Une référence est soit une clé du registre local (phase statique),
 * soit une URL (fichier téléversé ou stockage distant en phase base de données).
 */

export function isImageKey(value: string): value is ImageKey {
  return Object.hasOwn(images, value);
}

/** Renvoie l'image prête à l'affichage ; le texte alternatif fourni remplace celui par défaut. */
export function resolveImage(ref: ImageRef, alt?: string): ImageAsset {
  if (isImageKey(ref)) {
    const asset = images[ref];
    return alt === undefined ? asset : { ...asset, alt };
  }
  return { src: ref, width: 1200, height: 800, alt: alt ?? '' };
}

/** Liste des clés d'images disponibles (sélecteurs du back-office). */
export const imageKeys = Object.keys(images) as ImageKey[];
