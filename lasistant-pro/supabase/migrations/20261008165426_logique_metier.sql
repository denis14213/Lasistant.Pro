-- =============================================================================
-- LASISTANT.PRO · 3/6 · Logique métier côté serveur (déclencheurs)
--
-- Les règles qui garantissent l'intégrité des données sont appliquées par la base,
-- quel que soit le client : références des demandes, historique, journal d'activité,
-- auteur des modifications, temps de lecture, garde-fous sur les rôles.
-- Le navigateur n'envoie que l'intention ; il ne peut ni falsifier l'auteur d'une
-- action ni contourner l'historique.
--
-- Convention : `auth.uid()` nul = contexte serveur de confiance (migration, Edge Function
-- avec la clé de service). Les visiteurs anonymes n'ont aucun droit d'écriture direct.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Outils communs
-- -----------------------------------------------------------------------------

-- Erreur métier lisible par le client : le code est dans « message », le texte affiché dans « detail ».
create function app_private.raise_business_error(p_code text, p_detail text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = case p_code when 'forbidden' then '42501' else 'P0001' end,
    message = p_code,
    detail = p_detail;
end;
$$;

-- Journal d'activité de l'équipe.
create function app_private.log_activity(p_label text, p_kind public.activity_kind)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.admin_users;
begin
  select * into v_actor from public.admin_users where id = (select auth.uid());
  insert into public.activity_log (actor, actor_id, label, kind)
  values (coalesce(v_actor.name, 'Système'), v_actor.id, p_label, p_kind);
end;
$$;

-- Historique d'une demande.
create function app_private.add_booking_event(
  p_booking_id uuid,
  p_type public.booking_event_type,
  p_label text,
  p_with_actor boolean default true
)
returns public.booking_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.admin_users;
  v_event public.booking_events;
begin
  if p_with_actor then
    select * into v_actor from public.admin_users where id = (select auth.uid());
  end if;
  insert into public.booking_events (booking_id, type, label, actor, actor_id)
  values (p_booking_id, p_type, p_label, v_actor.name, v_actor.id)
  returning * into v_event;
  return v_event;
end;
$$;

-- Libellés des statuts (miroir de BOOKING_STATUS_LABELS dans src/content/labels.ts).
create function app_private.booking_status_label(p_status public.booking_status)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_status
    when 'nouveau' then 'Nouveau'
    when 'en_cours' then 'En cours'
    when 'en_attente' then 'En attente'
    when 'confirme' then 'Confirmé'
    when 'cloture' then 'Clôturé'
    when 'annule' then 'Annulé'
  end;
$$;

create function app_private.role_label(p_role public.admin_role)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_role
    when 'administrateur' then 'Administrateur'
    when 'editeur' then 'Éditeur'
    when 'operateur' then 'Opérateur'
  end;
$$;

-- -----------------------------------------------------------------------------
-- Auteur des modifications (« Modifié par … »)
-- -----------------------------------------------------------------------------
create function app_private.stamp_updated_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_by := coalesce(app_private.current_actor_name(), new.updated_by);
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Réglages du site
-- -----------------------------------------------------------------------------
create function app_private.site_settings_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Les opérateurs ne modifient que les disponibilités de réservation (agenda).
  if (select auth.uid()) is not null
     and not app_private.has_role('administrateur')
     and (to_jsonb(new) - array['booking', 'updated_at', 'updated_by'])
         is distinct from (to_jsonb(old) - array['booking', 'updated_at', 'updated_by']) then
    perform app_private.raise_business_error('forbidden', 'Votre rôle permet seulement de modifier les disponibilités de l’agenda.');
  end if;
  new.updated_by := coalesce(app_private.current_actor_name(), new.updated_by);
  return new;
end;
$$;

create function app_private.site_settings_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed text[];
  v_label text;
begin
  select coalesce(array_agg(n.key), '{}') into v_changed
  from jsonb_each(to_jsonb(new)) n
  where n.key not in ('updated_at', 'updated_by')
    and n.value is distinct from (to_jsonb(old) -> n.key);

  if cardinality(v_changed) = 0 or (select auth.uid()) is null then
    return null;
  end if;

  -- Libellé selon la rubrique modifiée (la première reconnue l'emporte, comme dans l'interface).
  v_label := case
    when 'legal' = any (v_changed) then 'Informations légales mises à jour'
    when 'booking' = any (v_changed) then 'Disponibilités de réservation modifiées'
    when 'maintenance' = any (v_changed) then 'Mode maintenance modifié'
    when v_changed && array['seo', 'analytics', 'backups'] then 'Réglages SEO et mesure d’audience modifiés'
    when v_changed && array['phones', 'emails', 'address', 'opening_hours', 'facebook', 'whatsapp']
      then 'Coordonnées du site modifiées'
    else 'Réglages du site modifiés'
  end;
  perform app_private.log_activity(v_label, 'settings');
  return null;
end;
$$;

create trigger site_settings_guard before update on public.site_settings
  for each row execute function app_private.site_settings_guard();
create trigger site_settings_log after update on public.site_settings
  for each row execute function app_private.site_settings_log();

-- -----------------------------------------------------------------------------
-- Services : rang d'affichage et auteur
-- -----------------------------------------------------------------------------
create function app_private.services_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sort_order is null or new.sort_order <= 0 then
    select coalesce(max(sort_order), 0) + 1 into new.sort_order from public.services;
  end if;
  return new;
end;
$$;

create trigger services_before_insert before insert on public.services
  for each row execute function app_private.services_before_insert();
create trigger services_stamp before insert or update on public.services
  for each row execute function app_private.stamp_updated_by();

create function app_private.categories_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sort_order is null or new.sort_order <= 0 then
    select count(*) + 1 into new.sort_order from public.categories;
  end if;
  return new;
end;
$$;

create trigger categories_before_insert before insert on public.categories
  for each row execute function app_private.categories_before_insert();

-- -----------------------------------------------------------------------------
-- Articles : temps de lecture, date de publication, auteur
-- -----------------------------------------------------------------------------
create function app_private.articles_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_words integer;
begin
  -- Environ 200 mots par minute, une minute au minimum.
  v_words := coalesce(array_length(regexp_split_to_array(btrim(new.body), '\s+'), 1), 0);
  new.reading_minutes := greatest(1, round(v_words / 200.0)::integer);

  -- La date de publication est fixée à la première publication, puis conservée.
  if tg_op = 'INSERT' then
    new.published_at := coalesce(new.published_at, case when new.status = 'publie' then now() end);
  else
    new.published_at := coalesce(old.published_at, case when new.status = 'publie' then now() end);
  end if;

  new.author := coalesce(app_private.current_actor_name(), nullif(new.author, ''), 'L’équipe LASISTANT.PRO');
  return new;
end;
$$;

create function app_private.articles_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and new.status = 'publie'
     and (tg_op = 'INSERT' or old.status is distinct from 'publie') then
    perform app_private.log_activity(format('Article « %s » publié', new.title), 'content');
  end if;
  return null;
end;
$$;

create trigger articles_before_write before insert or update on public.articles
  for each row execute function app_private.articles_before_write();
create trigger articles_after_write after insert or update on public.articles
  for each row execute function app_private.articles_after_write();

-- -----------------------------------------------------------------------------
-- Demandes : référence, historique, e-mails à envoyer
-- -----------------------------------------------------------------------------
create function app_private.bookings_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from now() at time zone 'Africa/Tunis')::integer;
  v_number integer;
