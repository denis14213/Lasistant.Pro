-- =============================================================================
-- LASISTANT.PRO · 1/6 · Schéma initial
--
-- Tables métier, types énumérés, contraintes d'intégrité et index.
-- Chaque table reprend un type de `src/types` (colonnes en snake_case, champs
-- TypeScript en camelCase : la correspondance est faite par `src/api/supabase/mappers.ts`).
-- Les règles d'accès (RLS) et la logique serveur sont dans les migrations suivantes.
-- =============================================================================

-- Fonctions internes : schéma non exposé par l'API REST (PostgREST n'expose que « public »).
create schema if not exists app_private;
revoke all on schema app_private from public;
comment on schema app_private is 'Fonctions internes de LASISTANT.PRO (non exposées par l''API).';

-- -----------------------------------------------------------------------------
-- Types énumérés (miroir exact des unions TypeScript)
-- -----------------------------------------------------------------------------
create type public.admin_role as enum ('administrateur', 'editeur', 'operateur');
create type public.service_kind as enum ('page', 'reservation');
create type public.article_status as enum ('brouillon', 'publie', 'archive');
create type public.booking_status as enum ('nouveau', 'en_cours', 'en_attente', 'confirme', 'cloture', 'annule');
create type public.booking_source as enum ('reservation', 'logement', 'demande_rapide', 'contact');
create type public.applicant_profile as enum ('patient', 'proche', 'etudiant', 'personne_agee', 'professionnel', 'autre');
create type public.contact_preference as enum ('telephone', 'email', 'whatsapp');
create type public.booking_event_type as enum (
  'received', 'email_sent', 'notification_sent', 'viewed', 'status_changed', 'assigned', 'reply_sent', 'note_added'
);
create type public.activity_kind as enum ('settings', 'team', 'content');
create type public.media_kind as enum ('image', 'document');
create type public.email_template_kind as enum ('automatique', 'manuel');
create type public.email_audience as enum ('demandeur', 'equipe');
create type public.tone as enum ('brand', 'success', 'gold', 'neutral', 'info', 'warning', 'danger');
create type public.icon_tone as enum ('brand', 'success', 'gold', 'dark', 'neutral');
create type public.email_outbox_status as enum ('en_attente', 'envoye', 'echec');

