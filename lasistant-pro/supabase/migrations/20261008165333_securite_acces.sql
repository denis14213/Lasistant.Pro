-- =============================================================================
-- LASISTANT.PRO · 2/6 · Sécurité : rôles, privilèges et politiques RLS
--
-- Principe : l'API REST n'accorde que le strict nécessaire.
-- - Visiteur (anon) : lecture des contenus publics uniquement. Aucune écriture directe :
--   les demandes passent par la fonction `submit_booking` (contrôles serveur, limitation).
-- - Équipe (authenticated) : droits selon le rôle, miroir de `src/lib/permissions.ts`.
--     administrateur : tout ;
--     editeur        : services, articles, catégories, médiathèque (images) ; demandes en lecture ;
--     operateur      : demandes, agenda, documents privés.
-- - Un compte désactivé, ou dont la double authentification n'a pas été validée pour la
--   session en cours (niveau « aal2 »), n'a aucun droit sur les données.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Rôle de la personne connectée
-- -----------------------------------------------------------------------------
create function app_private.staff_role()
returns public.admin_role
language sql
stable
security definer
set search_path = ''
as $$
  select u.role
  from public.admin_users u
  where u.id = (select auth.uid())
    and u.active
    and (
      coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f where f.user_id = u.id and f.status = 'verified'
      )
    );
$$;
comment on function app_private.staff_role() is
  'Rôle de la personne connectée : null si compte inconnu, désactivé, ou double authentification non validée.';

create function app_private.has_role(variadic roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app_private.staff_role() = any (roles), false);
$$;

create function app_private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.staff_role() is not null;
$$;

-- Nom affiché de la personne connectée (auteur des actions journalisées).
create function app_private.current_actor_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.name from public.admin_users u where u.id = (select auth.uid());
$$;

grant usage on schema app_private to anon, authenticated;
revoke execute on all functions in schema app_private from public;
grant execute on function app_private.staff_role() to anon, authenticated;
grant execute on function app_private.has_role(public.admin_role[]) to anon, authenticated;
grant execute on function app_private.is_staff() to anon, authenticated;
grant execute on function app_private.current_actor_name() to authenticated;

-- -----------------------------------------------------------------------------
-- Privilèges de table : tout est retiré, puis accordé explicitement
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Contenus publics
grant select on public.site_settings, public.services, public.categories, public.articles,
  public.faq_categories, public.faq_items
  to anon, authenticated;

-- Back-office
grant update (brand_name, tagline, description, phones, emails, address, opening_hours, facebook, whatsapp,
  booking, seo, analytics, maintenance, backups, legal)
  on public.site_settings to authenticated;
grant insert, update on public.services to authenticated;
grant insert, update on public.categories to authenticated;
grant insert, update, delete on public.articles to authenticated;
grant insert, update, delete on public.faq_categories, public.faq_items to authenticated;

grant select on public.bookings to authenticated;
grant insert (source, service_id, subject, full_name, email, phone, country, profile, requested_date,
  requested_time, contact_preference, arrival_date, stay_duration, message, housing, attachment_name, status)
  on public.bookings to authenticated;
-- Seuls le statut et l'assignation se modifient depuis le back-office.
grant update (status, assignee_id) on public.bookings to authenticated;
grant delete on public.bookings to authenticated;

grant select on public.booking_events to authenticated;
grant select, insert (booking_id, text) on public.internal_notes to authenticated;

grant select on public.admin_users to authenticated;
-- Le nom et les préférences par la personne elle-même ; le rôle et l'activation par un administrateur.
grant update (name, role, active, notifications) on public.admin_users to authenticated;

grant select on public.activity_log to authenticated;
grant select, insert, delete on public.media to authenticated;
grant update (title, alt_text, rights_confirmed, used_on) on public.media to authenticated;
grant select, insert, delete on public.email_templates to authenticated;
grant update (name, subject, heading, body, sender_name, reply_to, active) on public.email_templates to authenticated;
grant select on public.email_outbox to authenticated;

