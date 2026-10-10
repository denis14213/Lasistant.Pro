import type {
  AccountActivity,
  AccountSession,
  AdminRole,
  AdminUser,
  AuthSession,
  Article,
  Booking,
  BookingConfirmation,
  BookingEvent,
  BookingInput,
  BookingStatus,
  Category,
  EmailTemplate,
  EmailTemplateKey,
  FaqCategory,
  FaqItem,
  InternalNote,
  InvitationResult,
  MediaItem,
  NotificationPreferences,
  Service,
  ServiceKind,
  SiteSettings,
  TwoFactorEnrollment,
} from '@/types';
import type { PageContents, PageKey } from '@/content/pages';

/**
 * Contrats de la couche de données (« ports »).
 *
 * Les composants ne connaissent que ces interfaces. Deux implémentations les respectent :
 * - `supabase/` : la base de données de production (API REST, fonctions RPC, stockage, Auth) ;
 * - `mock/` : une base simulée dans le navigateur, réservée aux tests automatisés.
 *
 * Toute erreur est une `DataError` dont le message est affichable tel quel.
 * Le paramètre `actor` (nom de la personne connectée) n'est utilisé que par la base simulée :
 * en production, l'auteur d'une action est déterminé par le serveur à partir de la session.
 */

/** Données saisies dans l'éditeur d'article. */
export type ArticleDraft = Omit<
  Article,
  'id' | 'updatedAt' | 'author' | 'publishedAt' | 'readingMinutes' | 'tags' | 'featured'
> & {
  id?: string;
};

/** Champs d'un modèle d'e-mail modifiables depuis le back-office. */
export type EmailTemplatePatch = Partial<
  Pick<EmailTemplate, 'name' | 'subject' | 'heading' | 'body' | 'senderName' | 'replyTo' | 'active'>
>;

/** Fichier ajouté à la médiathèque (image déjà optimisée, ou document privé). */
export interface MediaUpload {
  file: Blob;
  fileName: string;
  width: number | null;
  height: number | null;
  isPrivate: boolean;
  uploadedBy: string;
}

export interface ServiceListParams {
  /** Inclure les services désactivés (back-office) */
  includeInactive?: boolean;
  kind?: ServiceKind;
}

export interface SettingsRepository {
  get(): Promise<SiteSettings>;
  update(patch: Partial<SiteSettings>, actor: string): Promise<SiteSettings>;
}

export interface ServicesRepository {
  list(params?: ServiceListParams): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service>;
  update(id: string, patch: Partial<Service>, actor: string): Promise<Service>;
  create(title: string, actor: string): Promise<Service>;
  move(id: string, direction: 'up' | 'down'): Promise<Service[]>;
}

export interface ArticlesRepository {
  listPublished(): Promise<Article[]>;
  getPublishedBySlug(slug: string): Promise<Article>;
  listAll(): Promise<Article[]>;
  getById(id: string): Promise<Article>;
  save(draft: ArticleDraft, author: string): Promise<Article>;
  remove(id: string): Promise<void>;
}

export interface CategoriesRepository {
  list(includeInactive?: boolean): Promise<Category[]>;
  create(name: string): Promise<Category>;
  setActive(id: string, active: boolean): Promise<Category>;
}

export interface FaqRepository {
  list(): Promise<{ categories: FaqCategory[]; items: FaqItem[] }>;
}

export interface BookingsRepository {
  list(): Promise<Booking[]>;
  getById(id: string): Promise<Booking>;
  /** Récapitulatif public : la référence et la clé secrète de la demande sont exigées. */
  getConfirmation(reference: string, key: string): Promise<BookingConfirmation | null>;
  /** Créneaux déjà pris : seules la date et l'heure sont exposées, jamais l'identité. */
  listTakenSlots(): Promise<Array<{ date: string; time: string }>>;
  /** Demande envoyée depuis le site (contrôles et limitation d'envoi côté serveur). */
  create(input: BookingInput): Promise<Booking>;
  /** Dépose la pièce jointe d'une demande dans le stockage privé ; renvoie son chemin. */
  uploadAttachment(file: File): Promise<string | null>;
  /** Lien temporaire vers une pièce jointe (équipe uniquement). */
  attachmentUrl(path: string): Promise<string | null>;
  createFromTeam(input: BookingInput, actor: string, status?: BookingStatus): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus, actor: string): Promise<Booking>;
  assign(id: string, assignee: { id: string; name: string } | null, actor: string): Promise<Booking>;
  markViewed(id: string, actor: string): Promise<void>;
  listEvents(bookingId: string): Promise<BookingEvent[]>;
  listNotes(bookingId: string): Promise<InternalNote[]>;
  addNote(bookingId: string, text: string, author: string): Promise<InternalNote>;
  logReply(bookingId: string, subject: string, recipient: string, actor: string): Promise<BookingEvent>;
}

export interface TeamRepository {
  list(): Promise<AdminUser[]>;
  invite(email: string, role: AdminRole, actor: string): Promise<InvitationResult>;
  resendInvitation(id: string, actor: string): Promise<InvitationResult>;
  update(id: string, patch: Partial<Pick<AdminUser, 'active' | 'role'>>, actor: string): Promise<AdminUser>;
}

