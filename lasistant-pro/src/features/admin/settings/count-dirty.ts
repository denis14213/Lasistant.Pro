/** Nombre de champs modifiés dans l'état « dirtyFields » de React Hook Form. */
export function countDirty(dirty: unknown): number {
  if (dirty === true) return 1;
  if (Array.isArray(dirty)) return dirty.reduce((total: number, item) => total + countDirty(item), 0);
  if (dirty && typeof dirty === 'object')
    return Object.values(dirty).reduce((total: number, item) => total + countDirty(item), 0);
  return 0;
}