-- -----------------------------------------------------------------------------
-- Activation de la sécurité au niveau des lignes (toutes les tables, sans exception)
-- -----------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.mfa_recovery_codes enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.faq_categories enable row level security;
alter table public.faq_items enable row level security;
alter table public.booking_reference_counters enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.internal_notes enable row level security;
alter table public.submission_attempts enable row level security;
alter table public.activity_log enable row level security;
alter table public.media enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_outbox enable row level security;
-- mfa_recovery_codes, booking_reference_counters, submission_attempts : aucune politique,
-- donc aucun accès par l'API (uniquement via les fonctions serveur).

-- -----------------------------------------------------------------------------
-- Réglages du site
-- -----------------------------------------------------------------------------
create policy "Réglages : lecture publique" on public.site_settings
  for select to anon, authenticated using (true);
-- Les opérateurs gèrent l'agenda (rubrique « booking ») ; le contrôle fin est fait par
-- le déclencheur `site_settings_guard`.
create policy "Réglages : modification par l'équipe habilitée" on public.site_settings
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'operateur')))
  with check ((select app_private.has_role('administrateur', 'operateur')));

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
create policy "Services : services actifs visibles de tous" on public.services
  for select to anon using (active);
create policy "Services : tous les services pour l'équipe" on public.services
  for select to authenticated using (active or (select app_private.is_staff()));
create policy "Services : création par les éditeurs" on public.services
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'editeur')));
create policy "Services : modification par les éditeurs" on public.services
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'editeur')))
  with check ((select app_private.has_role('administrateur', 'editeur')));

-- -----------------------------------------------------------------------------
-- Catégories et articles
-- -----------------------------------------------------------------------------
create policy "Catégories : catégories actives visibles de tous" on public.categories
  for select to anon using (active);
create policy "Catégories : toutes les catégories pour l'équipe" on public.categories
  for select to authenticated using (active or (select app_private.is_staff()));
create policy "Catégories : création par les éditeurs" on public.categories
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'editeur')));
create policy "Catégories : modification par les éditeurs" on public.categories
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'editeur')))
  with check ((select app_private.has_role('administrateur', 'editeur')));

create policy "Articles : articles publiés visibles de tous" on public.articles
  for select to anon using (status = 'publie');
create policy "Articles : brouillons et archives pour l'équipe" on public.articles
  for select to authenticated using (status = 'publie' or (select app_private.is_staff()));
create policy "Articles : création par les éditeurs" on public.articles
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'editeur')));
create policy "Articles : modification par les éditeurs" on public.articles
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'editeur')))
  with check ((select app_private.has_role('administrateur', 'editeur')));
create policy "Articles : suppression par les éditeurs" on public.articles
  for delete to authenticated using ((select app_private.has_role('administrateur', 'editeur')));

-- -----------------------------------------------------------------------------
-- FAQ
-- -----------------------------------------------------------------------------
create policy "FAQ : thèmes visibles de tous" on public.faq_categories
  for select to anon, authenticated using (true);
create policy "FAQ : thèmes gérés par les administrateurs" on public.faq_categories
  for all to authenticated
  using ((select app_private.has_role('administrateur')))
  with check ((select app_private.has_role('administrateur')));
create policy "FAQ : questions visibles de tous" on public.faq_items
  for select to anon, authenticated using (true);
create policy "FAQ : questions gérées par les administrateurs" on public.faq_items
  for all to authenticated
  using ((select app_private.has_role('administrateur')))
  with check ((select app_private.has_role('administrateur')));

-- -----------------------------------------------------------------------------
-- Demandes, historique et notes internes
-- -----------------------------------------------------------------------------
create policy "Demandes : consultation par l'équipe" on public.bookings
  for select to authenticated using ((select app_private.is_staff()));
