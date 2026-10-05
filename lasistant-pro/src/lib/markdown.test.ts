import { describe, expect, it } from 'vitest';
import { isSafeHref, parseMarkdown, stripInline, tableOfContents, tokenizeInline } from './markdown';

describe('Markdown simplifié des contenus', () => {
  it('reconnaît les blocs éditoriaux', () => {
    const blocks = parseMarkdown(`::lede Introduction.

## Préparer son séjour
Premier paragraphe
sur deux lignes.

- Passeport
- Billets

1. Arriver
2. S'installer

> **Bon à savoir** Gardez une copie.

::cta`);
    expect(blocks.map((block) => block.type)).toEqual([
      'lede',
      'heading',
      'paragraph',
      'list',
      'list',
      'callout',
      'cta',
    ]);
    expect(blocks[2]).toEqual({ type: 'paragraph', text: 'Premier paragraphe sur deux lignes.' });
    expect(blocks[3]).toEqual({ type: 'list', ordered: false, items: ['Passeport', 'Billets'] });
    expect(blocks[4]).toMatchObject({ type: 'list', ordered: true });
  });

  it('donne des identifiants uniques aux titres et construit le sommaire', () => {
    const blocks = parseMarkdown('## Logement\n\n### Détails\n\n## Logement');
    expect(tableOfContents(blocks)).toEqual([
      { id: 'logement', text: 'Logement' },
      { id: 'logement-2', text: 'Logement' },
    ]);
  });

  it('découpe la mise en forme en ligne', () => {
    expect(tokenizeInline('Un **mot** en _italique_, un [lien](/contact) et [[à valider]].')).toEqual([
      { type: 'text', text: 'Un ' },
      { type: 'strong', text: 'mot' },
      { type: 'text', text: ' en ' },
      { type: 'em', text: 'italique' },
      { type: 'text', text: ', un ' },
      { type: 'link', label: 'lien', href: '/contact' },
      { type: 'text', text: ' et ' },
      { type: 'pending', text: 'à valider' },
      { type: 'text', text: '.' },
    ]);
    expect(stripInline('Voir la [FAQ](/faq) **ici**')).toBe('Voir la FAQ ici');
  });

  it('refuse les liens dangereux', () => {
    expect(isSafeHref('/contact')).toBe(true);
    expect(isSafeHref('https://lasistant.pro')).toBe(true);
    expect(isSafeHref('mailto:contact@lasistant.pro')).toBe(true);
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('data:text/html,<script>')).toBe(false);
    expect(isSafeHref('//site-externe.example')).toBe(false);
  });
});
