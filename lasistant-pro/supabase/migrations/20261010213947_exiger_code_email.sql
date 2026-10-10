-- =============================================================================
-- LASISTANT.PRO · Le code reçu par e-mail devient obligatoire
--
-- Une session de connexion n'a accès aux données de l'équipe que si elle a été vérifiée par
-- le code envoyé par e-mail (voir « double_authentification_email »). L'application
-- d'authentification (TOTP) n'est plus utilisée.
-- =============================================================================

create or replace function app_private.staff_role()
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
    and app_private.session_verified();
$$;
comment on function app_private.staff_role() is
  'Rôle de la personne connectée : null si compte inconnu, désactivé, ou session non vérifiée par le code e-mail.';