begin
  insert into public.booking_reference_counters as c (year, last_value)
  values (v_year, 1)
  on conflict (year) do update set last_value = c.last_value + 1
  returning last_value into v_number;

  new.reference := format('LP-%s-%s', v_year, lpad(v_number::text, 4, '0'));
  new.full_name := btrim(new.full_name);
  new.email := lower(btrim(new.email));
  new.assignee_id := null;
  new.consent_at := now();
  new.created_at := now();
  new.updated_at := now();
  if coalesce(current_setting('app.channel', true), '') = 'site' then
    new.status := 'nouveau';
  end if;
  return new;
end;
$$;

-- Adresses qui reçoivent les notifications de nouvelle demande : adresse de l'agence
-- (réglages) et membres actifs de l'équipe ayant choisi cette notification.
create function app_private.notification_recipients()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select distinct lower(btrim(e ->> 'value'))
  from public.site_settings s, jsonb_array_elements(s.emails) e
  where coalesce((e ->> 'receivesNotifications')::boolean, false)
    and coalesce((e ->> 'active')::boolean, true)
    and nullif(btrim(e ->> 'value'), '') is not null
  union
  select u.email
  from public.admin_users u
  where u.active and coalesce((u.notifications ->> 'newRequest')::boolean, false);
$$;

