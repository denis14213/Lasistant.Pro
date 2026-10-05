import { describe, expect, it } from 'vitest';
import { can, PERMISSION_ROWS, permissionLevel } from './permissions';

describe('droits par rôle', () => {
  it('donne tous les droits à l’administrateur', () => {
    expect(can('administrateur', 'users:manage')).toBe(true);
    expect(can('administrateur', 'settings:manage')).toBe(true);
    expect(can('administrateur', 'email-templates:manage')).toBe(true);
  });

  it('limite l’éditeur aux contenus, en lecture seule sur les demandes', () => {
    expect(can('editeur', 'articles:manage')).toBe(true);
    expect(can('editeur', 'requests:view')).toBe(true);
    expect(can('editeur', 'requests:manage')).toBe(false);
    expect(can('editeur', 'settings:manage')).toBe(false);
  });

  it('limite l’opérateur au traitement des demandes', () => {
    expect(can('operateur', 'requests:manage')).toBe(true);
    expect(can('operateur', 'agenda:manage')).toBe(true);
    expect(can('operateur', 'articles:manage')).toBe(false);
    expect(can('operateur', 'users:manage')).toBe(false);
  });

  it('refuse tout sans rôle', () => {
    expect(can(null, 'dashboard:view')).toBe(false);
    expect(can(undefined, 'dashboard:view')).toBe(false);
  });

  it('calcule les niveaux affichés dans la matrice des droits', () => {
    const requests = PERMISSION_ROWS.find((row) => row.manage === 'requests:manage');
    const documents = PERMISSION_ROWS.find((row) => row.manage === 'private-documents:view');
    if (!requests || !documents) throw new Error('Lignes de la matrice introuvables');
    expect(permissionLevel('operateur', requests)).toEqual({ level: 'complet' });
    expect(permissionLevel('editeur', requests)).toEqual({ level: 'lecture' });
    expect(permissionLevel('operateur', documents)).toEqual({
      level: 'conditionnel',
      note: 'Selon la demande assignée',
    });
    expect(permissionLevel('editeur', documents)).toEqual({ level: 'aucun' });
  });
});
