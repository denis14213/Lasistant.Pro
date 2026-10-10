import { isImageKey } from '@/lib/images';

/**
 * Règles de l'éditeur de contenus (« Pages du site »), sans React.
 *
 * Le formulaire est déduit de la structure de chaque page : un texte devient un champ,
 * un titre « début / mots en italique / fin » un groupe de trois champs, une liste un
 * ensemble d'éléments que l'on peut ajouter, retirer et réordonner.
 */

export type ContentPath = ReadonlyArray<string | number>;

export type FieldKind =
  | 'hidden'
  | 'readonly'
  | 'text'
  | 'textarea'
  | 'image'
  | 'icon'
  | 'tone'
  | 'number'
  | 'boolean'
  | 'accent'
  | 'object'
  | 'list';

/** Libellés des champs, par nom de clé. */
const LABELS: Record<string, string> = {
  seo: 'Référencement (moteurs de recherche)',
  hero: 'En-tête de la page',
  eyebrow: 'Surtitre',
  title: 'Titre',
  titleAccent: 'Mots mis en valeur du titre',
  subtitle: 'Sous-titre',
  lead: 'Introduction',
  text: 'Texte',
  description: 'Description',
  statement: 'Phrase principale',
  note: 'Note',
  image: 'Photo',
  insetImage: 'Photo secondaire',
  insetCaption: 'Légende de la photo secondaire',
  primaryCta: 'Bouton principal',
  secondaryCta: 'Bouton secondaire',
  cta: 'Bouton',
  label: 'Libellé',
  to: 'Lien',
  linkLabel: 'Libellé du lien',
  primaryLabel: 'Libellé du bouton',
  audienceLabel: 'Intitulé des publics',
  audiences: 'Publics',
  bookingCard: 'Carte de réservation',
  tag: 'Étiquette',
  mode: 'Modalité',
  services: 'Services',
  engagement: 'Engagement',
  badgeTitle: 'Pastille : titre',
  badgeText: 'Pastille : texte',
  floatTitle: 'Pastille : titre',
  floatText: 'Pastille : texte',
  journey: 'Parcours',
  ctaText: 'Phrase d’appel',
  field: 'Sur le terrain',
  trust: 'Confiance',
  values: 'Valeurs',
  news: 'Actualités',
  contact: 'Contact',
  formTitle: 'Titre du formulaire',
  items: 'Éléments',
  start: 'Début',
  accent: 'Mots mis en valeur (italique)',
  end: 'Fin',
  role: 'Notre rôle',
  features: 'Ce que nous faisons',
  icon: 'Icône',
  tone: 'Teinte',
  pending: 'Mention « à valider »',
  pendingLabel: 'Mention « à valider »',
  pendingText: 'Texte en attente de validation',
  preparation: 'Préparation',
  steps: 'Étapes',
  checklistTitle: 'Liste : titre',
  checklistIntro: 'Liste : introduction',
  checklist: 'Liste',
  privacyNote: 'Rappel de confidentialité',
  privacyHint: 'Rappel de confidentialité',
  homeCare: 'Assistance à domicile',
  qualities: 'Qualités',
  related: 'Services complémentaires',
  relatedTitle: 'Titre des services complémentaires',
  faqTitle: 'Titre des questions fréquentes',
  faqCategory: 'Thème de questions affiché',
  profiles: 'Profils',
  points: 'Points',
  solutions: 'Solutions',
  criteriaLabel: 'Critères : intitulé',
  criteria: 'Critères',
  method: 'Méthode',
  form: 'Formulaire',
  promises: 'Engagements',
  pillars: 'Engagements',
  seniors: 'Personnes âgées',
  scope: 'Périmètre',
  included: 'Inclus',
  excluded: 'Non inclus',
  finder: 'Aide au choix',
  options: 'Options',
  hint: 'Indication',
  rowImages: 'Photos des services',
  help: 'Encart d’aide',
  summary: 'Récapitulatif',
  attachmentHint: 'Aide pour la pièce jointe',
  pills: 'Pastilles',
  nextSteps: 'Prochaines étapes',
  readMore: 'À lire',
  map: 'Carte',
  consentText: 'Texte de consentement',
  partners: 'Partenaires',
  pageSize: 'Articles par page',
  article: 'Page d’un article',
  inlineCta: 'Encart dans l’article',
  aside: 'Encart latéral',
  disclaimer: 'Avertissement',
  allLabel: 'Libellé « toutes les questions »',
  faq: 'Questions',
  question: 'Question',
  answer: 'Réponse',
  technical: 'Plan technique',
  mission: 'Mission',
  story: 'Histoire',
  placeholderTitle: 'Encart à compléter : titre',
  placeholderText: 'Encart à compléter : texte',
  approach: 'Approche',
  identity: 'Équipe identifiable',
  zone: 'Zone d’intervention',
  team: 'Équipe',
  members: 'Membres',
  name: 'Nom',
  notice: 'Encart d’information',
  sections: 'Sections',
  blocks: 'Blocs',
  type: 'Type de bloc',
  head: 'En-têtes',
  rows: 'Lignes',
  need: 'Besoin',
  supportQuote: 'Citation',
  signature: 'Signature',
  medicalDisclaimer: 'Rappel médical',
  closingCta: 'Appel final (bas des pages)',
};

/** Textes longs : saisis dans une zone de texte. */
const LONG_TEXT_KEYS = new Set([
  'text',
  'lead',
  'description',
  'answer',
  'statement',
  'need',
  'note',
  'privacyNote',
  'placeholderText',
  'supportQuote',
  'mission',
]);

