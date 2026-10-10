/**
 * Emplacements des fichiers dans le stockage Supabase.
 * - « medias » (public) : images du site ;
 * - « documents » (privé) : pièces jointes des demandes et documents sensibles.
 */
export const BUCKETS = { media: 'medias', documents: 'documents' } as const;

/** Durée de validité d'un lien de téléchargement vers un fichier privé (secondes). */
export const SIGNED_URL_TTL_SECONDS = 5 * 60;

/** Nom de fichier sûr pour une adresse de stockage (accents, espaces et symboles retirés). */
export function storageFileName(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase();
  return (cleaned || 'fichier').slice(-120);
}

/** Chemin unique d'un nouveau fichier : « dossier/<uuid>/<nom> » ou « dossier/<uuid>-<nom> ». */
export function storagePath(folder: string, fileName: string, nested = false): string {
  const id = crypto.randomUUID();
  return nested
    ? `${folder}/${id}/${storageFileName(fileName)}`
    : `${folder}/${id}-${storageFileName(fileName)}`;
}
