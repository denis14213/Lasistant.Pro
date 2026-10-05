import { useRef } from 'react';

/** Préfixes de ligne retirés avant d'en appliquer un nouveau (titres, listes, citations, chapô). */
const LINE_PREFIX = /^(#{2,3}\s+|[-*]\s+|\d+[.)]\s+|>\s?|::lede\s+)/;

/**
 * Insertion de texte dans un champ multiligne contrôlé (barres d'outils de mise en forme,
 * variables d'e-mails). Les insertions passent par l'historique natif du champ :
 * « Annuler » et « Rétablir » (Ctrl Z / Ctrl Y) continuent de fonctionner.
 */
export function useTextareaEditing(value: string, onChange: (value: string) => void) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Remplace la sélection ; sélectionne ensuite la plage indiquée (relative au texte inséré). */
  const replaceSelection = (text: string, selectStart?: number, selectEnd?: number) => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.focus();
    const start = textarea.selectionStart;
    const inserted = document.execCommand('insertText', false, text);
    if (!inserted) {
      // Navigateur sans « insertText » : modification directe de la valeur.
      onChange(value.slice(0, start) + text + value.slice(textarea.selectionEnd));
    }
    if (selectStart !== undefined) {
      requestAnimationFrame(() =>
        textarea.setSelectionRange(start + selectStart, start + (selectEnd ?? selectStart)),
      );
    }
  };

  const selectedText = () => {
    const textarea = ref.current;
    return textarea ? value.slice(textarea.selectionStart, textarea.selectionEnd) : '';
  };

  /** Entoure la sélection (gras, italique, lien…) ; sans sélection, insère un texte d'exemple sélectionné. */
  const wrap = (before: string, after: string, placeholder: string) => {
    const content = selectedText() || placeholder;
    replaceSelection(`${before}${content}${after}`, before.length, before.length + content.length);
  };

  /** Applique un préfixe à chaque ligne touchée par la sélection (titres, listes, encadrés). */
  const prefixLines = (prefix: (index: number) => string) => {
    const textarea = ref.current;
    if (!textarea) return;
    const lineStart = value.lastIndexOf('\n', textarea.selectionStart - 1) + 1;
    const nextBreak = value.indexOf('\n', textarea.selectionEnd);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    textarea.setSelectionRange(lineStart, lineEnd);
    const lines = value
      .slice(lineStart, lineEnd)
      .split('\n')
      .map((line, index) => `${prefix(index)}${line.replace(LINE_PREFIX, '')}`);
    replaceSelection(lines.join('\n'));
  };

  /** Insère un bloc sur sa propre ligne. */
  const insertBlock = (block: string) => {
    const start = ref.current?.selectionStart ?? value.length;
    const needsBreak = start > 0 && value[start - 1] !== '\n';
    replaceSelection(`${needsBreak ? '\n\n' : ''}${block}\n`);
  };

  /** Annule ou rétablit la dernière modification du champ. */
  const history = (command: 'undo' | 'redo') => {
    ref.current?.focus();
    document.execCommand(command);
  };

  return { ref, replaceSelection, wrap, prefixLines, insertBlock, history };
}
