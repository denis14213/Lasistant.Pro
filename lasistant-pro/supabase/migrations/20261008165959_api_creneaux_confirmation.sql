-- LASISTANT.PRO · Routes publiques en lecture : créneaux pris et page de confirmation.

-- Créneaux déjà pris : la date et l'heure seulement, jamais l'identité.
create function public.taken_slots()
returns table (slot_date date, slot_time text)
language sql
stable
security definer
set search_path = ''
as $$
  select b.requested_date, b.requested_time
  from public.bookings b
  where b.requested_date >= (now() at time zone 'Africa/Tunis')::date
    and b.status in ('nouveau', 'en_cours', 'confirme');
$$;

-- Récapitulatif de la page de confirmation : référence et clé secrète exigées, aucune donnée personnelle.
create function public.booking_confirmation(p_reference text, p_key uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'reference', b.reference,
    'confirmation_key', b.confirmation_key,
    'source', b.source,
    'service_id', b.service_id,
    'requested_date', b.requested_date,
    'requested_time', b.requested_time,
    'contact_preference', b.contact_preference,
    'housing', b.housing,
    'created_at', b.created_at
  )
  from public.bookings b
  where b.reference = p_reference and b.confirmation_key = p_key;
$$;

grant execute on function public.taken_slots() to anon, authenticated;
grant execute on function public.booking_confirmation(text, uuid) to anon, authenticated;
