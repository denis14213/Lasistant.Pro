-- LASISTANT.PRO · Fonctions internes communes aux routes d'API (schéma non exposé).

create function app_private.require_role(variadic p_roles public.admin_role[])
returns public.admin_users
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user public.admin_users;
begin
  if not app_private.has_role(variadic p_roles) then
    perform app_private.raise_business_error('forbidden', 'Votre rôle ne permet pas d’effectuer cette action.');
  end if;
  select * into v_user from public.admin_users where id = (select auth.uid());
  return v_user;
end;
$$;

create function app_private.text_or_null(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(btrim(p_value), '');
$$;

create function app_private.minutes_of(p_time text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select split_part(p_time, ':', 1)::integer * 60 + split_part(p_time, ':', 2)::integer;
$$;

-- Le créneau respecte-t-il les règles de l'agenda (mêmes règles que src/features/booking/availability.ts) ?
create function app_private.is_bookable_slot(p_date date, p_time text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_rules jsonb;
  v_today date := (now() at time zone 'Africa/Tunis')::date;
  v_duration integer;
  v_minutes integer;
begin
  select booking into v_rules from public.site_settings where id = 1;
  if v_rules is null or not coalesce((v_rules ->> 'enabled')::boolean, false) then
    return false;
  end if;

  v_duration := (v_rules ->> 'durationMinutes')::integer;
  v_minutes := app_private.minutes_of(p_time);

  return v_duration > 0
    and extract(isodow from p_date)::integer in (
      select jsonb_array_elements_text(v_rules -> 'openDays')::integer
    )
    and not coalesce(v_rules -> 'closures', '[]'::jsonb) ? p_date::text
    and p_date between v_today and v_today + (v_rules ->> 'horizonDays')::integer
    and exists (
      select 1
      from jsonb_array_elements(v_rules -> 'ranges') r
      where v_minutes >= app_private.minutes_of(r ->> 'start')
        and v_minutes + v_duration <= app_private.minutes_of(r ->> 'end')
        and (v_minutes - app_private.minutes_of(r ->> 'start')) % v_duration = 0
    )
    and ((p_date + p_time::time) at time zone 'Africa/Tunis')
        >= now() + make_interval(hours => coalesce((v_rules ->> 'minNoticeHours')::integer, 0));
end;
$$;
