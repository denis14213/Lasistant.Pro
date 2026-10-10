import { describe, expect, it } from 'vitest';
import { mergeContent } from './content-merge';

describe('mergeContent', () => {
  const defaults = {
    title: { start: 'Bonjour', accent: 'à tous' },
    lead: 'Texte d’origine',
    pending: null as string | null,
    items: [
      { title: 'Un', text: 'Premier' },
      { title: 'Deux', text: 'Second', icon: 'care' },
    ],
  };

  it('conserve le contenu d’origine sans version enregistrée', () => {
    expect(mergeContent(defaults, undefined)).toBe(defaults);
  });

  it('applique les textes enregistrés et complète les champs absents', () => {
    const merged = mergeContent(defaults, { title: { accent: 'à vous' }, lead: 'Nouveau texte' });
    expect(merged.title).toEqual({ start: 'Bonjour', accent: 'à vous' });
    expect(merged.lead).toBe('Nouveau texte');
    expect(merged.items).toEqual(defaults.items);
  });

  it('retient la liste enregistrée et complète chaque élément', () => {
    const merged = mergeContent(defaults, {
      items: [{ title: 'Deux bis' }, { title: 'Un bis', text: 'x' }, { title: 'Trois', text: 'y' }],
    });
    expect(merged.items).toEqual([
      { title: 'Deux bis', text: 'Premier' },
      { title: 'Un bis', text: 'x', icon: 'care' },
      { title: 'Trois', text: 'y', icon: 'care' },
    ]);
  });

  it('ignore une valeur d’un autre type et accepte un texte à la place d’un « null »', () => {
    const merged = mergeContent(defaults, { lead: 42, items: 'pas une liste', pending: 'Complété' });
    expect(merged.lead).toBe('Texte d’origine');
    expect(merged.items).toEqual(defaults.items);
    expect(merged.pending).toBe('Complété');
  });
});