/** Champs techniques : identifiants (masqués) et repères fixés par le code (affichés). */
const HIDDEN_KEYS = new Set(['id']);
const READONLY_KEYS = new Set(['type', 'faqCategory']);

/** Listes dont la longueur est fixée par le code (chaque élément pilote un écran). */
const FIXED_LISTS = new Set(['reservation.steps']);

export const TONES = ['brand', 'success', 'gold', 'dark', 'neutral'] as const;

export const TONE_LABELS: Record<(typeof TONES)[number], string> = {
  brand: 'Prune (marque)',
  success: 'Vert',
  gold: 'Doré',
  dark: 'Sombre',
  neutral: 'Neutre',
};

/** Libellés des types de blocs des documents légaux. */
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  markdown: 'Paragraphe',
  list: 'Liste',
  table: 'Tableau',
  callout: 'Encadré',
  publisher: 'Éditeur du site (repris des réglages)',
  'cookie-table': 'Liste des cookies (automatique)',
  'cookie-settings': 'Bouton des préférences cookies',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Titre « début / mots en italique / fin ». */
export function isAccentText(value: unknown): value is { start: string; accent: string; end?: string } {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.includes('start') &&
    keys.includes('accent') &&
    keys.every((key) => ['start', 'accent', 'end'].includes(key) && typeof value[key] === 'string')
  );
}

/** « insetCaption » → « Inset caption » (repli pour une clé sans libellé). */
function humanize(key: string): string {
  const words = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function fieldLabel(key: string | number, parentKey?: string | number): string {
  if (typeof key === 'number') return `Élément ${key + 1}`;
  if (parentKey === 'rowImages') return `Photo « ${key} »`;
  return LABELS[key] ?? humanize(key);
}

export function fieldKind(key: string | number, value: unknown, parentKey?: string | number): FieldKind {
  if (typeof key === 'string' && HIDDEN_KEYS.has(key)) return 'hidden';
  if (typeof key === 'string' && READONLY_KEYS.has(key)) return 'readonly';
  if (Array.isArray(value)) return 'list';
  if (isAccentText(value)) return 'accent';
  if (isPlainObject(value)) return 'object';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  const name = typeof key === 'string' ? key : '';
  if (parentKey === 'rowImages' || /^(image|insetImage|coverImage)$/.test(name)) return 'image';
  if (typeof value === 'string' && isImageKey(value) && /image/i.test(name)) return 'image';
  if (name === 'icon') return 'icon';
  if (name === 'tone') return 'tone';
  if (typeof value === 'string' && (value.length > 90 || value.includes('\n') || LONG_TEXT_KEYS.has(name))) {
    return 'textarea';
  }
  return 'text';
}

/** La liste accepte-t-elle l'ajout et le retrait d'éléments ? */
export function isFixedList(pageKey: string, path: ContentPath): boolean {
  return FIXED_LISTS.has([pageKey, ...path].join('.'));
}

/** Titre lisible d'un élément de liste (titre, libellé, question…). */
export function itemTitle(item: unknown, index: number): string {
  if (typeof item === 'string') return item || `Élément ${index + 1}`;
  if (isPlainObject(item)) {
    for (const key of ['title', 'label', 'question', 'name', 'tag']) {
      const candidate = item[key];
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
      if (isAccentText(candidate))
        return [candidate.start, candidate.accent, candidate.end].filter(Boolean).join(' ');
    }
    if (typeof item.type === 'string') return BLOCK_TYPE_LABELS[item.type] ?? item.type;
  }
  return `Élément ${index + 1}`;
}

/** Nouvel élément de liste : même structure que le modèle, textes vidés, identifiant unique. */
export function blankLike<T>(template: T): T {
  if (Array.isArray(template)) return [] as T;
  if (isPlainObject(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => {
        if (key === 'id') return [key, `element-${Date.now().toString(36)}`];
        if (key === 'type' || key === 'icon' || key === 'tone' || /image/i.test(key)) return [key, value];
        return [key, blankLike(value)];
      }),
    ) as T;
  }
  if (typeof template === 'string') return '' as T;
  return template;
}

/** Valeur à l'emplacement donné. */
export function getAt(root: unknown, path: ContentPath): unknown {
  return path.reduce<unknown>(
    (node, key) => (node as Record<string | number, unknown> | undefined)?.[key],
    root,
  );
}

/** Copie du contenu avec une valeur remplacée (aucune mutation). */
export function setAt<T>(root: T, path: ContentPath, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAt(copy[head as number], rest, value);
    return copy as T;
  }
  const node = (root ?? {}) as Record<string | number, unknown>;
  return { ...node, [head as string]: setAt(node[head as string], rest, value) } as T;
}

/** Nombre de valeurs différentes entre deux versions (pour la barre d'enregistrement). */
export function countDifferences(a: unknown, b: unknown): number {
  if (Array.isArray(a) && Array.isArray(b)) {
    const length = Math.max(a.length, b.length);
    let count = 0;
    for (let index = 0; index < length; index += 1) count += countDifferences(a[index], b[index]);
    return count;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let count = 0;
    for (const key of keys) count += countDifferences(a[key], b[key]);
    return count;
  }
  if (a === undefined || b === undefined) return a === b ? 0 : 1;
  return Object.is(a, b) ? 0 : 1;
}

/** Rubriques de premier niveau (navigation rapide en tête de l'éditeur). */
export function sectionKeys(value: Record<string, unknown>): string[] {
  return Object.entries(value)
    .filter(([key, section]) => {
      const kind = fieldKind(key, section);
      return kind === 'object' || kind === 'list';
    })
    .map(([key]) => key);
}
