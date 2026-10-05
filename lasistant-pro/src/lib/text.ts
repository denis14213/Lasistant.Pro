/**
 * Utilitaires de manipulation de texte (recherche, identifiants d'URL…).
 */

/** Met en minuscules et retire les accents : « Hébergement » devient « hebergement ». */
export function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/** Indique si tous les mots de la requête apparaissent dans le texte (insensible aux accents). */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeText(text);
  return words.every((word) => haystack.includes(word));
}

/** Transforme un titre en identifiant d'URL : « Logement & hébergement » → « logement-hebergement ». */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Coupe un texte trop long sans couper un mot en deux. */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`;
}

/** Accorde un mot selon le nombre : pluralize(2, 'demande') → « 2 demandes ». */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}

/** Initiales d'un nom complet : « Jean-Marc Kouassi » → « JK ». */
export function initials(fullName: string): string {
  return fullName
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

/** Remplace les variables « [nom] » d'un modèle de message par leurs valeurs. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\[([^\]]+)\]/g, (match, key: string) => values[key] ?? match);
}

/** Première lettre en capitale : « mercredi » → « Mercredi ». */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