-- Horodatage de mise à jour, commun à toutes les tables modifiables.
create function app_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Équipe du back-office (un compte Supabase Auth = une ligne)
-- -----------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  role public.admin_role not null default 'operateur',
  active boolean not null default false,
  two_factor_enabled boolean not null default false,
  two_factor_configured_at timestamptz,
  recovery_codes_remaining smallint not null default 0 check (recovery_codes_remaining >= 0),
  password_changed_at timestamptz,
  last_login_at timestamptz,
  invitation_sent_at timestamptz,
  notifications jsonb not null
    default '{"newRequest": true, "overdueReminder": true, "weeklySummary": false}'::jsonb
    check (jsonb_typeof(notifications) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.admin_users is 'Membres de l''équipe du back-office (profil, rôle, préférences).';

-- Codes de secours de la double authentification (empreintes uniquement, jamais les codes).
create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index mfa_recovery_codes_user_id_idx on public.mfa_recovery_codes (user_id);

-- -----------------------------------------------------------------------------
-- Réglages du site (ligne unique)
-- Les rubriques sont stockées en JSONB : elles sont toujours lues et enregistrées
-- d'un bloc par les formulaires du back-office.
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  brand_name text not null,
  tagline text not null default '',
  description text not null default '',
  phones jsonb not null default '[]'::jsonb check (jsonb_typeof(phones) = 'array'),
  emails jsonb not null default '[]'::jsonb check (jsonb_typeof(emails) = 'array'),
  address jsonb not null check (jsonb_typeof(address) = 'object'),
  opening_hours text,
  facebook jsonb not null check (jsonb_typeof(facebook) = 'object'),
  whatsapp jsonb not null check (jsonb_typeof(whatsapp) = 'object'),
  booking jsonb not null check (jsonb_typeof(booking) = 'object'),
  seo jsonb not null check (jsonb_typeof(seo) = 'object'),
  analytics jsonb not null check (jsonb_typeof(analytics) = 'object'),
  maintenance jsonb not null check (jsonb_typeof(maintenance) = 'object'),
  backups jsonb not null check (jsonb_typeof(backups) = 'object'),
  legal jsonb not null check (jsonb_typeof(legal) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);
comment on table public.site_settings is 'Réglages du site : coordonnées, réservation, SEO, maintenance (ligne unique).';

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
create table public.services (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind public.service_kind not null default 'reservation',
  title text not null check (char_length(btrim(title)) between 1 and 120),
  subtitle text not null default '',
  summary text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  details text[] not null default '{}',
  audiences jsonb not null default '[]'::jsonb check (jsonb_typeof(audiences) = 'array'),
  icon text not null default 'conversation',
  icon_tone public.icon_tone not null default 'brand',
  image text not null default '',
  image_alt text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  active boolean not null default false,
  show_in_menu boolean not null default false,
  show_medical_disclaimer boolean not null default false,
  sort_order integer not null default 0,
  seo jsonb not null default '{"title": "", "description": ""}'::jsonb check (jsonb_typeof(seo) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);
create index services_sort_order_idx on public.services (sort_order);

-- -----------------------------------------------------------------------------
-- Espace infos : catégories et articles
-- -----------------------------------------------------------------------------
create table public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  tone public.tone not null default 'neutral'
);

create table public.articles (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  excerpt text not null default '',
  body text not null default '',
  cover_image text not null default '',
  cover_alt text not null default '',
  category_id text not null references public.categories (id) on update cascade on delete restrict,
  status public.article_status not null default 'brouillon',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  reading_minutes integer not null default 1 check (reading_minutes >= 1),
  author text not null default '',
  tags text[] not null default '{}',
  featured boolean not null default false,
  seo jsonb not null default '{"title": "", "description": ""}'::jsonb check (jsonb_typeof(seo) = 'object'),
  use_cover_for_sharing boolean not null default true
);
create index articles_category_id_idx on public.articles (category_id);
create index articles_published_idx on public.articles (published_at desc) where status = 'publie';

-- -----------------------------------------------------------------------------
-- Questions fréquentes
-- -----------------------------------------------------------------------------
create table public.faq_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  sort_order integer not null default 0
);

create table public.faq_items (
  id text primary key default gen_random_uuid()::text,
  category_id text not null references public.faq_categories (id) on update cascade on delete cascade,
  question text not null check (char_length(btrim(question)) between 1 and 300),
  answer text not null,
  pending_note text,
  sort_order integer not null default 0
);
create index faq_items_category_id_idx on public.faq_items (category_id, sort_order);

-- -----------------------------------------------------------------------------
-- Demandes et réservations
-- -----------------------------------------------------------------------------

-- Compteur des références « LP-AAAA-NNNN » (une séquence par année, sans trou ni doublon).
create table public.booking_reference_counters (
  year integer primary key,
  last_value integer not null default 0
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  -- Clé secrète du lien de confirmation : la référence seule ne suffit pas à consulter une demande.
  confirmation_key uuid not null default gen_random_uuid(),
  source public.booking_source not null,
  service_id text references public.services (id) on update cascade on delete set null,
  subject text check (char_length(subject) <= 160),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),
  country text check (char_length(country) <= 80),
  profile public.applicant_profile,
  requested_date date,
  requested_time text check (requested_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  contact_preference public.contact_preference,
  arrival_date text check (char_length(arrival_date) <= 40),
  stay_duration text check (char_length(stay_duration) <= 80),
  message text check (char_length(message) <= 4000),
  housing jsonb check (housing is null or jsonb_typeof(housing) = 'object'),
  attachment_name text check (char_length(attachment_name) <= 200),
  -- Pièce jointe déposée dans le stockage privé « documents »
  attachment_path text check (attachment_path like 'demandes/%'),
  status public.booking_status not null default 'nouveau',
  assignee_id uuid references public.admin_users (id) on delete set null,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_slot_complete check ((requested_date is null) = (requested_time is null))
);
create index bookings_created_at_idx on public.bookings (created_at desc);
create index bookings_status_idx on public.bookings (status);
create index bookings_service_id_idx on public.bookings (service_id);
create index bookings_assignee_id_idx on public.bookings (assignee_id);
-- Un créneau ne peut être tenu que par une seule demande active (pas de double réservation).
create unique index bookings_slot_unique_idx on public.bookings (requested_date, requested_time)
  where requested_date is not null and status in ('nouveau', 'en_cours', 'confirme');
