import { PAGE_DEFAULTS, PAGE_KEYS, type PageContents, type PageKey } from '@/content/pages';
import { mergeContent } from '@/lib/content-merge';
import type { PagesRepository } from '../../contracts';
import { DataError } from '../../errors';
import { getSupabase } from '../client';
import type { Json } from '../database.types';
import { ensureOk, guard, toDataError } from '../errors';

/** Table absente : la migration « page_contents » n'est pas encore appliquée à la base. */
const MISSING_TABLE_CODES = new Set(['PGRST205', '42P01']);
let missingTableReported = false;
const MIGRATION_PENDING =
  'L’enregistrement des pages n’est pas encore activé : la mise à jour de la base de données « contenus des pages » doit d’abord être appliquée. Le site affiche les contenus d’origine.';

function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(PAGE_DEFAULTS, value);
}

/**
 * Contenus des pages du site (table « page_contents »), modifiables depuis le back-office.
 * Lecture publique ; écriture par les éditeurs et les administrateurs (règles RLS).
 */
export const pagesRepository: PagesRepository = {
  async getAll() {
    const result = await guard(() => getSupabase().from('page_contents').select('key, content'));
    if (result.error) {
      if (!MISSING_TABLE_CODES.has(result.error.code)) throw toDataError(result.error);
      if (!missingTableReported) {
        missingTableReported = true;
        console.warn(
          'Table « page_contents » absente : contenus d’origine affichés (migration à appliquer).',
        );
      }
    }
    const stored = new Map((result.data ?? []).map((row) => [row.key, row.content]));
    return Object.fromEntries(
      PAGE_KEYS.map((key) => [key, mergeContent(PAGE_DEFAULTS[key], stored.get(key))]),
    ) as PageContents;
  },

  async list() {
    const result = await guard(() =>
      getSupabase().from('page_contents').select('key, updated_at, updated_by'),
    );
    if (result.error && !MISSING_TABLE_CODES.has(result.error.code)) throw toDataError(result.error);
    const rows = new Map(
      (result.data ?? []).filter((row) => isPageKey(row.key)).map((row) => [row.key, row]),
    );
    return PAGE_KEYS.map((key) => ({
      key,
      updatedAt: rows.get(key)?.updated_at ?? null,
      updatedBy: rows.get(key)?.updated_by ?? null,
    }));
  },

  /** L'auteur et la date sont fixés par la base ; la modification est consignée au journal. */
  async update(key, content) {
    const result = await guard(() =>
      getSupabase()
        .from('page_contents')
        .upsert({ key, content: content as unknown as Json }, { onConflict: 'key' }),
    );
    if (result.error && MISSING_TABLE_CODES.has(result.error.code))
      throw new DataError('server', MIGRATION_PENDING);
    ensureOk(result);
  },
};
