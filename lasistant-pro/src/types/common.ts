/**
 * Types partagés entre plusieurs entités.
 */

/** Champs de référencement d'une page ou d'un contenu. */
export interface SeoFields {
  title: string;
  description: string;
}

/** Tonalité visuelle d'une étiquette (catégories, statuts…). */
export type Tone = 'brand' | 'success' | 'gold' | 'neutral' | 'info' | 'warning' | 'danger';

/** Erreur métier renvoyée par la couche de données (affichée telle quelle à l'utilisateur). */
export type DataErrorCode = 'offline' | 'rate_limited' | 'not_found' | 'server' | 'validation' | 'forbidden';