create unique index bookings_attachment_path_idx on public.bookings (attachment_path)
  where attachment_path is not null;

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  type public.booking_event_type not null,
  label text not null,
  actor text,
  actor_id uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index booking_events_booking_id_idx on public.booking_events (booking_id, created_at);
create index booking_events_actor_id_idx on public.booking_events (actor_id, created_at desc);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  author text not null default '',
  author_id uuid references public.admin_users (id) on delete set null,
  text text not null check (char_length(btrim(text)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index internal_notes_booking_id_idx on public.internal_notes (booking_id, created_at desc);
create index internal_notes_author_id_idx on public.internal_notes (author_id);

-- Limitation des envois publics : empreinte de l'adresse IP (jamais l'adresse en clair).
create table public.submission_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index submission_attempts_ip_hash_idx on public.submission_attempts (ip_hash, created_at desc);

-- -----------------------------------------------------------------------------
-- Journal d'activité de l'équipe (actions sensibles, traçabilité)
-- -----------------------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  actor_id uuid references public.admin_users (id) on delete set null,
  label text not null,
  kind public.activity_kind not null,
  created_at timestamptz not null default now()
);
create index activity_log_actor_id_idx on public.activity_log (actor_id, created_at desc);
create index activity_log_created_at_idx on public.activity_log (created_at desc);

-- -----------------------------------------------------------------------------
-- Médiathèque
-- -----------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null check (char_length(file_name) between 1 and 200),
  kind public.media_kind not null default 'image',
  -- Clé du registre d'images du site, ou URL publique du fichier (bucket « medias »)
  image text not null default '',
  -- Chemin du fichier dans le stockage (null pour les images fournies avec le site)
  storage_path text,
  title text not null default '',
  alt_text text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  uploaded_by text not null default '',
  created_at timestamptz not null default now(),
  used_on text[] not null default '{}',
  is_private boolean not null default false,
  rights_confirmed boolean not null default false
);
create index media_created_at_idx on public.media (created_at desc);

-- -----------------------------------------------------------------------------
-- Modèles d'e-mails et file d'envoi
-- -----------------------------------------------------------------------------
create table public.email_templates (
  id text primary key default gen_random_uuid()::text,
  key text not null unique check (key ~ '^[a-z0-9-]+$'),
  -- Modèles fournis avec le site : non supprimables, nom fixe
  is_system boolean generated always as (key not like 'reponse-%') stored,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  trigger text not null default 'Envoi manuel',
  kind public.email_template_kind not null default 'manuel',
  audience public.email_audience not null default 'demandeur',
  subject text not null check (char_length(subject) <= 200),
  heading text not null default '',
  body text not null default '',
  sender_name text not null default 'LASISTANT.PRO',
  reply_to text not null default '',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- E-mails à envoyer (modèle de la « boîte d'envoi transactionnelle ») : chaque événement
-- métier y dépose un message, qu'un service d'envoi traite ensuite (Edge Function + fournisseur SMTP).
create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  recipient text not null,
  booking_id uuid references public.bookings (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  status public.email_outbox_status not null default 'en_attente',
  attempts smallint not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_outbox_pending_idx on public.email_outbox (created_at) where status = 'en_attente';
create index email_outbox_booking_id_idx on public.email_outbox (booking_id);

-- -----------------------------------------------------------------------------
-- Horodatage automatique
-- -----------------------------------------------------------------------------
create trigger admin_users_touch before update on public.admin_users
  for each row execute function app_private.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings
  for each row execute function app_private.touch_updated_at();
create trigger services_touch before update on public.services
  for each row execute function app_private.touch_updated_at();
create trigger articles_touch before update on public.articles
  for each row execute function app_private.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function app_private.touch_updated_at();
create trigger email_templates_touch before update on public.email_templates
  for each row execute function app_private.touch_updated_at();
