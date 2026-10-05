import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ArrowUpIcon,
  BellIcon,
  BellRingingIcon,
  CalendarCheckIcon,
  ChatCenteredTextIcon,
  ChatCircleDotsIcon,
  CircleHalfIcon,
  ClockCountdownIcon,
  CopySimpleIcon,
  CursorClickIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DownloadSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  IdentificationCardIcon,
  ImageIcon,
  ImagesIcon,
  LinkSimpleBreakIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MonitorIcon,
  NewspaperIcon,
  NotePencilIcon,
  ParagraphIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  QuotesIcon,
  ScalesIcon,
  SealCheckIcon,
  ShieldWarningIcon,
  SignInIcon,
  SignOutIcon,
  SignpostIcon,
  SquaresFourIcon,
  StackIcon,
  TextAaIcon,
  TextBIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TrayIcon,
  UserCheckIcon,
  UserGearIcon,
  UserPlusIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { defineIcon } from './icon-factory';

/**
 * Icônes réservées au back-office (docs/icones.md) : éditeurs, droits, appareils, historique…
 * Importées uniquement par les pages et composants du back-office, elles ne pèsent pas sur le site public.
 */

/* ------------------------------------------------------------------------------------------ */
/* Navigation et structure : simples, discrètes, immédiatement comprises                        */
/* ------------------------------------------------------------------------------------------ */
/** Monter un élément dans un ordre d'affichage. */
export const IconMoveUp = defineIcon(ArrowUpIcon, 'move-up');
/** Descendre un élément dans un ordre d'affichage. */
export const IconMoveDown = defineIcon(ArrowDownIcon, 'move-down');
/** Tableau de bord du back-office. */
export const IconDashboard = defineIcon(SquaresFourIcon, 'dashboard');

/* ------------------------------------------------------------------------------------------ */
/* Temps et rendez-vous                                                                         */
/* ------------------------------------------------------------------------------------------ */
/** Rendez-vous confirmé. */
export const IconCalendarConfirmed = defineIcon(CalendarCheckIcon, 'calendar-confirmed');
/** Session expirée. */
export const IconExpired = defineIcon(ClockCountdownIcon, 'expired');

/* ------------------------------------------------------------------------------------------ */
/* Actions : dessins universels                                                                 */
/* ------------------------------------------------------------------------------------------ */
export const IconEdit = defineIcon(PencilSimpleIcon, 'edit');
export const IconArchive = defineIcon(ArchiveIcon, 'archive');
export const IconCopy = defineIcon(CopySimpleIcon, 'copy');
export const IconDownload = defineIcon(DownloadSimpleIcon, 'download');
export const IconFilter = defineIcon(FunnelSimpleIcon, 'filter');
/** Aperçu, afficher. */
export const IconPreview = defineIcon(EyeIcon, 'preview');
/** Masquer (mot de passe). */
export const IconHide = defineIcon(EyeSlashIcon, 'hide');
/** Rétablir la version d'origine. */
export const IconRestore = defineIcon(ArrowCounterClockwiseIcon, 'restore');
export const IconUndo = defineIcon(ArrowUUpLeftIcon, 'undo');
export const IconRedo = defineIcon(ArrowUUpRightIcon, 'redo');
/** Lien expiré ou invalide. */
export const IconHyperlinkBroken = defineIcon(LinkSimpleBreakIcon, 'hyperlink-broken');
/** Bloquer, refuser, exclure. */
export const IconBlock = defineIcon(ProhibitIcon, 'block');
export const IconSignIn = defineIcon(SignInIcon, 'sign-in');
export const IconSignOut = defineIcon(SignOutIcon, 'sign-out');

/* ------------------------------------------------------------------------------------------ */
/* Contenus et back-office                                                                      */
/* ------------------------------------------------------------------------------------------ */
export const IconImage = defineIcon(ImageIcon, 'image');
/** Médiathèque, galerie. */
export const IconImages = defineIcon(ImagesIcon, 'images');
/** Demandes reçues. */
export const IconInbox = defineIcon(TrayIcon, 'inbox');
export const IconNotification = defineIcon(BellIcon, 'notification');
/** Rappel, notification envoyée à l'équipe. */
export const IconReminder = defineIcon(BellRingingIcon, 'reminder');
/** Espace infos, articles. */
export const IconArticles = defineIcon(NewspaperIcon, 'articles');
/** Catalogue des services. */
export const IconServices = defineIcon(StackIcon, 'services');
/** Note interne. */
export const IconNote = defineIcon(NotePencilIcon, 'note');
/** Message rédigé librement. */
export const IconMessage = defineIcon(ChatCenteredTextIcon, 'message');
/** Demande de précision : un message qui attend une réponse. */
export const IconQuestion = defineIcon(ChatCircleDotsIcon, 'question');
/** Changement de statut d'une demande : un cercle à moitié rempli, comme une progression. */
export const IconStatus = defineIcon(CircleHalfIcon, 'status');
/** Confirmation envoyée. */
export const IconConfirmation = defineIcon(SealCheckIcon, 'confirmation');
export const IconUsers = defineIcon(UsersIcon, 'users');
export const IconUserAdd = defineIcon(UserPlusIcon, 'user-add');
/** Rôle et permissions d'un utilisateur. */
export const IconUserRole = defineIcon(UserGearIcon, 'user-role');
/** Demande attribuée à un membre de l'équipe. */
export const IconAssigned = defineIcon(UserCheckIcon, 'assigned');
/** Identité et coordonnées de l'organisation. */
export const IconIdentity = defineIcon(IdentificationCardIcon, 'identity');
export const IconSettings = defineIcon(GearSixIcon, 'settings');
/** Mentions légales. */
export const IconLegal = defineIcon(ScalesIcon, 'legal');
export const IconDesktop = defineIcon(MonitorIcon, 'desktop');
export const IconMobile = defineIcon(DeviceMobileIcon, 'mobile');
export const IconTablet = defineIcon(DeviceTabletIcon, 'tablet');

/* Éditeur de texte */
export const IconBold = defineIcon(TextBIcon, 'bold');
export const IconItalic = defineIcon(TextItalicIcon, 'italic');
export const IconHeading2 = defineIcon(TextHTwoIcon, 'heading-2');
export const IconHeading3 = defineIcon(TextHThreeIcon, 'heading-3');
export const IconParagraph = defineIcon(ParagraphIcon, 'paragraph');
/** Chapô : paragraphe d'introduction mis en avant. */
export const IconLede = defineIcon(TextAaIcon, 'lede');
export const IconBulletList = defineIcon(ListBulletsIcon, 'bullet-list');
export const IconNumberedList = defineIcon(ListNumbersIcon, 'numbered-list');
export const IconQuote = defineIcon(QuotesIcon, 'quote');
/** Insérer un bouton dans un contenu. */
export const IconButtonInsert = defineIcon(CursorClickIcon, 'button-insert');

/* ------------------------------------------------------------------------------------------ */
/* États du système                                                                             */
/* ------------------------------------------------------------------------------------------ */
/** Protection à renforcer. */
export const IconSecurityWarning = defineIcon(ShieldWarningIcon, 'security-warning');
/** Page introuvable : on s'est trompé de chemin. */
export const IconNotFound = defineIcon(SignpostIcon, 'not-found');
