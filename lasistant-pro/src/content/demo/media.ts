import { images, type ImageKey } from '@/assets/images';
import { isoDaysAgo } from '@/lib/dates';
import type { MediaItem } from '@/types';

/**
 * Médiathèque d'origine : les photos du site (accompagnements, équipe, identité et logements).
 */

const USAGE: Partial<Record<ImageKey, string[]>> = {
  teamMeeting: ['Accueil (héros)', 'Échange découverte'],
  airportWelcome: ['Accueil (sur le terrain)', 'Accompagnement', 'Nos services'],
  eyeExam: ['Accueil (services)', 'Assistance médicale'],
  eyeExamFollowUp: ['Accompagnement (personnes âgées)'],
  doctorConsultation: ['Accueil (engagement)'],
  familyConsultation: ['Accueil (publics)', 'Assistance médicale', 'Nos services'],
  careSession: ['Assistance médicale (à domicile)'],
  hospitalVisit: ['Accueil (services)', 'Accompagnement'],
  welcomeKit: ['Accueil (sur le terrain)', 'À propos'],
  teamVehicle: ['Accueil (sur le terrain)'],
  teamVehicleDoor: ['À propos', 'Accompagnement'],
  brandKit: ['À propos'],
  livingRoom: ['Accueil (héros)', 'Logement'],
  apartment: ['Accueil (services)'],
  bedroom: ['Logement', 'Assistance médicale'],
  brightApartment: ['Nos services'],
  studyDesk: ['Logement', 'Espace infos'],
};

/** Titre court de chaque photo dans la médiathèque. */
const TITLES: Record<ImageKey, string> = {
  teamMeeting: 'Échange avec une cliente',
  airportWelcome: 'Accueil à l’aéroport',
  eyeExam: 'Examen ophtalmologique',
  eyeExamFollowUp: 'Rendez-vous de suivi',
  doctorConsultation: 'Consultation médicale',
  familyConsultation: 'Consultation en famille',
  careSession: 'Séance de soins',
  hospitalVisit: 'Visite à l’hôpital',
  welcomeKit: 'Kit de bienvenue',
  teamVehicle: 'Véhicule LASISTANT.PRO',
  teamVehicleDoor: 'Portière du véhicule LASISTANT.PRO',
  brandKit: 'Objets aux couleurs de l’agence',
  livingRoom: 'Salon d’un logement meublé',
  apartment: 'Appartement meublé',
  bedroom: 'Chambre lumineuse',
  brightApartment: 'Salon lumineux',
  studyDesk: 'Bureau d’étudiant',
  houseKeys: 'Clés d’un logement',
};

/** Poids des fichiers optimisés (WebP, grande largeur). */
const SIZES: Record<ImageKey, number> = {
  teamMeeting: 63_140,
  airportWelcome: 51_286,
  eyeExam: 42_772,
  eyeExamFollowUp: 32_346,
  doctorConsultation: 67_292,
  familyConsultation: 35_700,
  careSession: 15_032,
  hospitalVisit: 51_580,
  welcomeKit: 33_364,
  teamVehicle: 54_092,
  teamVehicleDoor: 37_824,
  brandKit: 25_280,
  livingRoom: 98_096,
  apartment: 88_704,
  bedroom: 160_556,
  brightApartment: 121_366,
  studyDesk: 73_984,
  houseKeys: 43_216,
};

/** Photos de personnes : droits à l'image à confirmer avant publication. */
const PEOPLE: ImageKey[] = [
  'teamMeeting',
  'airportWelcome',
  'eyeExam',
  'eyeExamFollowUp',
  'doctorConsultation',
  'familyConsultation',
  'careSession',
  'hospitalVisit',
  'welcomeKit',
  'teamVehicle',
];

export function createMediaSeed(now = new Date()): MediaItem[] {
  return (Object.keys(images) as ImageKey[]).map((key, index) => {
    const asset = images[key];
    const fileName = `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}.webp`;
    return {
      id: `media-${index + 1}`,
      fileName,
      kind: 'image',
      image: key,
      title: TITLES[key],
      altText: asset.alt,
      sizeBytes: SIZES[key],
      width: asset.width,
      height: asset.height,
      uploadedBy: 'LASISTANT.PRO',
      createdAt: isoDaysAgo(index + 1, '10:00', now),
      usedOn: USAGE[key] ?? [],
      isPrivate: false,
      rightsConfirmed: !PEOPLE.includes(key),
    };
  });
}
