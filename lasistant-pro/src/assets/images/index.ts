// Registre des photos du site. Chaque photo existe en deux largeurs (srcset) au format WebP.
// Photos réelles de LASISTANT.PRO (accompagnements, équipe, identité) et photos de logements.
import type { ImageAsset } from '@/types/media';

import airportWelcomeLarge from './airport-welcome-1159.webp';
import airportWelcomeSmall from './airport-welcome-720.webp';
import brandKitLarge from './brand-kit-720.webp';
import brandKitSmall from './brand-kit-480.webp';
import careSessionLarge from './care-session-720.webp';
import doctorConsultationLarge from './doctor-consultation-1168.webp';
import doctorConsultationSmall from './doctor-consultation-480.webp';
import eyeExamLarge from './eye-exam-720.webp';
import eyeExamSmall from './eye-exam-480.webp';
import eyeExamFollowUpLarge from './eye-exam-follow-up-720.webp';
import eyeExamFollowUpSmall from './eye-exam-follow-up-480.webp';
import familyConsultationLarge from './family-consultation-720.webp';
import familyConsultationSmall from './family-consultation-480.webp';
import hospitalVisitLarge from './hospital-visit-1200.webp';
import hospitalVisitSmall from './hospital-visit-480.webp';
import teamMeetingLarge from './team-meeting-1400.webp';
import teamMeetingSmall from './team-meeting-720.webp';
import teamVehicleLarge from './team-vehicle-1400.webp';
import teamVehicleSmall from './team-vehicle-720.webp';
import teamVehicleDoorLarge from './team-vehicle-door-700.webp';
import teamVehicleDoorSmall from './team-vehicle-door-480.webp';
import welcomeKitLarge from './welcome-kit-720.webp';
import welcomeKitSmall from './welcome-kit-480.webp';
import livingRoomLarge from './living-room-1400.webp';
import livingRoomSmall from './living-room-720.webp';
import apartmentLarge from './apartment-1400.webp';
import apartmentSmall from './apartment-720.webp';
import bedroomLarge from './bedroom-1400.webp';
import bedroomSmall from './bedroom-720.webp';
import brightApartmentLarge from './bright-apartment-1400.webp';
import brightApartmentSmall from './bright-apartment-720.webp';
import studyDeskLarge from './study-desk-1400.webp';
import studyDeskSmall from './study-desk-720.webp';
import houseKeysLarge from './house-keys-1400.webp';
import houseKeysSmall from './house-keys-720.webp';

