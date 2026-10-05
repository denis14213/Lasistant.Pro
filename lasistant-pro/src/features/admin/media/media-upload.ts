import { mediaRepository } from '@/api';
import type { MediaItem } from '@/types';

/**
 * Téléversement des fichiers de la médiathèque.
 * Les images sont redimensionnées (1 600 px maximum) et converties en WebP dans le navigateur :
 * plus légères pour le site, et assez compactes pour être conservées en phase statique.
 * Phase 2 : envoi vers le stockage Supabase, l'optimisation restant identique.
 */

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 1600;

interface OptimizedImage {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

async function optimizeImage(file: File): Promise<OptimizedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Conversion impossible'))),
      'image/webp',
      0.82,
    ),
  );
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Lecture impossible'));
    reader.readAsDataURL(blob);
  });
  return { dataUrl, width, height, sizeBytes: blob.size };
}

/** Message d'erreur si le fichier est refusé, sinon null. */
export function checkUpload(file: File, kind: 'image' | 'document'): string | null {
  const allowed = kind === 'image' ? IMAGE_TYPES : DOCUMENT_TYPES;
  if (!allowed.includes(file.type)) {
    return `${file.name} : format non accepté (${kind === 'image' ? 'JPG, PNG ou WebP' : 'PDF, JPG ou PNG'} uniquement).`;
  }
  if (file.size > MAX_UPLOAD_BYTES) return `${file.name} : le fichier dépasse 10 Mo.`;
  return null;
}

/** Ajoute une image publique à la médiathèque (optimisée). */
export async function uploadImage(file: File, uploadedBy: string): Promise<MediaItem> {
  const optimized = await optimizeImage(file);
  return mediaRepository.add({
    fileName: file.name.replace(/\.[a-z0-9]+$/i, '.webp'),
    sizeBytes: optimized.sizeBytes,
    url: optimized.dataUrl,
    width: optimized.width,
    height: optimized.height,
    uploadedBy,
    isPrivate: false,
  });
}

/**
 * Ajoute un document privé. Phase statique : seule la fiche est créée (le contenu n'est pas
 * conservé dans le navigateur) ; phase 2 : stockage privé, accessible aux seuls rôles autorisés.
 */
export async function uploadPrivateDocument(file: File, uploadedBy: string): Promise<MediaItem> {
  return mediaRepository.add({
    fileName: file.name,
    sizeBytes: file.size,
    url: '',
    width: null,
    height: null,
    uploadedBy,
    isPrivate: true,
  });
}
