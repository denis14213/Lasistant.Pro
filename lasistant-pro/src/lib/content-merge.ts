/**
 * Fusion d'un contenu enregistré avec sa structure d'origine.
 *
 * - Objet : chaque champ d'origine est fusionné avec la valeur enregistrée ; les champs
 *   présents seulement dans la version enregistrée (champ facultatif ajouté) sont conservés.
 * - Liste : la liste enregistrée fait foi (éléments ajoutés, retirés ou réordonnés) ; chaque
 *   élément est complété par l'élément d'origine de même rang, ou à défaut par le dernier.
 * - Valeur simple : la valeur enregistrée est retenue si elle est du même type que celle
 *   d'origine (un texte d'origine « null », à compléter, accepte un texte).
 *
 * Une page reste ainsi toujours complète et du bon type, même si la version enregistrée
 * est partielle ou plus ancienne que la structure du site.
 */

type Plain = Record<string, unknown>;

function isPlainObject(value: unknown): value is Plain {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeContent<T>(defaults: T, stored: unknown): T {
  if (stored === undefined) return defaults;
  if (defaults === undefined) return stored as T;

  if (Array.isArray(defaults)) {
    if (!Array.isArray(stored)) return defaults;
    const fallback = defaults[defaults.length - 1];
    return stored.map((item, index) => mergeContent(defaults[index] ?? fallback, item)) as T;
  }

  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults;
    const result: Plain = { ...defaults };
    for (const key of Object.keys(defaults)) result[key] = mergeContent(defaults[key], stored[key]);
    for (const key of Object.keys(stored)) {
      if (!(key in defaults)) result[key] = stored[key];
    }
    return result as T;
  }

  if (defaults === null) return (typeof stored === 'string' || stored === null ? stored : defaults) as T;
  return (typeof stored === typeof defaults ? stored : defaults) as T;
}
