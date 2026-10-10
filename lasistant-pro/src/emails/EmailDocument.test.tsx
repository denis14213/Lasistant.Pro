import { describe, expect, it } from 'vitest';
import { createEmailTemplatesSeed } from '@/content/demo/email-templates';
import { createServicesSeed } from '@/content/services';
import { createSiteSettingsSeed } from '@/content/site-settings';
import { previewData } from '@/features/admin/emails/email-preview-data';
import { EmailDocument } from './EmailDocument';
import { emailEnvelope } from './registry';
import { renderEmailHtml } from './render';

const SITE = 'https://lasistant.pro';
const settings = createSiteSettingsSeed();
const services = createServicesSeed();

describe('gabarits des e-mails', () => {
  const templates = createEmailTemplatesSeed();

  it.each(templates.map((template) => [template.name, template] as const))(
    '« %s » se rend sans variable oubliée',
    (_, template) => {
      const { context, values } = previewData(template.key, settings, services, SITE);
      const { subject } = emailEnvelope(template, values, context);
      const html = renderEmailHtml(
        <EmailDocument content={template} values={values} context={context} withEnvelope />,
        subject,
      );

      expect(html.startsWith('<!doctype html>')).toBe(true);
      // Toutes les variables du modèle ont été remplacées par les valeurs de l'exemple.
      expect(html).not.toMatch(
        /\[(prénom|nom|référence|service|date|jour|heure|contact_préféré|reçue_le|origine|invitant|rôle)\]/,
      );
      expect(html).toContain(`<title>${subject}</title>`);
      // Aucun lien relatif : les messageries ne connaissent pas l'adresse du site.
      expect(html).not.toMatch(/href="\/(?!\/)/);
      expect(html).not.toContain('rel="preload"');
    },
  );

  it('adresse la notification interne aux adresses configurées', () => {
    const template = templates.find((item) => item.key === 'notification-equipe');
    if (!template) throw new Error('Modèle introuvable');
    const { context, values } = previewData(template.key, settings, services, SITE);
    const envelope = emailEnvelope(template, values, context);
    expect(envelope.to).toBe('imassist.service@hotmail.com');
    expect(envelope.subject).toBe('[Nouvelle demande] LP-2026-0148 · Assistance médicale · Awa Koné');
  });

  it('envoie les e-mails de sécurité depuis l’adresse dédiée', () => {
    const template = templates.find((item) => item.key === 'reinitialisation-mot-de-passe');
    if (!template) throw new Error('Modèle introuvable');
    const { context, values } = previewData(template.key, settings, services, SITE);
    expect(emailEnvelope(template, values, context).from).toBe(
      'Back-office LASISTANT.PRO <securite@adbm-school.com>',
    );
  });

  it('n’inclut l’enveloppe (De, À, Objet) que dans l’aperçu', () => {
    const template = templates[0];
    if (!template) throw new Error('Modèle introuvable');
    const { context, values } = previewData(template.key, settings, services, SITE);
    const sent = renderEmailHtml(
      <EmailDocument content={template} values={values} context={context} />,
      'Test',
    );
    expect(sent).not.toContain('Objet :');
  });
});
