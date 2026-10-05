import type { IconName } from './icon';

/**
 * Structures éditoriales partagées par les contenus de pages.
 */

/** Titre comportant un accent éditorial en italique : « Soutien médical » + « en Tunisie ». */
export interface AccentText {
  start: string;
  accent: string;
  end?: string;
}

export interface LinkAction {
  label: string;
  to: string;
}

export type IconTone = 'brand' | 'success' | 'gold' | 'dark' | 'neutral';

/**
 * Bloc « caractéristique » : titre et texte court.
 * L'icône n'est renseignée que lorsqu'elle désigne un objet concret (un type de logement,
 * une étape du dossier) ; une qualité abstraite (« Confort », « Sécurité ») se passe d'icône.
 */
export interface FeatureItem {
  title: string;
  text: string;
  icon?: IconName;
  /** Mention « à valider » éventuelle */
  pending?: string;
}

export interface StepItem {
  title: string;
  text: string;
}
