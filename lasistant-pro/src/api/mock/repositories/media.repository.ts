import type { MediaItem } from '@/types';
import type { MediaRepository } from '../../contracts';
import { DATA_ERROR_MESSAGES, DataError } from '../../errors';
import { createId, mutateTables, readTable } from '../database';
import { simulateRead, simulateWrite } from '../network';

/** Contenu d'une image sous forme d'adresse « data: » (conservée dans le navigateur). */
function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Lecture impossible'));
    reader.readAsDataURL(file);
  });
}

/**
 * Médiathèque (table « media »).
 * Base simulée : les images ajoutées restent dans le navigateur ; le contenu des documents
 * privés n'est pas conservé (seule leur fiche l'est).
 */
export const mediaRepository: MediaRepository = {
  async list() {
    return simulateRead(() => readTable('media').sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async update(id, patch) {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const item = tables.media.find((entry) => entry.id === id);
        if (!item) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        Object.assign(item, patch);
        return item;
      }),
    );
  },

  async add(upload) {
    const url = upload.isPrivate ? '' : await readAsDataUrl(upload.file);
    return simulateWrite(() =>
      mutateTables((tables) => {
        const item: MediaItem = {
          id: createId('media'),
          fileName: upload.fileName,
          kind: upload.isPrivate ? 'document' : 'image',
          image: url,
          title: upload.fileName.replace(/\.[a-z0-9]+$/i, ''),
          altText: '',
          sizeBytes: upload.file.size,
          width: upload.width,
          height: upload.height,
          uploadedBy: upload.uploadedBy,
          createdAt: new Date().toISOString(),
          usedOn: [],
          isPrivate: upload.isPrivate,
          rightsConfirmed: false,
        };
        tables.media.unshift(item);
        return item;
      }),
    );
  },

  async remove(id) {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.media = tables.media.filter((entry) => entry.id !== id);
      }),
    );
  },

  async downloadUrl(item) {
    return item.isPrivate || !item.image ? null : item.image;
  },
};
