import { describe, expect, it } from 'vitest';
import { emailBodyToText, emailHref, emailInline, parseEmailBody } from './email-markup';

const SITE = 'https://lasistant.pro';

describe('mise en forme du corps des e-mails', () => {
  it('conserve les retours à la ligne et reconnaît listes et boutons', () => {
    expect(
      parseEmailBody(`Bonjour [prénom],
Merci pour votre demande.

- vos dates
- vos besoins
::bouton [Voir le site](https://lasistant.pro)`),
    ).toEqual([
      { type: 'paragraph', lines: ['Bonjour [prénom],', 'Merci pour votre demande.'] },
      { type: 'list', items: ['vos dates', 'vos besoins'] },
      { type: 'button', label: 'Voir le site', href: 'https://lasistant.pro' },
    ]);
  });

  it('remplace les variables sans les confondre avec de l’italique', () => {
    const tokens = emailInline('Nous vous appelons [contact_préféré] le [reçue_le].', {
      contact_préféré: 'par téléphone',
      reçue_le: '2 octobre',
    });
    expect(tokens).toEqual([{ type: 'text', text: 'Nous vous appelons par téléphone le 2 octobre.' }]);
  });

  it('n’interprète jamais la mise en forme contenue dans une valeur', () => {
    const tokens = emailInline('Bonjour [nom]', { nom: '**[Piège](javascript:alert(1))**' });
    expect(tokens).toEqual([{ type: 'text', text: 'Bonjour **[Piège](javascript:alert(1))**' }]);
  });

  it('rend les liens absolus et refuse les destinations dangereuses', () => {
    expect(emailHref('/contact', SITE)).toBe('https://lasistant.pro/contact');
    expect(emailHref('https://exemple.com', SITE)).toBe('https://exemple.com');
    expect(emailHref('javascript:alert(1)', SITE)).toBeNull();
    expect(emailHref('#ancre', SITE)).toBeNull();
  });

  it('produit une version texte lisible', () => {
    const text = emailBodyToText(
      `Bonjour [prénom],

Consultez la [FAQ](/faq) **avant** votre séjour.
- Passeport
::bouton [Réserver](/reservation)`,
      { prénom: 'Awa' },
      SITE,
    );
    expect(text).toBe(
      'Bonjour Awa,\n\nConsultez la FAQ (https://lasistant.pro/faq) avant votre séjour.\n\n• Passeport\n\nRéserver : https://lasistant.pro/reservation',
    );
  });
});
