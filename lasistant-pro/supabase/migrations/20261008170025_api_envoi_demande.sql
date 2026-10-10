-- LASISTANT.PRO · Route publique d'envoi d'une demande (réservation, logement, demande rapide, contact).
-- Erreurs métier : code dans `message` (validation, rate_limited), texte affiché dans `detail`.

create function public.submit_booking(p_booking jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  c_max_attempts constant integer := 5;
  c_window constant interval := interval '10 minutes';
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
  v_ip text;
  v_ip_hash text;
  v_recent integer;
  v_oldest timestamptz;
  v_source public.booking_source;
  v_service_id text := app_private.text_or_null(p_booking ->> 'serviceId');
  v_date date;
  v_time text := app_private.text_or_null(p_booking ->> 'requestedTime');
  v_attachment text := app_private.text_or_null(p_booking ->> 'attachmentPath');
  v_booking public.bookings;
  v_constraint text;
begin
  -- 1. Limitation des envois : 5 demandes par adresse IP sur 10 minutes.
  -- Adresse du visiteur : en-tête posé par le proxy de Supabase (non falsifiable), sinon repli.
  v_ip := coalesce(
    app_private.text_or_null(v_headers ->> 'cf-connecting-ip'),
    app_private.text_or_null(v_headers ->> 'x-real-ip'),
    app_private.text_or_null(split_part(v_headers ->> 'x-forwarded-for', ',', 1)),
    'inconnue'
  );
  v_ip_hash := encode(extensions.digest('lasistant:' || v_ip, 'sha256'), 'hex');
  select count(*), min(created_at) into v_recent, v_oldest
  from public.submission_attempts
  where ip_hash = v_ip_hash and created_at > now() - c_window;
  if v_recent >= c_max_attempts then
    perform app_private.raise_business_error(
      'rate_limited',
      to_char((v_oldest + c_window) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    );
  end if;

  -- 2. Contrôles (le formulaire les applique déjà ; ils sont repris ici car le client n'est jamais sûr).
  begin
    v_source := (p_booking ->> 'source')::public.booking_source;
    v_date := app_private.text_or_null(p_booking ->> 'requestedDate')::date;
  exception when others then
    perform app_private.raise_business_error('validation', 'Certaines informations sont invalides. Vérifiez le formulaire.');
  end;
  if v_source is null then
    perform app_private.raise_business_error('validation', 'Type de demande inconnu.');
  end if;
  if char_length(coalesce(app_private.text_or_null(p_booking ->> 'fullName'), '')) < 2 then
    perform app_private.raise_business_error('validation', 'Indiquez votre nom complet.');
  end if;
  if coalesce(btrim(p_booking ->> 'email'), '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    perform app_private.raise_business_error('validation', 'Saisissez une adresse e-mail valide.');
  end if;
  if v_service_id is not null
     and not exists (select 1 from public.services where id = v_service_id and active) then
    perform app_private.raise_business_error('validation', 'Ce service n’est plus proposé. Choisissez-en un autre.');
  end if;
  if (v_date is null) <> (v_time is null)
     or (v_time is not null and v_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') then
    perform app_private.raise_business_error('validation', 'Choisissez une date et une heure.');
  end if;
  if v_source = 'reservation' and v_date is null then
    perform app_private.raise_business_error('validation', 'Choisissez un créneau pour votre rendez-vous.');
  end if;
  if v_date is not null and not app_private.is_bookable_slot(v_date, v_time) then
    perform app_private.raise_business_error('validation', 'Ce créneau n’est plus disponible. Choisissez-en un autre.');
  end if;
  if v_source = 'logement' and jsonb_typeof(p_booking -> 'housing') is distinct from 'object' then
    perform app_private.raise_business_error('validation', 'Précisez vos critères de logement.');
  end if;
  if v_source = 'contact' and app_private.text_or_null(p_booking ->> 'message') is null then
    perform app_private.raise_business_error('validation', 'Écrivez votre message.');
  end if;
  if v_attachment is not null and (
    v_attachment not like 'demandes/%'
    or not exists (select 1 from storage.objects where bucket_id = 'documents' and name = v_attachment)
    or exists (select 1 from public.bookings where attachment_path = v_attachment)
  ) then
    perform app_private.raise_business_error('validation', 'La pièce jointe est introuvable. Ajoutez-la de nouveau.');
  end if;

  insert into public.submission_attempts (ip_hash) values (v_ip_hash);

  -- 3. Enregistrement (référence, historique et e-mails sont produits par les déclencheurs).
  perform set_config('app.channel', 'site', true);
  begin
    insert into public.bookings (
      source, service_id, subject, full_name, email, phone, country, profile,
      requested_date, requested_time, contact_preference, arrival_date, stay_duration,
      message, housing, attachment_name, attachment_path
    )
    values (
      v_source,
      v_service_id,
      app_private.text_or_null(p_booking ->> 'subject'),
      btrim(p_booking ->> 'fullName'),
      p_booking ->> 'email',
      app_private.text_or_null(p_booking ->> 'phone'),
      app_private.text_or_null(p_booking ->> 'country'),
      app_private.text_or_null(p_booking ->> 'profile')::public.applicant_profile,
      v_date,
      v_time,
      app_private.text_or_null(p_booking ->> 'contactPreference')::public.contact_preference,
      app_private.text_or_null(p_booking ->> 'arrivalDate'),
      app_private.text_or_null(p_booking ->> 'stayDuration'),
      app_private.text_or_null(p_booking ->> 'message'),
      case when jsonb_typeof(p_booking -> 'housing') = 'object' then p_booking -> 'housing' end,
      app_private.text_or_null(p_booking ->> 'attachmentName'),
      v_attachment
    )
    returning * into v_booking;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;
      perform app_private.raise_business_error(
        'validation',
        case when v_constraint = 'bookings_slot_unique_idx'
          then 'Ce créneau vient d’être réservé. Choisissez-en un autre.'
          else 'Cette demande a déjà été enregistrée.'
        end
      );
    when check_violation or invalid_text_representation then
      perform app_private.raise_business_error('validation', 'Certaines informations sont invalides. Vérifiez le formulaire.');
  end;
  perform set_config('app.channel', '', true);

  return to_jsonb(v_booking);
end;
$$;
comment on function public.submit_booking(jsonb) is
  'Envoi d''une demande depuis le site : contrôles, limitation (5 / 10 min / IP), référence, historique et e-mails.';

grant execute on function public.submit_booking(jsonb) to anon, authenticated;
