-- =============================================================================
-- LASISTANT.PRO · Envoi des e-mails de la file « email_outbox »
--
-- Chaque événement métier dépose ses e-mails dans la file (confirmation au demandeur,
-- notification à l'équipe, rendez-vous confirmé). La base appelle aussitôt l'Edge Function
-- « envoi-emails » (pg_net), qui les envoie par Resend ; une tâche planifiée (pg_cron) reprend
-- toutes les 5 minutes les envois en échec temporaire, avec un délai croissant (2, 4, 8, 16 min),
-- jusqu'à 5 tentatives.
--
-- Sécurité :
--   - la fonction n'envoie que ce que la base a mis en file : elle ne reçoit aucun contenu ;
--   - l'appel est authentifié par un jeton aléatoire généré ici et conservé dans le coffre
--     (Vault) : il n'apparaît dans aucun fichier ni dans aucun journal applicatif ;
--   - la réservation des envois (outbox_claim) et leur compte rendu (outbox_complete) ne sont
--     accessibles qu'avec la clé secrète du projet, et vérifient en plus ce jeton.
-- =============================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- -----------------------------------------------------------------------------
-- Suivi des tentatives
-- -----------------------------------------------------------------------------
alter table public.email_outbox
  add column if not exists next_attempt_at timestamptz,
  add column if not exists locked_until timestamptz,
  add column if not exists provider_id text;

comment on column public.email_outbox.next_attempt_at is 'Prochaine tentative après un échec temporaire.';
comment on column public.email_outbox.locked_until is 'Envoi en cours : réservé jusqu''à cette date (aucun double envoi).';
comment on column public.email_outbox.provider_id is 'Identifiant du message chez le service d''envoi (Resend).';

-- -----------------------------------------------------------------------------
-- Configuration, conservée dans le coffre (Vault)
--   envoi_emails_jeton : jeton d'appel de la fonction (généré aléatoirement par la base)
--   envoi_emails_url   : adresse de la fonction
--   site_url_public    : adresse publique du site (liens et logo des e-mails), à mettre à jour
--                        au changement de domaine : select vault.update_secret(id, 'https://…')
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'envoi_emails_jeton') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'envoi_emails_jeton',
      'Jeton d''appel de l''Edge Function « envoi-emails » (généré par la base).'
    );
  end if;
  if not exists (select 1 from vault.secrets where name = 'envoi_emails_url') then
    perform vault.create_secret(
      'https://hpqdmurqidvpzrhdcglu.supabase.co/functions/v1/envoi-emails',
      'envoi_emails_url',
      'Adresse de l''Edge Function « envoi-emails ».'
    );
  end if;
  if not exists (select 1 from vault.secrets where name = 'site_url_public') then
    perform vault.create_secret(
      'https://lasistant.pro.adbm-it.com',
      'site_url_public',
      'Adresse publique du site, utilisée pour les liens et le logo des e-mails.'
    );
  end if;
end;
$$;

create function app_private.config_value(p_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_name limit 1;
$$;
revoke execute on function app_private.config_value(text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Appel de la fonction d'envoi
-- -----------------------------------------------------------------------------
create function app_private.outbox_dispatch()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text := app_private.config_value('envoi_emails_url');
  v_token text := app_private.config_value('envoi_emails_jeton');
begin
  if v_url is null or v_token is null then
    return;
  end if;
  -- Requête asynchrone : envoyée après la validation de la transaction, jamais si elle est annulée.
  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('siteUrl', app_private.config_value('site_url_public')),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-envoi-jeton', v_token),
    timeout_milliseconds := 30000
  );
end;
$$;
revoke execute on function app_private.outbox_dispatch() from public, anon, authenticated;

create function app_private.email_outbox_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.outbox_dispatch();
  return null;
end;
$$;
revoke execute on function app_private.email_outbox_after_insert() from public, anon, authenticated;

-- Un appel par opération (une demande dépose plusieurs e-mails : confirmation et notifications).
create trigger email_outbox_dispatch after insert on public.email_outbox
  for each statement execute function app_private.email_outbox_after_insert();

-- -----------------------------------------------------------------------------
-- Routes de la fonction d'envoi (clé secrète uniquement)
-- -----------------------------------------------------------------------------
create function app_private.assert_outbox_token(p_token text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_token is null or p_token is distinct from app_private.config_value('envoi_emails_jeton') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end;
$$;
revoke execute on function app_private.assert_outbox_token(text) from public, anon, authenticated;

-- Réserve les prochains envois : chaque e-mail n'est traité que par un seul appel à la fois.
create function public.outbox_claim(p_token text, p_limit integer default 10)
returns setof public.email_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.assert_outbox_token(p_token);
  return query
    update public.email_outbox as item
    set attempts = item.attempts + 1,
        locked_until = now() + interval '5 minutes'
    where item.id in (
      select candidate.id
      from public.email_outbox as candidate
      where candidate.status = 'en_attente'
        and coalesce(candidate.next_attempt_at, '-infinity') <= now()
        and coalesce(candidate.locked_until, '-infinity') < now()
      order by candidate.created_at
      limit greatest(1, least(coalesce(p_limit, 10), 50))
      for update skip locked
    )
    returning item.*;
end;
$$;

-- Compte rendu d'un envoi : envoyé, à retenter plus tard, ou abandonné.
create function public.outbox_complete(
  p_token text,
  p_id uuid,
  p_provider_id text default null,
  p_error text default null,
  p_permanent boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.assert_outbox_token(p_token);
  if p_error is null then
    update public.email_outbox
    set status = 'envoye',
        sent_at = now(),
        provider_id = left(p_provider_id, 200),
        last_error = null,
        locked_until = null,
        next_attempt_at = null
    where id = p_id;
  else
    update public.email_outbox
    set last_error = left(p_error, 500),
        locked_until = null,
        status = case
          when p_permanent or attempts >= 5 then 'echec'::public.email_outbox_status
          else 'en_attente'::public.email_outbox_status
        end,
        next_attempt_at = case
          when p_permanent or attempts >= 5 then null
          else now() + make_interval(mins => power(2, attempts)::int)
        end
    where id = p_id;
  end if;
end;
$$;

revoke execute on function public.outbox_claim(text, integer) from public, anon, authenticated;
revoke execute on function public.outbox_complete(text, uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.outbox_claim(text, integer) to service_role;
grant execute on function public.outbox_complete(text, uuid, text, text, boolean) to service_role;

-- -----------------------------------------------------------------------------
-- Reprise planifiée des envois en attente (toutes les 5 minutes, seulement s'il y en a)
-- -----------------------------------------------------------------------------
select cron.schedule(
  'envoi-emails',
  '*/5 * * * *',
  $cron$
    select app_private.outbox_dispatch()
    where exists (
      select 1
      from public.email_outbox
      where status = 'en_attente'
        and coalesce(next_attempt_at, '-infinity') <= now()
        and coalesce(locked_until, '-infinity') < now()
    );
  $cron$
);
