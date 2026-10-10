-- =============================================================================
-- LASISTANT.PRO · Double authentification par code envoyé par e-mail
--
-- Remplace l'application d'authentification (TOTP). Après le mot de passe, un code à
-- 6 chiffres est envoyé par e-mail (Edge Function « code-connexion », service Resend).
-- La session de connexion n'obtient aucun accès aux données tant que ce code n'a pas été
-- validé : `app_private.staff_role()` exige une session vérifiée (migration suivante,
-- appliquée une fois l'écran de vérification par e-mail en ligne).
--
-- Code : aléatoire, valable 10 minutes, lié à la session (un code reçu ne sert pas à une
-- autre connexion), conservé sous forme d'empreinte (jamais en clair), 5 essais au plus.
-- Limitations : 1 envoi par minute, 5 par heure et par compte, 20 par heure et par adresse
-- IP ; après 10 essais erronés en une heure, plus aucun code n'est envoyé pendant une heure.
-- =============================================================================

create table app_private.login_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null,
  code_hash text not null,
  ip_hash text,
  attempts smallint not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
create index login_codes_user_idx on app_private.login_codes (user_id, created_at desc);
create index login_codes_ip_idx on app_private.login_codes (ip_hash, created_at desc);

create table app_private.verified_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null
);

revoke all on app_private.login_codes, app_private.verified_sessions from public, anon, authenticated;
alter table app_private.login_codes enable row level security;
alter table app_private.verified_sessions enable row level security;

-- Sel des empreintes (codes et adresses IP), généré par la base et conservé dans le coffre.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'code_connexion_sel') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'code_connexion_sel',
      'Sel des empreintes des codes de connexion envoyés par e-mail.'
    );
  end if;
end;
$$;

create function app_private.login_hash(p_value text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select encode(
    extensions.digest(coalesce(app_private.config_value('code_connexion_sel'), '') || ':' || p_value, 'sha256'),
    'hex'
  );
$$;
revoke execute on function app_private.login_hash(text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Session vérifiée : condition d'accès aux données de l'équipe
-- -----------------------------------------------------------------------------
create function app_private.session_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from app_private.verified_sessions s
    where s.session_id = nullif((select auth.jwt() ->> 'session_id'), '')::uuid
      and s.user_id = (select auth.uid())
      and s.expires_at > now()
  );
$$;
revoke execute on function app_private.session_verified() from public, anon;
grant execute on function app_private.session_verified() to authenticated;

-- La session en cours a-t-elle été vérifiée ? (écran de connexion, rechargement de page)
create function public.second_factor_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.session_verified();
$$;
revoke execute on function public.second_factor_verified() from public, anon;
grant execute on function public.second_factor_verified() to authenticated;

-- -----------------------------------------------------------------------------
-- Routes de l'Edge Function « code-connexion » (clé secrète uniquement)
-- -----------------------------------------------------------------------------

-- Nouveau code pour une session : limitations vérifiées, code renvoyé à la fonction
-- (qui l'envoie par e-mail) et conservé sous forme d'empreinte seulement.
create function public.login_code_issue(p_user uuid, p_session uuid, p_ip text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip_hash text := case when coalesce(p_ip, '') = '' then null else app_private.login_hash('ip:' || p_ip) end;
  v_last timestamptz;
  v_hour_count integer;
  v_oldest timestamptz;
  v_failures integer;
  v_ip_count integer;
  v_code text;
  v_expires timestamptz := now() + interval '10 minutes';
begin
  select max(created_at), count(*), min(created_at), coalesce(sum(attempts), 0)
    into v_last, v_hour_count, v_oldest, v_failures
  from app_private.login_codes
  where user_id = p_user and created_at > now() - interval '1 hour';

  if v_last is not null and v_last > now() - interval '60 seconds' then
    raise exception 'rate_limited' using detail = to_jsonb(v_last + interval '60 seconds') #>> '{}';
  end if;
  if v_hour_count >= 5 then
    raise exception 'rate_limited' using detail = to_jsonb(v_oldest + interval '1 hour') #>> '{}';
  end if;
  if v_failures >= 10 then
    raise exception 'rate_limited' using detail = to_jsonb(now() + interval '1 hour') #>> '{}';
  end if;
  if v_ip_hash is not null then
    select count(*) into v_ip_count
    from app_private.login_codes
    where ip_hash = v_ip_hash and created_at > now() - interval '1 hour';
    if v_ip_count >= 20 then
      raise exception 'rate_limited' using detail = to_jsonb(now() + interval '1 hour') #>> '{}';
    end if;
  end if;

  -- Un seul code valable par session : les précédents sont annulés.
  update app_private.login_codes
  set consumed_at = now()
  where user_id = p_user and session_id = p_session and consumed_at is null;

  v_code := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
  insert into app_private.login_codes (user_id, session_id, code_hash, ip_hash, expires_at)
  values (p_user, p_session, app_private.login_hash(p_session::text || ':' || v_code), v_ip_hash, v_expires);

  return jsonb_build_object('code', v_code, 'expiresAt', v_expires, 'retryAt', now() + interval '60 seconds');
end;
$$;

-- Vérification d'un code : la session devient vérifiée (pour la durée indiquée).
create function public.login_code_verify(p_user uuid, p_session uuid, p_code text, p_validity_hours integer default 720)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row app_private.login_codes;
begin
  select * into v_row
  from app_private.login_codes
  where user_id = p_user and session_id = p_session and consumed_at is null
  order by created_at desc
  limit 1
  for update;

  if v_row.id is null or v_row.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;
  if v_row.attempts >= 5 then
    return jsonb_build_object('ok', false, 'reason', 'too_many');
  end if;

  if v_row.code_hash is distinct from app_private.login_hash(p_session::text || ':' || coalesce(p_code, '')) then
    update app_private.login_codes set attempts = attempts + 1 where id = v_row.id;
    return jsonb_build_object(
      'ok', false,
      'reason', case when v_row.attempts + 1 >= 5 then 'too_many' else 'invalid' end,
      'remaining', greatest(0, 4 - v_row.attempts)
    );
  end if;

  update app_private.login_codes set consumed_at = now() where id = v_row.id;
  insert into app_private.verified_sessions (session_id, user_id, verified_at, expires_at)
  values (p_session, p_user, now(), now() + make_interval(hours => greatest(1, least(coalesce(p_validity_hours, 720), 720))))
  on conflict (session_id) do update
    set user_id = excluded.user_id, verified_at = excluded.verified_at, expires_at = excluded.expires_at;
  return jsonb_build_object('ok', true);
end;
$$;

-- Clé d'envoi Resend, lue dans le coffre.
create function public.login_mailer_key()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.config_value('resend_api_key');
$$;

revoke execute on function public.login_code_issue(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.login_code_verify(uuid, uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.login_mailer_key() from public, anon, authenticated;
grant execute on function public.login_code_issue(uuid, uuid, text) to service_role;
grant execute on function public.login_code_verify(uuid, uuid, text, integer) to service_role;
grant execute on function public.login_mailer_key() to service_role;
