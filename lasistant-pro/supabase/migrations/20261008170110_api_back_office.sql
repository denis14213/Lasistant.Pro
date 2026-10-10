-- LASISTANT.PRO · Routes d'API du back-office (fonctions RPC).
-- Réservées à l'équipe : chaque fonction vérifie le rôle avant d'agir.

-- Première consultation d'une demande par une personne (une seule trace par personne).
create function public.mark_booking_viewed(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user public.admin_users := app_private.require_role('administrateur', 'editeur', 'operateur');
begin
  if not exists (
    select 1 from public.booking_events
    where booking_id = p_booking_id and type = 'viewed' and actor_id = v_user.id
  ) and exists (select 1 from public.bookings where id = p_booking_id) then
    perform app_private.add_booking_event(p_booking_id, 'viewed', 'Demande consultée');
  end if;
end;
$$;

-- Trace d'une réponse envoyée depuis la messagerie de la personne (modèle de réponse standard).
create function public.log_booking_reply(p_booking_id uuid, p_subject text, p_recipient text)
returns public.booking_events
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_role('administrateur', 'operateur');
  if not exists (select 1 from public.bookings where id = p_booking_id) then
    perform app_private.raise_business_error('not_found', 'Cette demande est introuvable. Elle a peut-être été supprimée.');
  end if;
  return app_private.add_booking_event(
    p_booking_id,
    'reply_sent',
    format('E-mail « %s » envoyé à %s', left(btrim(p_subject), 200), left(btrim(p_recipient), 254))
  );
end;
$$;

-- Ordre d'affichage des services : échange avec le voisin du dessus ou du dessous.
create function public.move_service(p_service_id text, p_direction text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.services;
  v_neighbour public.services;
begin
  perform app_private.require_role('administrateur', 'editeur');
  select * into v_current from public.services where id = p_service_id for update;
  if not found then
    perform app_private.raise_business_error('not_found', 'Ce service est introuvable.');
  end if;

  if p_direction = 'up' then
    select * into v_neighbour from public.services
    where (sort_order, id) < (v_current.sort_order, v_current.id)
    order by sort_order desc, id desc limit 1 for update;
  elsif p_direction = 'down' then
    select * into v_neighbour from public.services
    where (sort_order, id) > (v_current.sort_order, v_current.id)
    order by sort_order, id limit 1 for update;
  else
    perform app_private.raise_business_error('validation', 'Sens de déplacement inconnu.');
  end if;

  if v_neighbour.id is not null then
    update public.services set sort_order = v_neighbour.sort_order where id = v_current.id;
    update public.services set sort_order = v_current.sort_order where id = v_neighbour.id;
  end if;
end;
$$;

-- Dernière connexion (affichée dans « Utilisateurs & rôles » et « Mon compte »).
create function public.record_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_role('administrateur', 'editeur', 'operateur');
  update public.admin_users set last_login_at = now() where id = (select auth.uid());
end;
$$;

-- Date du dernier changement de mot de passe (le changement lui-même passe par Supabase Auth).
create function public.mark_password_changed()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.admin_users set password_changed_at = now() where id = (select auth.uid());
end;
$$;

grant execute on function public.mark_booking_viewed(uuid) to authenticated;
grant execute on function public.log_booking_reply(uuid, text, text) to authenticated;
grant execute on function public.move_service(text, text) to authenticated;
grant execute on function public.record_login() to authenticated;
grant execute on function public.mark_password_changed() to authenticated;
