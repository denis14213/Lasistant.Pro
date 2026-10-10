-- =============================================================================
-- LASISTANT.PRO · 5/6 · Stockage des fichiers et temps réel
--
-- - « medias » (public) : images du site, optimisées en WebP par le back-office.
-- - « documents » (privé) : pièces jointes des demandes et documents sensibles,
--   jamais exposés publiquement (accès par URL signée de courte durée).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('medias', 'medias', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Garde-fou contre le dépôt massif de pièces jointes par des robots (tous visiteurs confondus).
create function app_private.recent_attachment_uploads()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects
  where bucket_id = 'documents'
    and name like 'demandes/%'
    and created_at > now() - interval '10 minutes';
$$;
revoke execute on function app_private.recent_attachment_uploads() from public;
grant execute on function app_private.recent_attachment_uploads() to anon, authenticated;

-- Images du site : gérées par les administrateurs et les éditeurs.
create policy "medias : lecture par les éditeurs" on storage.objects
  for select to authenticated
  using (bucket_id = 'medias' and (select app_private.has_role('administrateur', 'editeur')));
create policy "medias : dépôt par les éditeurs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'medias' and (select app_private.has_role('administrateur', 'editeur')));
create policy "medias : remplacement par les éditeurs" on storage.objects
  for update to authenticated
  using (bucket_id = 'medias' and (select app_private.has_role('administrateur', 'editeur')));
create policy "medias : suppression par les éditeurs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'medias' and (select app_private.has_role('administrateur', 'editeur')));

-- Documents privés : administrateurs et opérateurs.
create policy "documents : lecture par les opérateurs" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (select app_private.has_role('administrateur', 'operateur')));
create policy "documents : dépôt par les opérateurs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (select app_private.has_role('administrateur', 'operateur')));
create policy "documents : suppression par les opérateurs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (select app_private.has_role('administrateur', 'operateur')));

-- Pièce jointe d'une demande publique : dépôt seul (aucune lecture), dans « demandes/<uuid>/<fichier> ».
create policy "documents : pièce jointe d'une demande" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'demandes'
    and array_length(storage.foldername(name), 1) = 2
    and (select app_private.recent_attachment_uploads()) < 60
  );

-- Temps réel : le back-office est prévenu des nouvelles demandes et de leur suivi
-- (les politiques RLS s'appliquent aussi aux événements diffusés).
alter publication supabase_realtime add table public.bookings, public.booking_events, public.internal_notes;
