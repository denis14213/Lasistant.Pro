import { describe, expect, it } from 'vitest';
import { changePasswordSchema, emailTemplateSchema, inviteUserSchema } from './admin-forms';
import { contactSchema, housingSearchSchema, quickRequestSchema } from './public-forms';

/** Premier message d'erreur associé à un champ. */
function errorFor(
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } },
  field: string,
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

const validQuickRequest = {
  fullName: 'Awa Koné',
  phone: '+225 01 23 45 67 89',
  email: 'awa.kone@exemple.com',
  serviceId: 'assistance-medicale',
  message: '',
  consent: true,
  website: '',
};

describe('formulaires publics', () => {
  it('accepte une demande rapide complète', () => {
    expect(quickRequestSchema.safeParse(validQuickRequest).success).toBe(true);
  });

  it('explique chaque champ invalide de la demande rapide', () => {
    const result = quickRequestSchema.safeParse({
      ...validQuickRequest,
      phone: '0123',
      email: 'awa@',
      consent: false,
    });
    expect(result.success).toBe(false);
    expect(errorFor(result, 'phone')).toMatch(/indicatif/);
    expect(errorFor(result, 'email')).toBeDefined();
    expect(errorFor(result, 'consent')).toMatch(/politique de confidentialité/);
  });

  it('refuse un départ antérieur à l’arrivée pour une recherche de logement', () => {
    const result = housingSearchSchema.safeParse({
      profile: 'etudiant',
      zone: 'Tunis',
      arrivalDate: '2026-11-10',
      departureDate: '2026-11-01',
      housingType: 'studio',
      persons: 1,
      budgetAmount: '600',
      budgetCurrency: 'TND',
      budgetPeriod: 'mois',
      needs: '',
      fullName: 'Karim Ben Salah',
      phoneCountry: '+216',
      phoneNumber: '54 479 391',
      email: 'karim@exemple.com',
      consent: true,
      website: '',
    });
    expect(errorFor(result, 'departureDate')).toMatch(/postérieure/);
  });

  it('exige un message d’au moins 10 caractères pour le contact', () => {
    const result = contactSchema.safeParse({
      subject: 'information',
      fullName: 'Awa Koné',
      email: 'awa.kone@exemple.com',
      phone: '',
      profile: '',
      message: 'Bonjour',
      consent: true,
      website: '',
    });
    expect(errorFor(result, 'message')).toMatch(/10 caractères/);
  });
});

describe('formulaires du back-office', () => {
  it('n’invite que des adresses professionnelles', () => {
    expect(inviteUserSchema.safeParse({ email: 'nouveau@lasistant.pro', role: 'operateur' }).success).toBe(
      true,
    );
    expect(
      errorFor(inviteUserSchema.safeParse({ email: 'nouveau@gmail.com', role: 'operateur' }), 'email'),
    ).toMatch(/@lasistant\.pro/);
  });

  it('impose un mot de passe robuste, confirmé à l’identique', () => {
    const weak = changePasswordSchema.safeParse({
      current: 'x',
      password: 'motdepasse',
      confirmation: 'motdepasse',
    });
    expect(errorFor(weak, 'password')).toMatch(/règles de sécurité/);
    const mismatch = changePasswordSchema.safeParse({
      current: 'x',
      password: 'Lasistant2027!',
      confirmation: 'Lasistant2028!',
    });
    expect(errorFor(mismatch, 'confirmation')).toMatch(/ne correspondent pas/);
    expect(
      changePasswordSchema.safeParse({
        current: 'x',
        password: 'Lasistant2027!',
        confirmation: 'Lasistant2027!',
      }).success,
    ).toBe(true);
  });

  it('valide les modèles d’e-mails', () => {
    const template = {
      name: 'Confirmation',
      senderName: 'LASISTANT.PRO',
      replyTo: 'imassist.service@hotmail.com',
      subject: 'Votre demande [référence]',
      heading: '',
      body: 'Bonjour [prénom], merci pour votre demande.',
      active: true,
    };
    expect(emailTemplateSchema.safeParse(template).success).toBe(true);
    expect(errorFor(emailTemplateSchema.safeParse({ ...template, body: 'Trop court' }), 'body')).toMatch(
      /20 caractères/,
    );
    expect(
      errorFor(emailTemplateSchema.safeParse({ ...template, replyTo: 'adresse' }), 'replyTo'),
    ).toBeDefined();
  });
});