/** Registre des photos du site (texte alternatif par défaut inclus). */
export const images = {
  // --- Accompagnements et équipe (photos de LASISTANT.PRO) ---------------------------------
  teamMeeting: {
    src: teamMeetingLarge,
    srcSet: `${teamMeetingSmall} 720w, ${teamMeetingLarge} 1400w`,
    width: 1400,
    height: 998,
    alt: 'Un membre de l’équipe LASISTANT.PRO, badge au logo de l’agence, échange avec une cliente',
  },
  airportWelcome: {
    src: airportWelcomeLarge,
    srcSet: `${airportWelcomeSmall} 720w, ${airportWelcomeLarge} 1159w`,
    width: 1159,
    height: 869,
    alt: 'Arrivée de clientes accompagnées par LASISTANT.PRO dans le hall de l’aéroport',
  },
  eyeExam: {
    src: eyeExamLarge,
    srcSet: `${eyeExamSmall} 480w, ${eyeExamLarge} 720w`,
    width: 720,
    height: 900,
    alt: 'Une patiente accompagnée par LASISTANT.PRO pendant un examen ophtalmologique',
  },
  eyeExamFollowUp: {
    src: eyeExamFollowUpLarge,
    srcSet: `${eyeExamFollowUpSmall} 480w, ${eyeExamFollowUpLarge} 720w`,
    width: 720,
    height: 900,
    alt: 'Un patient examiné par un ophtalmologue lors d’un rendez-vous organisé par LASISTANT.PRO',
  },
  doctorConsultation: {
    src: doctorConsultationLarge,
    srcSet: `${doctorConsultationSmall} 480w, ${doctorConsultationLarge} 1168w`,
    width: 1168,
    height: 1460,
    alt: 'Une patiente expose sa situation à un médecin lors d’une consultation',
  },
  familyConsultation: {
    src: familyConsultationLarge,
    srcSet: `${familyConsultationSmall} 480w, ${familyConsultationLarge} 720w`,
    width: 720,
    height: 900,
    alt: 'Une patiente et sa proche échangent avec un médecin pendant une consultation',
  },
  careSession: {
    src: careSessionLarge,
    width: 720,
    height: 720,
    alt: 'Un soignant prend en charge un patient lors d’un rendez-vous médical',
  },
  hospitalVisit: {
    src: hospitalVisitLarge,
    srcSet: `${hospitalVisitSmall} 480w, ${hospitalVisitLarge} 1200w`,
    width: 1200,
    height: 1440,
    alt: 'Un accompagnateur LASISTANT.PRO au chevet d’une patiente hospitalisée',
  },
  welcomeKit: {
    src: welcomeKitLarge,
    srcSet: `${welcomeKitSmall} 480w, ${welcomeKitLarge} 720w`,
    width: 720,
    height: 900,
    alt: 'Kit de bienvenue LASISTANT.PRO posé dans le hall de l’hôtel, à côté d’une valise',
  },
  teamVehicle: {
    src: teamVehicleLarge,
    srcSet: `${teamVehicleSmall} 720w, ${teamVehicleLarge} 1400w`,
    width: 1400,
    height: 574,
    alt: 'Véhicule identifié au logo de LASISTANT.PRO pour les déplacements des clients',
    // Le logo est sur la portière, à gauche : il reste visible en format carré comme en bandeau.
    focus: '20% 60%',
  },
  // Même photo, cadrée sur la portière : pour les emplacements verticaux.
  teamVehicleDoor: {
    src: teamVehicleDoorLarge,
    srcSet: `${teamVehicleDoorSmall} 480w, ${teamVehicleDoorLarge} 700w`,
    width: 700,
    height: 640,
    alt: 'Portière du véhicule LASISTANT.PRO, aux couleurs de l’agence',
  },
  brandKit: {
    src: brandKitLarge,
    srcSet: `${brandKitSmall} 480w, ${brandKitLarge} 720w`,
    width: 720,
    height: 900,
    alt: 'Sac, gourdes, stylos et carnet aux couleurs de LASISTANT.PRO',
  },

  // --- Logements ---------------------------------------------------------------------------
  livingRoom: {
    src: livingRoomLarge,
    srcSet: `${livingRoomSmall} 720w, ${livingRoomLarge} 1400w`,
    width: 1400,
    height: 934,
    alt: 'Salon lumineux d’un logement meublé',
  },
  apartment: {
    src: apartmentLarge,
    srcSet: `${apartmentSmall} 720w, ${apartmentLarge} 1400w`,
    width: 1400,
    height: 934,
    alt: 'Appartement meublé et lumineux',
  },
  bedroom: {
    src: bedroomLarge,
    srcSet: `${bedroomSmall} 720w, ${bedroomLarge} 1400w`,
    width: 1400,
    height: 948,
    alt: 'Chambre confortable et lumineuse',
  },
  brightApartment: {
    src: brightApartmentLarge,
    srcSet: `${brightApartmentSmall} 720w, ${brightApartmentLarge} 1400w`,
    width: 1400,
    height: 1042,
    alt: 'Salon d’appartement lumineux avec des plantes',
  },
  studyDesk: {
    src: studyDeskLarge,
    srcSet: `${studyDeskSmall} 720w, ${studyDeskLarge} 1400w`,
    width: 1400,
    height: 933,
    alt: 'Bureau d’étudiant avec carnet, ordinateur et café',
  },
  houseKeys: {
    src: houseKeysLarge,
    srcSet: `${houseKeysSmall} 720w, ${houseKeysLarge} 1400w`,
    width: 1400,
    height: 1051,
    alt: 'Clés posées devant une maquette de maison',
  },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

/**
 * Anciennes clés (photos d'illustration remplacées par les photos de LASISTANT.PRO) :
 * une sauvegarde ou un contenu qui y fait encore référence affiche la photo équivalente.
 */
export const LEGACY_IMAGE_KEYS: Readonly<Record<string, ImageKey>> = {
  consultation: 'teamMeeting',
  medicalTeam: 'familyConsultation',
  seniorCare: 'eyeExam',
  gardenWalk: 'hospitalVisit',
  supportiveHands: 'doctorConsultation',
  student: 'airportWelcome',
  airportTraveler: 'airportWelcome',
  airplaneWing: 'teamVehicle',
  meeting: 'teamMeeting',
  documents: 'eyeExamFollowUp',
};
