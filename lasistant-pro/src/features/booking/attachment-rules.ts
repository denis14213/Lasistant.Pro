import { formatFileSize } from '@/lib/format';

/** Formats acceptés et taille maximale des pièces jointes (cahier des charges § 11.4). */
export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';
export const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Vérifie le fichier et renvoie un message d'erreur lisible, ou null s'il est accepté. */
export function validateAttachment(file: { type: string; size: number }): string | null {
  const problems: string[] = [];
  if (!ACCEPTED_TYPES.includes(file.type)) problems.push('Format non accepté (PDF, JPG ou PNG uniquement)');
  if (file.size > MAX_SIZE_BYTES) problems.push(`${formatFileSize(file.size)} dépasse la limite de 5 Mo`);
  return problems.length > 0 ? problems.join(' · ') : null;
}
