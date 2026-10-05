import type { SeoFields } from './common';
import type { IconTone } from './content';
import type { IconName } from './icon';
import type { ImageRef } from './media';

/**
 * Service proposé par LASISTANT.PRO (table « services »).
 * - « page » : service présenté par une page dédiée et dans le menu ;
 * - « reservation » : type d'échange proposé uniquement dans la réservation en ligne.
 */
export type ServiceKind = 'page' | 'reservation';

/** Public concerné par un service (étiquette textuelle). */
export interface ServiceAudience {
  label: string;
}

export interface Service {
  id: string;
  slug: string;
  kind: ServiceKind;
  /** Titre affiché (« Assistance médicale ») */
  title: string;
  /** Sous-titre éditorial (« Soins personnalisés ») */
  subtitle: string;
  /** Résumé court pour les cartes et la réservation */
  summary: string;
  /** Description développée pour la page « Nos services » */
  description: string;
  /** Points forts affichés sur les cartes de l'accueil */
  highlights: string[];
  /** Liste détaillée « Ce que nous faisons » */
  details: string[];
  audiences: ServiceAudience[];
  icon: IconName;
  /** Teinte de la pastille d'icône */
  iconTone: IconTone;
  image: ImageRef;
  imageAlt: string;
  ctaLabel: string;
  /** Chemin de l'action principale (réservation ou formulaire dédié) */
  ctaHref: string;
  active: boolean;
  showInMenu: boolean;
  /** Affiche le rappel « ne remplace pas un avis médical » (services liés à la santé) */
  showMedicalDisclaimer: boolean;
  sortOrder: number;
  seo: SeoFields;
  updatedAt: string;
  updatedBy: string;
}
