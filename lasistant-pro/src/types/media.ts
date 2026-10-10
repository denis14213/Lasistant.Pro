/**
 * Images et médias.
 */

/** Image prête à l'affichage (source, variantes responsives, dimensions, texte alternatif). */
export interface ImageAsset {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  /**
   * Point d'intérêt de la photo (valeur CSS « object-position », ex. « 20% 60% ») : il reste
   * visible quand la photo est recadrée pour remplir son emplacement. Centre par défaut.
   */
  focus?: string;
}

/**
 * Référence d'image stockée dans les données.
 * Phase statique : clé du registre local (ex. « consultation »).
 * Phase base de données : URL publique du fichier (stockage Supabase).
 */
export type ImageRef = string;

export type MediaKind = 'image' | 'document';

/** Fichier de la médiathèque (table « media » du cahier des charges). */
export interface MediaItem {
  id: string;
  fileName: string;
  kind: MediaKind;
  image: ImageRef;
  title: string;
  altText: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  createdAt: string;
  /** Pages où le fichier est utilisé (aide à éviter les suppressions malencontreuses) */
  usedOn: string[];
  /** Documents sensibles : stockage privé, jamais exposés publiquement */
  isPrivate: boolean;
  /** Droits d'utilisation confirmés par le propriétaire */
  rightsConfirmed: boolean;
}
