-- LASISTANT.PRO · Droits d'exécution des routes d'API.
-- Les routes du back-office ne sont pas appelables par un visiteur anonyme
-- (elles vérifient en plus le rôle de la personne connectée).

revoke execute on function public.mark_booking_viewed(uuid) from public, anon;
revoke execute on function public.log_booking_reply(uuid, text, text) from public, anon;
revoke execute on function public.move_service(text, text) from public, anon;
revoke execute on function public.record_login() from public, anon;
revoke execute on function public.mark_password_changed() from public, anon;
revoke execute on function public.regenerate_recovery_codes() from public, anon;

-- Fonctions internes : seules celles utilisées par les politiques RLS restent exécutables.
revoke execute on all functions in schema app_private from public, anon, authenticated;
grant execute on function app_private.staff_role() to anon, authenticated;
grant execute on function app_private.has_role(public.admin_role[]) to anon, authenticated;
grant execute on function app_private.is_staff() to anon, authenticated;
grant execute on function app_private.recent_attachment_uploads() to anon, authenticated;
