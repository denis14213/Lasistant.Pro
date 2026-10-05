import { createArticlesSeed } from '@/content/articles';
import { createCategoriesSeed } from '@/content/categories';
import { createBookingsSeed } from '@/content/demo/bookings';
import { createEmailTemplatesSeed } from '@/content/demo/email-templates';
import { createMediaSeed } from '@/content/demo/media';
import { createActivitySeed, createSessionsSeed, createTeamSeed } from '@/content/demo/team';
import { createFaqSeed } from '@/content/faq';
import { createServicesSeed } from '@/content/services';
import { createSiteSettingsSeed } from '@/content/site-settings';
import { uniqueId } from '@/lib/ids';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import type {
  AccountSession,
  ActivityEntry,
  AdminUser,
  Article,
  Booking,
  BookingEvent,
  Category,
  EmailTemplate,
  FaqItem,
  InternalNote,
  MediaItem,
  Service,
  SiteSettings,
} from '@/types';

/**
 * Base de données simulée de la phase statique.
 *
 * Les « tables » reprennent le modèle de données du cahier des charges (§ 9).
 * Elles sont amorcées avec les contenus de `src/content`, puis conservées dans le
 * stockage local du navigateur : une demande envoyée depuis le site apparaît donc
 * réellement dans le back-office, et une coordonnée modifiée dans le back-office
 * se retrouve dans le pied de page.
 *
 * En phase 2, ce module disparaît : les dépôts (`api/repositories`) interrogeront Supabase.
 */

export interface MockTables {
  settings: SiteSettings;
  services: Service[];
  articles: Article[];
  categories: Category[];
  faq: FaqItem[];
  bookings: Booking[];
  bookingEvents: BookingEvent[];
  notes: InternalNote[];
  users: AdminUser[];
  /** Sessions ouvertes sur d'autres appareils */
  sessions: AccountSession[];
  /** Journal des actions sensibles de l'équipe */
  activity: ActivityEntry[];
  media: MediaItem[];
  emailTemplates: EmailTemplate[];
}

interface StoredDatabase {
  version: number;
  seededAt: string;
  tables: MockTables;
}

const STORAGE_KEY = 'lp-demo-db';
/** À incrémenter à chaque évolution de structure : les données locales sont alors régénérées. */
const DATABASE_VERSION = 5;

let cache: StoredDatabase | null = null;

function createSeed(now = new Date()): StoredDatabase {
  const { bookings, events, notes } = createBookingsSeed(now);
  return {
    version: DATABASE_VERSION,
    seededAt: now.toISOString(),
    tables: {
      settings: createSiteSettingsSeed(now),
      services: createServicesSeed(now),
      articles: createArticlesSeed(now),
      categories: createCategoriesSeed(),
      faq: createFaqSeed(),
      bookings,
      bookingEvents: events,
      notes,
      users: createTeamSeed(now),
      sessions: createSessionsSeed(now),
      activity: createActivitySeed(now),
      media: createMediaSeed(now),
      emailTemplates: createEmailTemplatesSeed(now),
    },
  };
}

function load(): StoredDatabase {
  if (cache) return cache;
  const stored = readStorage<StoredDatabase | null>(STORAGE_KEY, null);
  cache = stored && stored.version === DATABASE_VERSION ? stored : createSeed();
  writeStorage(STORAGE_KEY, cache);
  return cache;
}

/** Copie profonde : les composants ne peuvent jamais modifier la base par mégarde. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Lecture d'une table (copie). */
export function readTable<K extends keyof MockTables>(table: K): MockTables[K] {
  return clone(load().tables[table]);
}

/** Modification de la base, puis persistance dans le navigateur. */
export function mutateTables<T>(change: (tables: MockTables) => T): T {
  const database = load();
  const result = change(database.tables);
  writeStorage(STORAGE_KEY, database);
  return clone(result);
}

/** Réinitialise les données de démonstration (bouton du back-office et tests). */
export function resetDatabase(): void {
  removeStorage(STORAGE_KEY);
  cache = createSeed();
  writeStorage(STORAGE_KEY, cache);
}

/** Export complet des données (sauvegarde téléchargeable). */
export function exportDatabase(): string {
  return JSON.stringify(load(), null, 2);
}

/** Restauration d'une sauvegarde exportée ; renvoie false si le fichier n'est pas reconnu. */
export function importDatabase(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<StoredDatabase>;
    if (parsed.version !== DATABASE_VERSION || !parsed.tables || !Array.isArray(parsed.tables.bookings))
      return false;
    cache = {
      version: DATABASE_VERSION,
      seededAt: parsed.seededAt ?? new Date().toISOString(),
      tables: parsed.tables,
    };
    writeStorage(STORAGE_KEY, cache);
    return true;
  } catch {
    return false;
  }
}

/** Date d'amorçage des données (affichée dans le back-office). */
export function getSeedDate(): string {
  return load().seededAt;
}

/** Identifiant unique lisible pour les nouveaux enregistrements. */
export const createId = uniqueId;
