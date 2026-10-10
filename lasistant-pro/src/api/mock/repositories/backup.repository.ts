import type { BackupRepository } from '../../contracts';
import { DataError } from '../../errors';
import { exportDatabase, importDatabase } from '../database';

/**
 * Sauvegarde et restauration de la base simulée (fichier JSON).
 */
export const backupRepository: BackupRepository = {
  async export() {
    return exportDatabase();
  },

  async restore(json) {
    if (!importDatabase(json)) {
      throw new DataError('validation', 'Ce fichier n’est pas une sauvegarde valide de LASISTANT.PRO.');
    }
  },
};
