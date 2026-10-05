/**
 * Identifiants uniques et lisibles pour les nouveaux éléments (« tel-3f9a2c1d »).
 */
export function uniqueId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}
