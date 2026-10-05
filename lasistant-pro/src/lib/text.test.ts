import { describe, expect, it } from 'vitest';
import { suggestEmailCorrection } from './email-suggestion';
import {
  capitalize,
  fillTemplate,
  initials,
  matchesQuery,
  normalizeText,
  pluralize,
  slugify,
  truncate,
} from './text';

describe('outils de texte', () => {
  it('normalise accents et casse pour la recherche', () => {
    expect(normalizeText('  Hébergement ÉTUDIANT ')).toBe('hebergement etudiant');
    expect(matchesQuery('Accompagnement des malades', 'ACCOMPAGNEMENT malades')).toBe(true);
    expect(matchesQuery('Logement', 'hôpital')).toBe(false);
  });

  it('crée des identifiants d’adresse lisibles', () => {
    expect(slugify('Préparer son séjour : l’essentiel !')).toBe('preparer-son-sejour-l-essentiel');
  });

  it('coupe un texte sans couper de mot', () => {
    expect(truncate('Bonjour, je souhaite organiser mon séjour', 20)).toBe('Bonjour, je…');
    expect(truncate('Court', 20)).toBe('Court');
  });

  it('accorde, met en capitale et calcule les initiales', () => {
    expect(pluralize(1, 'demande')).toBe('1 demande');
    expect(pluralize(3, 'demande')).toBe('3 demandes');
    expect(pluralize(2, 'code utilisable', 'codes utilisables')).toBe('2 codes utilisables');
    expect(capitalize('mercredi')).toBe('Mercredi');
    expect(initials('Jean-Marc Kouassi')).toBe('JM');
    expect(initials('Awa Koné')).toBe('AK');
  });

  it('remplace les variables connues et conserve les autres', () => {
    expect(
      fillTemplate('Bonjour [prénom], réf. [référence] [inconnue]', { prénom: 'Awa', référence: 'LP-1' }),
    ).toBe('Bonjour Awa, réf. LP-1 [inconnue]');
  });
});

describe('suggestion de correction des adresses e-mail', () => {
  it('propose le domaine courant le plus proche', () => {
    expect(suggestEmailCorrection('awa@gmial.com')).toBe('awa@gmail.com');
    expect(suggestEmailCorrection('awa@hotmial.fr')).toBe('awa@hotmail.fr');
  });

  it('ne propose rien pour une adresse correcte ou un domaine inconnu', () => {
    expect(suggestEmailCorrection('awa@gmail.com')).toBeNull();
    expect(suggestEmailCorrection('contact@entreprise-tunisienne.tn')).toBeNull();
    expect(suggestEmailCorrection('adresse-incomplete')).toBeNull();
  });
});