create function app_private.bookings_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('app.channel', true), '') = 'site' then
    perform app_private.add_booking_event(new.id, 'received', 'Demande reçue via le site', false);
    -- Confirmation au demandeur et notification à l'équipe, déposées dans la file d'envoi.
    insert into public.email_outbox (template_key, recipient, booking_id)
    values ('confirmation-demandeur', new.email, new.id);
    insert into public.email_outbox (template_key, recipient, booking_id)
    select 'notification-equipe', r, new.id from app_private.notification_recipients() r;
  else
    perform app_private.add_booking_event(new.id, 'received', 'Demande saisie par l’équipe');
    if new.status <> 'nouveau' then
      perform app_private.add_booking_event(
        new.id, 'status_changed', 'Statut : ' || app_private.booking_status_label(new.status)
      );
    end if;
  end if;
  return null;
end;
$$;

create function app_private.bookings_after_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignee text;
begin
  if new.status is distinct from old.status then
    perform app_private.add_booking_event(
      new.id, 'status_changed', 'Statut modifié : ' || app_private.booking_status_label(new.status)
    );
    if new.status = 'confirme' then
      insert into public.email_outbox (template_key, recipient, booking_id)
      values ('rendez-vous-confirme', new.email, new.id);
    end if;
  end if;

  if new.assignee_id is distinct from old.assignee_id then
    select name into v_assignee from public.admin_users where id = new.assignee_id;
    perform app_private.add_booking_event(
      new.id,
      'assigned',
      case when new.assignee_id is null then 'Demande désassignée' else 'Demande assignée à ' || v_assignee end
    );
  end if;
  return null;
end;
$$;

create trigger bookings_before_insert before insert on public.bookings
  for each row execute function app_private.bookings_before_insert();
create trigger bookings_after_insert after insert on public.bookings
  for each row execute function app_private.bookings_after_insert();
create trigger bookings_after_update after update on public.bookings
  for each row execute function app_private.bookings_after_update();

-- Notes internes : l'auteur est toujours la personne connectée.
create function app_private.internal_notes_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.author_id := (select id from public.admin_users where id = (select auth.uid()));
  new.author := coalesce(app_private.current_actor_name(), nullif(new.author, ''), 'Équipe');
  new.text := btrim(new.text);
  new.created_at := now();
  return new;
end;
$$;

create function app_private.internal_notes_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.add_booking_event(new.booking_id, 'note_added', 'Note interne ajoutée');
  return null;
end;
$$;

create trigger internal_notes_before_insert before insert on public.internal_notes
  for each row execute function app_private.internal_notes_before_insert();
create trigger internal_notes_after_insert after insert on public.internal_notes
  for each row execute function app_private.internal_notes_after_insert();

-- -----------------------------------------------------------------------------
-- Équipe : garde-fous sur les rôles et journal
-- -----------------------------------------------------------------------------
create function app_private.admin_users_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if (new.role, new.active) is distinct from (old.role, old.active) then
    if not app_private.has_role('administrateur') then
      perform app_private.raise_business_error('forbidden', 'Seul un administrateur peut modifier les rôles et les accès.');
    end if;
    if new.id = (select auth.uid()) and (new.role <> 'administrateur' or not new.active) then
      perform app_private.raise_business_error('validation', 'Vous ne pouvez pas retirer vos propres droits d’administrateur.');
    end if;
    -- Désactiver une invitation en attente revient à la révoquer.
    if not new.active and old.invitation_sent_at is not null and old.last_login_at is null then
      new.invitation_sent_at := null;
    end if;
  end if;
  return new;
