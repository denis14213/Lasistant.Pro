import { describe, expect, it } from 'vitest';
import {
  blankLike,
  countDifferences,
  fieldKind,
  fieldLabel,
  getAt,
  isFixedList,
  itemTitle,
  setAt,
} from './content-fields';

describe('éditeur des pages : nature des champs', () => {
  it('reconnaît titres, photos, listes et textes', () => {
    expect(fieldKind('title', { start: 'Soutien', accent: 'en Tunisie' })).toBe('accent');
    expect(fieldKind('image', 'teamMeeting')).toBe('image');
    expect(fieldKind('assistance-medicale', 'familyConsultation', 'rowImages')).toBe('image');
    expect(fieldKind('items', [])).toBe('list');
    expect(fieldKind('label', 'Réserver')).toBe('text');
    expect(fieldKind('lead', 'Court')).toBe('textarea');
    expect(fieldKind('id', 'service')).toBe('hidden');
    expect(fieldKind('type', 'markdown')).toBe('readonly');
  });

  it('nomme les champs en français', () => {
    expect(fieldLabel('eyebrow')).toBe('Surtitre');
    expect(fieldLabel(2)).toBe('Élément 3');
    expect(fieldLabel('insetCaption')).toBe('Légende de la photo secondaire');
  });

  it('fixe la longueur des étapes de réservation', () => {
    expect(isFixedList('reservation', ['steps'])).toBe(true);
    expect(isFixedList('accueil', ['field', 'items'])).toBe(false);
  });
});

describe('éditeur des pages : modifications', () => {
  const content = { hero: { title: 'A', items: [{ id: 'x', title: 'Un', image: 'eyeExam' }] } };

  it('modifie une valeur sans muter le contenu d’origine', () => {
    const next = setAt(content, ['hero', 'items', 0, 'title'], 'Deux');
    expect(getAt(next, ['hero', 'items', 0, 'title'])).toBe('Deux');
    expect(content.hero.items[0]?.title).toBe('Un');
    expect(countDifferences(content, next)).toBe(1);
  });

  it('prépare un nouvel élément vide en gardant photo et identifiant unique', () => {
    const blank = blankLike(content.hero.items[0]);
    expect(blank?.title).toBe('');
    expect(blank?.image).toBe('eyeExam');
    expect(blank?.id).not.toBe('x');
  });

  it('donne un titre lisible aux éléments', () => {
    expect(itemTitle({ question: 'Pourquoi ?' }, 0)).toBe('Pourquoi ?');
    expect(itemTitle({ type: 'markdown', text: '' }, 1)).toBe('Paragraphe');
    expect(itemTitle({}, 4)).toBe('Élément 5');
  });
});
