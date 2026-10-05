import { slugify } from './text';

/**
 * Markdown simplifié des contenus éditoriaux (articles, mentions légales) : analyse pure.
 * Le rendu React se trouve dans `components/content/RichText.tsx`.
 *
 * Syntaxe prise en charge :
 * - `::lede Texte` : chapô d'introduction ;
 * - `## Titre` et `### Sous-titre` (les titres de niveau 2 alimentent le sommaire) ;
 * - listes `- élément` et `1. élément` ;
 * - encadré `> **Titre** texte` ;
 * - bloc d'appel à l'action `::cta` ;
 * - en ligne : `**gras**`, `_italique_`, `[libellé](/lien)` et `[[information à valider]]`.
 *
 * Aucun HTML n'est interprété : le contenu saisi dans le back-office ne peut pas injecter de script.
 */

export type MarkdownBlock =
  | { type: 'lede'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'callout'; title: string | null; text: string }
  | { type: 'cta' };

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'pending'; text: string }
  | { type: 'link'; label: string; href: string };

const UNORDERED_ITEM = /^[-*]\s+/;
const ORDERED_ITEM = /^\d+[.)]\s+/;

/** Découpe le texte en blocs ; les identifiants de titres sont uniques. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const usedIds = new Map<string, number>();
  const uniqueId = (text: string) => {
    const base = slugify(stripInline(text)) || 'section';
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    if (list) blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
    paragraph = [];
    list = null;
  };

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();

    if (line === '') {
      flush();
      continue;
    }
    if (line === '::cta') {
      flush();
      blocks.push({ type: 'cta' });
      continue;
    }
    if (line.startsWith('::lede ')) {
      flush();
      blocks.push({ type: 'lede', text: line.slice('::lede '.length).trim() });
      continue;
    }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading?.[1] && heading[2]) {
      flush();
      const text = heading[2].trim();
      blocks.push({ type: 'heading', level: heading[1].length === 2 ? 2 : 3, text, id: uniqueId(text) });
      continue;
    }
    if (line.startsWith('>')) {
      flush();
      const content = line.replace(/^>\s?/, '');
      const titled = /^\*\*(.+?)\*\*\s*(.*)$/.exec(content);
      blocks.push(
        titled?.[1]
          ? { type: 'callout', title: titled[1], text: titled[2] ?? '' }
          : { type: 'callout', title: null, text: content },
      );
      continue;
    }
    const ordered = ORDERED_ITEM.test(line);
    if (ordered || UNORDERED_ITEM.test(line)) {
      if (paragraph.length > 0 || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(line.replace(ordered ? ORDERED_ITEM : UNORDERED_ITEM, ''));
      continue;
    }
    if (list) flush();
    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Titres de niveau 2, pour le sommaire. */
export function tableOfContents(blocks: MarkdownBlock[]): Array<{ id: string; text: string }> {
  return blocks.flatMap((block) =>
    block.type === 'heading' && block.level === 2 ? [{ id: block.id, text: stripInline(block.text) }] : [],
  );
}

/** Texte brut, sans balisage en ligne. */
export function stripInline(text: string): string {
  return tokenizeInline(text)
    .map((token) => (token.type === 'link' ? token.label : token.text))
    .join('');
}

const INLINE_PATTERN = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)\s]+\))/g;

/** Découpe un texte en fragments typés (gras, italique, lien, mention à valider). */
export function tokenizeInline(text: string): InlineToken[] {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part !== '')
    .map((part): InlineToken => {
      if (part.startsWith('[[') && part.endsWith(']]')) return { type: 'pending', text: part.slice(2, -2) };
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
        return { type: 'strong', text: part.slice(2, -2) };
      if (part.startsWith('_') && part.endsWith('_') && part.length > 2)
        return { type: 'em', text: part.slice(1, -1) };
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link?.[1] && link[2]) return { type: 'link', label: link[1], href: link[2] };
      return { type: 'text', text: part };
    });
}

/** Seules ces destinations de liens sont autorisées (pas de « javascript: » ni de « data: »). */
export function isSafeHref(href: string): boolean {
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(href);
}