export interface AccountRepository {
  get(userId: string): Promise<AdminUser>;
  /** Le changement d'adresse est confirmé par e-mail avant d'être appliqué. */
  updateProfile(userId: string, profile: { name: string; email: string }): Promise<AdminUser>;
  updateNotifications(userId: string, patch: Partial<NotificationPreferences>): Promise<AdminUser>;
  changePassword(userId: string, current: string, next: string): Promise<AdminUser>;
  /** Prépare l'application d'authentification (QR code et clé de configuration). */
  startTwoFactor(userId: string): Promise<TwoFactorEnrollment>;
  /** Active la double authentification après vérification d'un premier code. */
  confirmTwoFactor(userId: string, factorId: string, code: string): Promise<AdminUser>;
  disableTwoFactor(userId: string): Promise<AdminUser>;
  /** Nouveaux codes de secours : affichés une seule fois, les anciens deviennent inutilisables. */
  regenerateRecoveryCodes(userId: string): Promise<string[]>;
  listSessions(userId: string): Promise<AccountSession[]>;
  /** Déconnecte une session, ou toutes les autres sessions si aucun identifiant n'est donné. */
  revokeSessions(userId: string, sessionId?: string): Promise<void>;
  activity(userId: string): Promise<AccountActivity[]>;
}

export interface MediaRepository {
  list(): Promise<MediaItem[]>;
  update(
    id: string,
    patch: Partial<Pick<MediaItem, 'altText' | 'title' | 'rightsConfirmed'>>,
  ): Promise<MediaItem>;
  add(upload: MediaUpload): Promise<MediaItem>;
  remove(id: string): Promise<void>;
  /** Lien de téléchargement (temporaire pour un document privé), ou null s'il n'existe pas. */
  downloadUrl(item: MediaItem): Promise<string | null>;
}

export interface EmailTemplatesRepository {
  list(): Promise<EmailTemplate[]>;
  getByKey(key: EmailTemplateKey): Promise<EmailTemplate>;
  update(id: string, patch: EmailTemplatePatch, actor: string): Promise<EmailTemplate>;
  create(name: string, actor: string): Promise<EmailTemplate>;
  remove(id: string, actor: string): Promise<void>;
}

/** Version enregistrée d'une page (liste « Pages du site »). */
export interface PageRecord {
  key: PageKey;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PagesRepository {
  /** Contenus de toutes les pages, complétés par la structure d'origine (toujours complets). */
  getAll(): Promise<PageContents>;
  /** Dates et auteurs des dernières modifications. */
  list(): Promise<PageRecord[]>;
  update<K extends PageKey>(key: K, content: PageContents[K], actor: string): Promise<void>;
}

export interface BackupRepository {
  /** Sauvegarde complète au format JSON (fichier téléchargé par l'administrateur). */
  export(): Promise<string>;
  /** Restaure les contenus et réglages d'une sauvegarde (les demandes reçues ne sont jamais écrasées). */
  restore(json: string): Promise<void>;
}

/** Ensemble des dépôts fournis par une source de données. */
export interface DataSource {
  settingsRepository: SettingsRepository;
  servicesRepository: ServicesRepository;
  articlesRepository: ArticlesRepository;
  categoriesRepository: CategoriesRepository;
  faqRepository: FaqRepository;
  bookingsRepository: BookingsRepository;
  teamRepository: TeamRepository;
  accountRepository: AccountRepository;
  mediaRepository: MediaRepository;
  emailTemplatesRepository: EmailTemplatesRepository;
  pagesRepository: PagesRepository;
  backupRepository: BackupRepository;
}

// ---------------------------------------------------------------------------
// Authentification du back-office
// ---------------------------------------------------------------------------

/** Résultat de la vérification du mot de passe (le verrouillage est géré par l'interface). */
export type SignInOutcome =
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'two-factor' }
  | { status: 'invalid' }
  | { status: 'inactive' };

/** Lien reçu par e-mail : réinitialisation du mot de passe ou invitation à rejoindre l'équipe. */
export type ResetLinkKind = 'recovery' | 'invite';

export type PasswordResetOutcome =
  { ok: true } | { ok: false; reason: 'expired' | 'rejected'; message: string };

export interface AuthBackend {
  /** « remember » : conserver la session sur l'appareil (sinon, seulement dans l'onglet). */
  signIn(email: string, password: string, remember: boolean): Promise<SignInOutcome>;
  verifyTwoFactor(code: string): Promise<AuthSession | null>;
  /** Code de secours : la double authentification est retirée et devra être reconfigurée. */
  redeemRecoveryCode(code: string): Promise<AuthSession | null>;
  /** Réponse identique que le compte existe ou non (pas d'énumération des comptes). */
  requestPasswordReset(email: string): Promise<void>;
  /** Nature du lien par lequel l'écran « Nouveau mot de passe » a été ouvert, ou null s'il n'est plus valable. */
  checkResetLink(): Promise<ResetLinkKind | null>;
  completePasswordReset(password: string): Promise<PasswordResetOutcome>;
  signOut(): Promise<void>;
  /** Une session serveur est-elle enregistrée dans ce navigateur ? (lecture synchrone) */
  hasActiveSession(): boolean;
  /** Prévient quand la session serveur se termine (expiration, déconnexion à distance). */
  onSignedOut(listener: () => void): () => void;
}

/** Outils de la base simulée (bandeau « Données de démonstration »), absents en production. */
export interface DemoTools {
  reset(): void;
  seededAt(): string;
  credentials: { emails: string[]; password: string; twoFactorCode: string };
}
