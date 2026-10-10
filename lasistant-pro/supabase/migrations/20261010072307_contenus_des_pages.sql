-- =============================================================================
-- LASISTANT.PRO · Contenus des pages du site
--
-- Textes et visuels de chaque page (accueil, services, pages légales, contenus communs…),
-- modifiables depuis le back-office (« Pages du site »). Un contenu est un document JSON
-- dont la structure est celle des contenus d'origine (src/content/pages) : le site complète
-- toujours une version partielle avec la structure d'origine.
-- =============================================================================

create table public.page_contents (
  key text primary key check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by text not null default '',
  -- Garde-fou contre un document démesuré (une page fait quelques kilo-octets).
  constraint page_contents_size check (pg_column_size(content) < 262144)
);
comment on table public.page_contents is 'Textes et visuels des pages du site, modifiables depuis le back-office.';

-- -----------------------------------------------------------------------------
-- Droits : lecture publique, écriture par les éditeurs et les administrateurs
-- -----------------------------------------------------------------------------
revoke all on public.page_contents from anon, authenticated;
grant select on public.page_contents to anon, authenticated;
grant insert (key, content) on public.page_contents to authenticated;
grant update (key, content) on public.page_contents to authenticated;

alter table public.page_contents enable row level security;

create policy "Pages : lecture publique" on public.page_contents
  for select to anon, authenticated using (true);
create policy "Pages : ajout par les éditeurs" on public.page_contents
  for insert to authenticated with check ((select app_private.has_role('administrateur', 'editeur')));
create policy "Pages : modification par les éditeurs" on public.page_contents
  for update to authenticated
  using ((select app_private.has_role('administrateur', 'editeur')))
  with check ((select app_private.has_role('administrateur', 'editeur')));

-- -----------------------------------------------------------------------------
-- Date, auteur et journal d'activité tenus par la base
-- -----------------------------------------------------------------------------
create trigger page_contents_touch before update on public.page_contents
  for each row execute function app_private.touch_updated_at();
create trigger page_contents_stamp before insert or update on public.page_contents
  for each row execute function app_private.stamp_updated_by();

create function app_private.page_contents_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    perform app_private.log_activity(format('Contenu de la page « %s » modifié', new.key), 'content');
  end if;
  return null;
end;
$$;
revoke execute on function app_private.page_contents_log() from public, anon, authenticated;

create trigger page_contents_log after insert or update on public.page_contents
  for each row execute function app_private.page_contents_log();