end;
$$;

create function app_private.admin_users_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return null;
  end if;
  if new.role is distinct from old.role then
    perform app_private.log_activity(format('Rôle de %s : %s', new.name, app_private.role_label(new.role)), 'team');
  end if;
  if new.active is distinct from old.active then
    perform app_private.log_activity(
      format('Compte de %s %s', new.name, case when new.active then 'réactivé' else 'désactivé' end), 'team'
    );
  end if;
  return null;
end;
$$;

create trigger admin_users_guard before update on public.admin_users
  for each row execute function app_private.admin_users_guard();
create trigger admin_users_log after update on public.admin_users
  for each row execute function app_private.admin_users_log();

-- -----------------------------------------------------------------------------
-- Modèles d'e-mails
-- -----------------------------------------------------------------------------
create function app_private.email_templates_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Le nom des modèles fournis avec le site décrit leur déclencheur : il reste fixe.
  if old.is_system then
    new.name := old.name;
  end if;
  return new;
end;
$$;

create function app_private.email_templates_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return null;
  end if;
  if tg_op = 'INSERT' then
    perform app_private.log_activity(format('Modèle d’e-mail « %s » créé', new.name), 'settings');
  elsif tg_op = 'UPDATE' then
    perform app_private.log_activity(format('Modèle d’e-mail « %s » modifié', new.name), 'settings');
  else
    perform app_private.log_activity(format('Modèle d’e-mail « %s » supprimé', old.name), 'settings');
  end if;
  return null;
end;
$$;

create trigger email_templates_guard before update on public.email_templates
  for each row execute function app_private.email_templates_guard();
create trigger email_templates_log after insert or update or delete on public.email_templates
  for each row execute function app_private.email_templates_log();

-- -----------------------------------------------------------------------------
-- Médiathèque : auteur du dépôt
-- -----------------------------------------------------------------------------
create function app_private.media_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.uploaded_by := coalesce(app_private.current_actor_name(), nullif(new.uploaded_by, ''), 'Équipe');
  new.created_at := now();
  return new;
end;
$$;

create trigger media_before_insert before insert on public.media
  for each row execute function app_private.media_before_insert();

-- -----------------------------------------------------------------------------
-- Synchronisation avec Supabase Auth
-- -----------------------------------------------------------------------------

-- Adresse de connexion modifiée (après confirmation) : la fiche suit.
create function app_private.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.admin_users set email = lower(new.email) where id = new.id;
  end if;
  -- Invitation acceptée : le compte devient actif.
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.admin_users
    set active = true
    where id = new.id and invitation_sent_at is not null and last_login_at is null;
  end if;
  return null;
end;
$$;

create trigger lasistant_sync_auth_user after update on auth.users
  for each row execute function app_private.sync_auth_user();

-- Facteurs de double authentification : l'état affiché dans le back-office reflète Supabase Auth.
create function app_private.sync_mfa_factors()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := coalesce(new.user_id, old.user_id);
  v_configured_at timestamptz;
begin
  select max(f.updated_at) into v_configured_at
  from auth.mfa_factors f
  where f.user_id = v_user and f.status = 'verified';

  if v_configured_at is null then
    delete from public.mfa_recovery_codes where user_id = v_user;
  end if;

  update public.admin_users
  set two_factor_enabled = v_configured_at is not null,
      two_factor_configured_at = v_configured_at,
      recovery_codes_remaining = case when v_configured_at is null then 0 else recovery_codes_remaining end
  where id = v_user;
  return null;
end;
$$;

create trigger lasistant_sync_mfa_factors after insert or update or delete on auth.mfa_factors
  for each row execute function app_private.sync_mfa_factors();
