-- =============================================================================
-- LASISTANT.PRO · Durcissement des droits (défense en profondeur)
--
-- Les rôles de l'API (anon, authenticated) ne reçoivent que ce dont le site a besoin :
--   - ils ne peuvent pas émettre de requêtes HTTP depuis la base (pg_net) : seules les fonctions
--     de la base (propriétaire postgres, SECURITY DEFINER) appellent l'Edge Function d'envoi ;
--   - ils ne peuvent pas exécuter la fonction d'activation automatique du RLS fournie par
--     Supabase (événement « ensure_rls »), qui n'a pas à être appelée par l'API.
-- =============================================================================

revoke usage on schema net from anon, authenticated;
revoke execute on all functions in schema net from anon, authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
