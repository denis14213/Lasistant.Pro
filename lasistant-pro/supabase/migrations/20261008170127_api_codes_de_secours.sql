-- LASISTANT.PRO · Codes de secours de la double authentification.
-- Les nouveaux codes sont renvoyés une seule fois ; seules leurs empreintes sont conservées.
-- Les anciens codes sont invalidés (jamais réutilisables). Leur consommation à la connexion
-- passe par l'Edge Function « mfa-recovery » (API d'administration de Supabase Auth).

create function public.regenerate_recovery_codes()
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_count constant integer := 8;
  c_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_user public.admin_users := app_private.require_role('administrateur', 'editeur', 'operateur');
  v_codes text[] := '{}';
  v_bytes bytea;
  v_code text;
begin
  if not v_user.two_factor_enabled or coalesce((select auth.jwt()) ->> 'aal', 'aal1') <> 'aal2' then
    perform app_private.raise_business_error('validation', 'Activez d’abord la double authentification.');
  end if;

  update public.mfa_recovery_codes set used_at = now() where user_id = v_user.id and used_at is null;
  for i in 1..c_count loop
    v_bytes := extensions.gen_random_bytes(8);
    v_code := '';
    for j in 0..7 loop
      v_code := v_code || substr(c_alphabet, (get_byte(v_bytes, j) % 32) + 1, 1);
    end loop;
    v_code := left(v_code, 4) || '-' || right(v_code, 4);
    v_codes := v_codes || v_code;
    insert into public.mfa_recovery_codes (user_id, code_hash)
    values (v_user.id, extensions.crypt(v_code, extensions.gen_salt('bf', 8)));
  end loop;

  update public.admin_users set recovery_codes_remaining = c_count where id = v_user.id;
  return v_codes;
end;
$$;

grant execute on function public.regenerate_recovery_codes() to authenticated;
