-- =============================================================================
-- LASISTANT.PRO · Clé du service d'envoi conservée dans le coffre (Vault)
--
-- La clé Resend (droit d'envoi seul, limitée au domaine d'expédition) est conservée chiffrée
-- dans le coffre, sous le nom « resend_api_key » ; elle n'apparaît dans aucun fichier.
-- L'Edge Function « envoi-emails » la lit par la route ci-dessous, réservée à la clé secrète
-- du projet et soumise au jeton d'appel. Un secret RESEND_API_KEY défini dans les Edge Functions
-- reste prioritaire.
--
-- Renouveler la clé : select vault.update_secret(id, 're_…') from vault.secrets where name = 'resend_api_key';
-- =============================================================================

create function public.outbox_provider_key(p_token text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform app_private.assert_outbox_token(p_token);
  return app_private.config_value('resend_api_key');
end;
$$;

revoke execute on function public.outbox_provider_key(text) from public, anon, authenticated;
grant execute on function public.outbox_provider_key(text) to service_role;
