import type { MediaItem } from '@/types';
import { DATA_ERROR_MESSAGES, DataError } from '../errors';
import { createId, mutateTables, readTable } from '../mock/database';
import { simulateRead, simulateWrite } from '../mock/network';

/** Données d'un fichier téléversé depuis le back-office. */
export interface MediaUpload {
  fileName: string;
  sizeBytes: number;
  url: string;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  isPrivate: boolean;
}

/**
 * Médiathèque (table « media »).
 * Phase statique : les fichiers ajoutés restent dans le navigateur (adresse temporaire).
 */
export const mediaRepository = {
  async list(): Promise<MediaItem[]> {
    return simulateRead(() => readTable('media').sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async update(
    id: string,
    patch: Partial<Pick<MediaItem, 'altText' | 'title' | 'rightsConfirmed'>>,
  ): Promise<MediaItem> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const item = tables.media.find((entry) => entry.id === id);
        if (!item) throw new DataError('not_found', DATA_ERROR_MESSAGES.not_found);
        Object.assign(item, patch);
        return item;
      }),
    );
  },

  async add(upload: MediaUpload): Promise<MediaItem> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        const item: MediaItem = {
          id: createId('media'),
          fileName: upload.fileName,
          kind: upload.isPrivate ? 'document' : 'image',
          image: upload.url,
          title: upload.fileName.replace(/\.[a-z0-9]+$/i, ''),
          altText: '',
          sizeBytes: upload.sizeBytes,
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

  async remove(id: string): Promise<void> {
    return simulateWrite(() =>
      mutateTables((tables) => {
        tables.media = tables.media.filter((entry) => entry.id !== id);
      }),
    );
  },
};
