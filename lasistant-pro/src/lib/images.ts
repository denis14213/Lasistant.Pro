import { images, LEGACY_IMAGE_KEYS, type ImageKey } from '@/assets/images';
import type { ImageAsset, ImageRef } from '@/types';

/**
 * Résolution des références d'images.
 * Une référence est soit une clé du registre des photos du site, soit l'URL d'un fichier
 * téléversé dans la médiathèque (stockage Supabase).
 */

export function isImageKey(value: string): value is ImageKey {
  return Object.hasOwn(images, value);
}

/** Clé du registre correspondant à la référence (anciennes clés comprises), ou null pour une URL. */
export function imageKeyOf(ref: ImageRef): ImageKey | null {
  if (isImageKey(ref)) return ref;
  return Object.hasOwn(LEGACY_IMAGE_KEYS, ref) ? (LEGACY_IMAGE_KEYS[ref] ?? null) : null;
}

/** Renvoie l'image prête à l'affichage ; le texte alternatif fourni remplace celui par défaut. */
export function resolveImage(ref: ImageRef, alt?: string): ImageAsset {
  const key = imageKeyOf(ref);
  if (key) {
    const asset = images[key];
    return alt === undefined ? asset : { ...asset, alt };
  }
  return { src: ref, width: 1200, height: 800, alt: alt ?? '' };
}

/** Liste des clés d'images disponibles (sélecteurs du back-office). */
export const imageKeys = Object.keys(images) as ImageKey[];
