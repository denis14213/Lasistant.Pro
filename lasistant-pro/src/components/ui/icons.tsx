import {
  AirplaneLandingIcon,
  AirplaneTiltIcon,
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BedIcon,
  BuildingApartmentIcon,
  CalendarDotsIcon,
  CalendarPlusIcon,
  CalendarXIcon,
  CameraIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleNotchIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  CloudWarningIcon,
  CompassIcon,
  CookieIcon,
  DoorIcon,
  DotsThreeIcon,
  EnvelopeSimpleIcon,
  FacebookLogoIcon,
  FileMagnifyingGlassIcon,
  FileTextIcon,
  HandHeartIcon,
  HandshakeIcon,
  HourglassMediumIcon,
  HouseLineIcon,
  HouseSimpleIcon,
  InfoIcon,
  KeyIcon,
  LinkSimpleIcon,
  ListIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MapTrifoldIcon,
  MinusIcon,
  PaperPlaneTiltIcon,
  PhoneIcon,
  PlusIcon,
  PrinterIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  StethoscopeIcon,
  StudentIcon,
  SuitcaseRollingIcon,
  TrashSimpleIcon,
  UploadSimpleIcon,
  UsersThreeIcon,
  WarningCircleIcon,
  WarningIcon,
  WhatsappLogoIcon,
  WifiHighIcon,
  WifiSlashIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react';
import { defineIcon } from './icon-factory';

/**
 * Icônes du site public et icônes partagées avec le back-office (docs/icones.md).
 * Les icônes réservées au back-office sont dans icons-admin.tsx : elles ne sont chargées qu'avec lui.
 */
export { IconWeightScope, type AppIcon, type IconProps, type IconWeight } from './icon-factory';

/* ------------------------------------------------------------------------------------------ */
/* Navigation et structure : simples, discrètes, immédiatement comprises                        */
/* ------------------------------------------------------------------------------------------ */
/** Ouvrir le menu principal. */
export const IconMenu = defineIcon(ListIcon, 'menu');
/** Fermer (menu, fenêtre, notification) ou effacer une saisie. */
export const IconClose = defineIcon(XIcon, 'close');
/** Déplier : liste déroulante, accordéon, sommaire. */
export const IconChevronDown = defineIcon(CaretDownIcon, 'chevron-down');
/** Précédent : pagination, mois précédent. */
export const IconChevronLeft = defineIcon(CaretLeftIcon, 'chevron-left');
/** Suivant, séparateur de fil d'Ariane, ligne cliquable. */
export const IconChevronRight = defineIcon(CaretRightIcon, 'chevron-right');
/** Aller plus loin : appel à l'action, lien « Découvrir ». */
export const IconArrowRight = defineIcon(ArrowRightIcon, 'arrow-right');
/** Revenir en arrière. */
export const IconArrowLeft = defineIcon(ArrowLeftIcon, 'arrow-left');
/** Ouvrir un service externe dans un nouvel onglet. */
export const IconExternalLink = defineIcon(ArrowSquareOutIcon, 'external-link');
/** Revenir à l'accueil du site. */
export const IconHome = defineIcon(HouseSimpleIcon, 'home');
/** Menu d'actions supplémentaires. */
export const IconMore = defineIcon(DotsThreeIcon, 'more');

/* ------------------------------------------------------------------------------------------ */
/* Contact et échanges                                                                          */
/* ------------------------------------------------------------------------------------------ */
export const IconPhone = defineIcon(PhoneIcon, 'phone');
export const IconEmail = defineIcon(EnvelopeSimpleIcon, 'email');
/** Adresse postale, lieu. */
export const IconAddress = defineIcon(MapPinIcon, 'address');
/** Échange avec un conseiller : deux bulles, une vraie conversation. */
export const IconConversation = defineIcon(ChatsCircleIcon, 'conversation');
/** Envoyer un message, une réponse, une invitation. */
export const IconSend = defineIcon(PaperPlaneTiltIcon, 'send');
/** Logo WhatsApp au trait, pour les mentions dans le texte (le bouton flottant garde le logo officiel). */
export const IconWhatsApp = defineIcon(WhatsappLogoIcon, 'whatsapp');
export const IconFacebook = defineIcon(FacebookLogoIcon, 'facebook');

/* ------------------------------------------------------------------------------------------ */
/* Temps et rendez-vous                                                                         */
/* ------------------------------------------------------------------------------------------ */
/** Durée, horaires. */
export const IconClock = defineIcon(ClockIcon, 'clock');
/** Agenda, réservation d'un échange. */
export const IconCalendar = defineIcon(CalendarDotsIcon, 'calendar');
/** Ajouter un rendez-vous ou des disponibilités. */
export const IconCalendarAdd = defineIcon(CalendarPlusIcon, 'calendar-add');
/** Aucun créneau disponible. */
export const IconCalendarEmpty = defineIcon(CalendarXIcon, 'calendar-empty');
/** Patienter avant une nouvelle tentative. */
export const IconWait = defineIcon(HourglassMediumIcon, 'wait');
/** Historique, versions précédentes. */
export const IconHistory = defineIcon(ClockCounterClockwiseIcon, 'history');

/* ------------------------------------------------------------------------------------------ */
/* Actions : dessins universels                                                                 */
/* ------------------------------------------------------------------------------------------ */
export const IconAdd = defineIcon(PlusIcon, 'add');
/** Déplier une réponse d'accordéon (le « + » pivote en « × » à l'ouverture). */
export const IconExpand = defineIcon(PlusIcon, 'expand');
export const IconRemove = defineIcon(MinusIcon, 'remove');
/** Élément exclu d'une prestation (liste « Non inclus »). */
export const IconExcluded = defineIcon(XIcon, 'excluded');
/** Valider, enregistrer, élément coché. */
export const IconCheck = defineIcon(CheckIcon, 'check');
export const IconDelete = defineIcon(TrashSimpleIcon, 'delete');
export const IconUpload = defineIcon(UploadSimpleIcon, 'upload');
export const IconSearch = defineIcon(MagnifyingGlassIcon, 'search');
/** Régler ses préférences (cookies, carte). */
export const IconPreferences = defineIcon(SlidersHorizontalIcon, 'preferences');
export const IconPrint = defineIcon(PrinterIcon, 'print');
/** Réessayer, actualiser. */
export const IconRetry = defineIcon(ArrowClockwiseIcon, 'retry');
/** Lien hypertexte (insérer, copier un lien). */
export const IconHyperlink = defineIcon(LinkSimpleIcon, 'hyperlink');

/* ------------------------------------------------------------------------------------------ */
/* Contenus et back-office                                                                      */
/* ------------------------------------------------------------------------------------------ */
/** Document, pièce jointe, page de contenu. */
export const IconDocument = defineIcon(FileTextIcon, 'document');
export const IconCookie = defineIcon(CookieIcon, 'cookie');
export const IconCamera = defineIcon(CameraIcon, 'camera');

/* ------------------------------------------------------------------------------------------ */
/* États du système                                                                             */
/* ------------------------------------------------------------------------------------------ */
export const IconSuccess = defineIcon(CheckCircleIcon, 'success');
export const IconInfo = defineIcon(InfoIcon, 'info');
export const IconWarning = defineIcon(WarningIcon, 'warning');
export const IconError = defineIcon(WarningCircleIcon, 'error');
/** Chargement (à animer avec « animate-spin »). */
export const IconSpinner = defineIcon(CircleNotchIcon, 'spinner');
/** Confidentialité, accès réservé. */
export const IconLock = defineIcon(LockSimpleIcon, 'lock');
/** Mot de passe, codes de secours, remise des clés. */
export const IconKey = defineIcon(KeyIcon, 'key');
/** Protection active : connexion sécurisée, double authentification. */
export const IconSecure = defineIcon(ShieldCheckIcon, 'secure');
export const IconOffline = defineIcon(WifiSlashIcon, 'offline');
export const IconOnline = defineIcon(WifiHighIcon, 'online');
/** Mode avion du téléphone. */
export const IconAirplaneMode = defineIcon(AirplaneTiltIcon, 'airplane-mode');
/** Service momentanément indisponible. */
export const IconServerError = defineIcon(CloudWarningIcon, 'server-error');
export const IconMaintenance = defineIcon(WrenchIcon, 'maintenance');

/* ------------------------------------------------------------------------------------------ */
/* Identité du site : métiers et publics de LASISTANT.PRO (dessin « duotone »)                  */
/* ------------------------------------------------------------------------------------------ */
/** Assistance médicale. */
export const IconMedical = defineIcon(StethoscopeIcon, 'medical');
/** Logement, hébergement, assistance à domicile. */
export const IconHousing = defineIcon(HouseLineIcon, 'housing');
/** Accompagnement des malades et des personnes âgées : une main qui porte. */
export const IconCare = defineIcon(HandHeartIcon, 'care');
/** Arrivée en Tunisie, accueil à l'aéroport. */
export const IconArrival = defineIcon(AirplaneLandingIcon, 'arrival');
/** Organisation du séjour. */
export const IconStay = defineIcon(SuitcaseRollingIcon, 'stay');
/** Familles et proches, colocation. */
export const IconFamily = defineIcon(UsersThreeIcon, 'family');
export const IconStudent = defineIcon(StudentIcon, 'student');
/** Professionnels et partenaires. */
export const IconPartner = defineIcon(HandshakeIcon, 'partner');
/** Étude préalable du dossier. */
export const IconFileReview = defineIcon(FileMagnifyingGlassIcon, 'file-review');
/** Orientation vers le bon interlocuteur. */
export const IconOrientation = defineIcon(CompassIcon, 'orientation');
export const IconApartment = defineIcon(BuildingApartmentIcon, 'apartment');
/** Studio : un logement indépendant, sa propre porte. */
export const IconStudio = defineIcon(DoorIcon, 'studio');
/** Chambre. */
export const IconRoom = defineIcon(BedIcon, 'room');
/** Liste des éléments à préparer. */
export const IconChecklist = defineIcon(ClipboardTextIcon, 'checklist');
/** Mesure d'audience. */
export const IconAnalytics = defineIcon(ChartLineUpIcon, 'analytics');
/** Carte, plan du site. */
export const IconMap = defineIcon(MapTrifoldIcon, 'map');
