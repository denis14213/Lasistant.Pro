import { images, type ImageKey } from '@/assets/images';
import { isoDaysAgo } from '@/lib/dates';
import type { MediaItem } from '@/types';

/**
 * Médiathèque de démonstration : les photos d'illustration du site.
 * Deux images n'ont volontairement pas de texte alternatif, pour illustrer l'alerte.
 */

const USAGE: Partial<Record<ImageKey, string[]>> = {
  consultation: ['Accueil (héros)'],
  medicalTeam: ['Assistance médicale', 'Nos services'],
  seniorCare: ['Accueil (services)', 'Accompagnement'],
  gardenWalk: ['Accueil (services)', 'Accompagnement'],
  livingRoom: ['Accueil (héros)', 'Logement'],
  apartment: ['Accueil (services)'],
  student: ['Accueil (publics)'],
  documents: ['Espace infos'],
};

const MISSING_ALT: ImageKey[] = ['supportiveHands', 'airplaneWing'];

/** Poids approximatifs des fichiers optimisés (WebP). */
const SIZES: Record<ImageKey, number> = {
  consultation: 62_280,
  medicalTeam: 66_550,
  seniorCare: 76_444,
  gardenWalk: 441_954,
  supportiveHands: 64_364,
  livingRoom: 98_096,
  apartment: 88_704,
  bedroom: 160_556,
  brightApartment: 121_366,
  student: 83_336,
  studyDesk: 73_984,
  airportTraveler: 69_666,
  airplaneWing: 40_464,
  meeting: 75_652,
  documents: 72_646,
  houseKeys: 43_216,
};

export function createMediaSeed(now = new Date()): MediaItem[] {
  return (Object.keys(images) as ImageKey[]).map((key, index) => {
    const asset = images[key];
    const fileName = `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}.webp`;
    return {
      id: `media-${index + 1}`,
      fileName,
      kind: 'image',
      image: key,
      title: asset.alt.split(' ').slice(0, 4).join(' '),
      altText: MISSING_ALT.includes(key) ? '' : asset.alt,
      sizeBytes: SIZES[key],
      width: asset.width,
      height: asset.height,
      uploadedBy: index % 3 === 0 ? 'Admin LASISTANT' : 'Éditrice contenus',
      createdAt: isoDaysAgo(index + 1, '10:00', now),
      usedOn: USAGE[key] ?? [],
      isPrivate: false,
      rightsConfirmed: false,
    };
  });
}
