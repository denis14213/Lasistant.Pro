import { isSafeHref, tokenizeInline, type InlineToken } from '@/lib/markdown';
import { fillTemplate } from '@/lib/text';

/**
 * Mise en forme légère du corps des e-mails (analyse pure, sans React).
 *
 * - paragraphes séparés par une ligne vide, retours à la ligne conservés ;
 * - listes « - élément » ;
 * - bouton sur sa propre ligne : `::bouton [Libellé](https://…)` ;
 * - en ligne : `**gras**`, `_italique_`, `[libellé](https://…)` et `[[à valider]]`.
 *
 * Les variables (« [prénom] ») sont remplacées après l'analyse : une valeur saisie
 * par un demandeur ne peut donc jamais créer de lien ni de mise en forme.
 */

export type EmailBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'button'; label: string; href: string };

const BUTTON_LINE = /^::bouton\s+\[([^\]]+)\]\(([^)\s]+)\)$/;
const LIST_ITEM = /^[-*•]\s+/;

export function parseEmailBody(source: string): EmailBlock[] {
  const blocks: EmailBlock[] = [];
  let lines: string[] = [];
  let items: string[] = [];

  const flushParagraph = () => {
    if (lines.length > 0) blocks.push({ type: 'paragraph', lines });
    lines = [];
  };
  const flushList = () => {
    if (items.length > 0) blocks.push({ type: 'list', items });
    items = [];
  };

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }
    const button = BUTTON_LINE.exec(line);
    if (button?.[1] && button[2]) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'button', label: button[1], href: button[2] });
      continue;
    }
    if (LIST_ITEM.test(line)) {
      flushParagraph();
      items.push(line.replace(LIST_ITEM, ''));
      continue;
    }
    flushList();
    lines.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

const VARIABLE = /\[([\p{L}_]+)\]/gu;
const PLACEHOLDER = /(\d+)/g;

/** Fragments en ligne, variables remplacées dans chaque fragment. */
export function emailInline(text: string, values: Record<string, string>): InlineToken[] {
  // Les variables sont mises à l'abri avant l'analyse : « [contact_préféré] » contient
  // un « _ » qui serait sinon pris pour le début d'un passage en italique.
  const variables: string[] = [];
  const shielded = text.replace(VARIABLE, (match, name: string) => {
    if (!(name in values)) return match;
    variables.push(match);
    return `${variables.length - 1}`;
  });
  const restore = (value: string) =>
    fillTemplate(
      value.replace(PLACEHOLDER, (_, index: string) => variables[Number(index)] ?? ''),
      values,
    );
  return tokenizeInline(shielded).map((token) =>
    token.type === 'link'
      ? { ...token, label: restore(token.label), href: restore(token.href) }
      : { ...token, text: restore(token.text) },
  );
}

/**
 * Lien utilisable dans un e-mail : les chemins internes deviennent absolus,
 * les destinations dangereuses sont refusées (null).
 */
export function emailHref(href: string, siteUrl: string): string | null {
  if (!isSafeHref(href) || href.startsWith('#')) return null;
  return href.startsWith('/') ? `${siteUrl}${href}` : href;
}

function inlineToText(text: string, values: Record<string, string>, siteUrl: string): string {
  return emailInline(text, values)
    .map((token) => {
      if (token.type === 'link') {
        const href = emailHref(token.href, siteUrl);
        return href && href !== token.label ? `${token.label} (${href})` : token.label;
      }
      return token.type === 'pending' ? `(${token.text})` : token.text;
    })
    .join('');
}

/**
 * Version texte du corps : réponses envoyées depuis la messagerie de l'équipe
 * et partie « texte brut » des e-mails automatiques.
 */
export function emailBodyToText(source: string, values: Record<string, string>, siteUrl: string): string {
  return parseEmailBody(source)
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return block.lines.map((line) => inlineToText(line, values, siteUrl)).join('\n');
        case 'list':
          return block.items.map((item) => `• ${inlineToText(item, values, siteUrl)}`).join('\n');
        case 'button': {
          const href = emailHref(fillTemplate(block.href, values), siteUrl);
          const label = fillTemplate(block.label, values);
          return href ? `${label} : ${href}` : label;
        }
      }
    })
    .join('\n\n');
}