create policy "Demandes : saisie par les opérateurs" on public.bookings
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'operateur')));
create policy "Demandes : traitement par les opérateurs" on public.bookings
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'operateur')))
  with check ((select app_private.has_role('administrateur', 'operateur')));
create policy "Demandes : suppression par les administrateurs" on public.bookings
  for delete to authenticated using ((select app_private.has_role('administrateur')));

create policy "Historique : consultation par l'équipe" on public.booking_events
  for select to authenticated using ((select app_private.is_staff()));

create policy "Notes : consultation par l'équipe" on public.internal_notes
  for select to authenticated using ((select app_private.is_staff()));
create policy "Notes : ajout par les opérateurs" on public.internal_notes
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'operateur')));

-- -----------------------------------------------------------------------------
-- Équipe
-- -----------------------------------------------------------------------------
-- Sa propre fiche reste lisible même avant la double authentification (contrôle à la connexion).
create policy "Équipe : sa fiche et l'équipe" on public.admin_users
  for select to authenticated
  using (id = (select auth.uid()) or (select app_private.is_staff()));
create policy "Équipe : sa fiche ou celle des autres (administrateurs)" on public.admin_users
  for update to authenticated
  using (
    (id = (select auth.uid()) and (select app_private.is_staff()))
    or (select app_private.has_role('administrateur'))
  )
  with check (
    (id = (select auth.uid()) and (select app_private.is_staff()))
    or (select app_private.has_role('administrateur'))
  );

create policy "Journal : ses actions, ou tout le journal (administrateurs)" on public.activity_log
  for select to authenticated
  using (actor_id = (select auth.uid()) or (select app_private.has_role('administrateur')));

-- -----------------------------------------------------------------------------
-- Médiathèque : images (éditeurs) et documents privés (opérateurs)
-- -----------------------------------------------------------------------------
create policy "Médias : consultation par l'équipe habilitée" on public.media
  for select to authenticated
  using (
    (not is_private and (select app_private.is_staff()))
    or (is_private and (select app_private.has_role('administrateur', 'operateur')))
  );
create policy "Médias : ajout par l'équipe habilitée" on public.media
  for insert to authenticated
  with check (
    (not is_private and (select app_private.has_role('administrateur', 'editeur')))
    or (is_private and (select app_private.has_role('administrateur', 'operateur')))
  );
create policy "Médias : modification par l'équipe habilitée" on public.media
  for update to authenticated
  using (
    (not is_private and (select app_private.has_role('administrateur', 'editeur')))
    or (is_private and (select app_private.has_role('administrateur', 'operateur')))
  )
  with check (
    (not is_private and (select app_private.has_role('administrateur', 'editeur')))
    or (is_private and (select app_private.has_role('administrateur', 'operateur')))
  );
create policy "Médias : suppression par l'équipe habilitée" on public.media
  for delete to authenticated
  using (
    (not is_private and (select app_private.has_role('administrateur', 'editeur')))
    or (is_private and (select app_private.has_role('administrateur', 'operateur')))
  );

-- -----------------------------------------------------------------------------
-- Modèles d'e-mails : lus par toute l'équipe (réponses standards), gérés par les administrateurs
-- -----------------------------------------------------------------------------
create policy "Modèles : consultation par l'équipe" on public.email_templates
  for select to authenticated using ((select app_private.is_staff()));
create policy "Modèles : création par les administrateurs" on public.email_templates
  for insert to authenticated
  with check ((select app_private.has_role('administrateur')) and key like 'reponse-%');
create policy "Modèles : modification par les administrateurs" on public.email_templates
  for update to authenticated
  using ((select app_private.has_role('administrateur')))
  with check ((select app_private.has_role('administrateur')));
create policy "Modèles : suppression des réponses ajoutées" on public.email_templates
  for delete to authenticated
  using ((select app_private.has_role('administrateur')) and key like 'reponse-%');

create policy "Envois : suivi par les administrateurs" on public.email_outbox
  for select to authenticated using ((select app_private.has_role('administrateur')));
