/**
 * Noms d'icônes utilisables dans les contenus.
 * Les contenus (et demain la base de données) stockent un nom, jamais un composant :
 * le registre `components/ui/icon-registry.ts` fait la correspondance.
 * Un nom désigne une FONCTION (« care », « arrival »), pas un dessin : le dessin se choisit
 * dans le système d'icônes (docs/icones.md) et peut évoluer sans toucher aux contenus.
 */
export type IconName =
  // Métiers et publics de LASISTANT.PRO
  | 'medical'
  | 'housing'
  | 'care'
  | 'arrival'
  | 'stay'
  | 'family'
  | 'student'
  | 'partner'
  | 'conversation'
  | 'orientation'
  | 'fileReview'
  | 'checklist'
  | 'key'
  // Types de logement
  | 'apartment'
  | 'studio'
  | 'room'
  // Coordonnées
  | 'phone'
  | 'email'
  | 'address'
  | 'clock'
  // Cookies et confidentialité
  | 'secure'
  | 'analytics'
  | 'map';

/** Icônes de la navigation du back-office (configuration du code, jamais stockée en base). */
export type AdminIconName =
  'dashboard' | 'inbox' | 'calendar' | 'services' | 'articles' | 'images' | 'identity' | 'users' | 'email';
