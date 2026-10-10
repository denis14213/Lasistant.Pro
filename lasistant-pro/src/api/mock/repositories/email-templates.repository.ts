import { customTemplateKey, isSystemTemplate } from '@/emails/catalog';
import type { EmailTemplate, EmailTemplateKey } from '@/types';
import type { EmailTemplatePatch, EmailTemplatesRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { logActivity } from '../activity';
import { createId, mutateTables, readTable } from '../database';
import { simulateRead, simulateWrite } from '../network';

/**
 * Modèles d'e-mails (messages automatiques et réponses standards).
 * Les modèles fournis avec le site ne peuvent pas être supprimés ; les réponses
 * standards ajoutées par l'équipe, si.
 */
export const emailTemplatesRepository: EmailTemplatesRepository = {
  async list(): Promise<EmailTemplate[]> {
    return simulateRead(() => readTable('emailTemplates'));
  },

  async getByKey(key: EmailTemplateKey): Promise<EmailTemplate> {
    return simulateRead(() => {
      const template = readTable('emailTemplates').find((item) => item.key === key);
      if (!template) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return template;
    });
  },

  async update(id: string, patch: EmailTemplatePatch, actor: string): Promise<EmailTemplate> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const template = tables.emailTemplates.find((item) => item.id === id);
        if (!template) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        // Le nom des modèles fournis avec le site est fixe : il décrit leur déclencheur.
        const { name, ...rest } = patch;
        Object.assign(template, rest, isSystemTemplate(template.key) || name === undefined ? {} : { name }, {
          updatedAt: new Date().toISOString(),
        });
        logActivity(tables, actor, `Modèle d’e-mail « ${template.name} » modifié`, 'settings');
        return template;
      }),
    );
  },

  /** Nouvelle réponse standard, proposée ensuite dans la fiche des demandes. */
  async create(name: string, actor: string): Promise<EmailTemplate> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const id = createId('tpl');
        const template: EmailTemplate = {
          id,
          key: customTemplateKey(id.replace(/^tpl-/, '')),
          name,
          trigger: 'Envoi manuel',
          kind: 'manuel',
          audience: 'demandeur',
          subject: 'Votre demande [référence]',
          heading: '',
          body: 'Bonjour [prénom],\n\n\n\nL’équipe LASISTANT.PRO',
          senderName: 'LASISTANT.PRO',
          replyTo: tables.emailTemplates[0]?.replyTo ?? '',
          active: true,
          updatedAt: new Date().toISOString(),
        };
        tables.emailTemplates.push(template);
        logActivity(tables, actor, `Modèle d’e-mail « ${name} » créé`, 'settings');
        return template;
      }),
    );
  },

  async remove(id: string, actor: string): Promise<void> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const template = tables.emailTemplates.find((item) => item.id === id);
        if (!template) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        if (isSystemTemplate(template.key)) {
          throw new DataError('forbidden', 'Les modèles fournis avec le site ne peuvent pas être supprimés.');
        }
        tables.emailTemplates = tables.emailTemplates.filter((item) => item.id !== id);
        logActivity(tables, actor, `Modèle d’e-mail « ${template.name} » supprimé`, 'settings');
      }),
    );
  },
};
