import { slugify } from '@/lib/text';
import type { Service } from '@/types';
import type { ServiceListParams, ServicesRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { createId, mutateTables, readTable } from '../database';
import { simulateRead, simulateWrite } from '../network';

const bySortOrder = (a: Service, b: Service) => a.sortOrder - b.sortOrder;

/**
 * Services proposés (table « services »).
 */
export const servicesRepository: ServicesRepository = {
  async list({ includeInactive = false, kind }: ServiceListParams = {}): Promise<Service[]> {
    return simulateRead(() =>
      readTable('services')
        .filter((service) => (includeInactive || service.active) && (!kind || service.kind === kind))
        .sort(bySortOrder),
    );
  },

  async getBySlug(slug: string): Promise<Service> {
    return simulateRead(() => {
      const service = readTable('services').find((item) => item.slug === slug);
      if (!service) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
      return service;
    });
  },

  async update(id: string, patch: Partial<Service>, actor: string): Promise<Service> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const service = tables.services.find((item) => item.id === id);
        if (!service) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        Object.assign(service, patch, { updatedAt: new Date().toISOString(), updatedBy: actor });
        return service;
      }),
    );
  },

  /**
   * Nouveau service proposé dans la réservation en ligne.
   * Les pages de service du site ont une mise en page dédiée : un nouveau service rejoint
   * d'abord le formulaire de réservation, sa page pourra être créée ensuite.
   */
  async create(title: string, actor: string): Promise<Service> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const slug = slugify(title);
        if (tables.services.some((item) => item.slug === slug)) {
          throw new DataError('validation', 'Un service porte déjà ce nom.');
        }
        const now = new Date().toISOString();
        const service: Service = {
          id: createId('svc'),
          slug,
          kind: 'reservation',
          title: title.trim(),
          subtitle: 'Nouveau service',
          summary: 'Description à rédiger.',
          description: '',
          highlights: [],
          details: [],
          audiences: [],
          icon: 'conversation',
          iconTone: 'brand',
          image: 'teamMeeting',
          imageAlt: '',
          ctaLabel: 'Réserver un échange',
          ctaHref: `/reservation?service=${slug}`,
          active: false,
          showInMenu: false,
          showMedicalDisclaimer: false,
          sortOrder: Math.max(0, ...tables.services.map((item) => item.sortOrder)) + 1,
          seo: { title: title.trim(), description: '' },
          updatedAt: now,
          updatedBy: actor,
        };
        tables.services.push(service);
        return service;
      }),
    );
  },

  /** Déplace un service d'un rang vers le haut ou vers le bas (ordre d'affichage). */
  async move(id: string, direction: 'up' | 'down'): Promise<Service[]> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const ordered = [...tables.services].sort(bySortOrder);
        const index = ordered.findIndex((item) => item.id === id);
        const target = direction === 'up' ? index - 1 : index + 1;
        const current = ordered[index];
        const swapWith = ordered[target];
        if (current && swapWith) {
          [current.sortOrder, swapWith.sortOrder] = [swapWith.sortOrder, current.sortOrder];
        }
        return [...tables.services].sort(bySortOrder);
      }),
    );
  },
};
