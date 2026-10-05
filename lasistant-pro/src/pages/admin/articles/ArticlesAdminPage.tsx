import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { allArticlesQuery, categoriesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import {
  AdminPage,
  AdminPageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from '@/components/admin/AdminPage';
import { AdminTable } from '@/components/admin/AdminTable';
import { FilterTabs } from '@/components/admin/FilterTabs';
import { Seo } from '@/components/seo/Seo';
import {
  Badge,
  Button,
  ButtonAnchor,
  ButtonLink,
  EmptyState,
  IconLink,
  ResponsiveImage,
  Tag,
} from '@/components/ui';
import { Input, Select, Switch } from '@/components/ui/form';
import { IconAdd, IconSearch } from '@/components/ui/icons';
import { IconArticles, IconEdit, IconPreview } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { ARTICLE_STATUS_LABELS } from '@/content/labels';
import { useArticleActions } from '@/features/admin/articles/useArticleActions';
import { useCurrentMinute } from '@/hooks/useNow';
import { isoDateOf } from '@/lib/dates';
import { formatRelative, formatShortDate } from '@/lib/format';
import { matchesQuery, pluralize } from '@/lib/text';
import type { ArticleStatus } from '@/types';

export const loader = () => prefetch(allArticlesQuery(), categoriesQuery(true));

type StatusFilter = ArticleStatus | 'tous';

/**
 * Articles et catégories de l'Espace infos (cahier des charges § 8.6).
 * Publication, archivage et suppression se font depuis l'éditeur de l'article.
 */
export function Component() {
  const now = useCurrentMinute();
  const { data: articles } = useSuspenseQuery(allArticlesQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery(true));
  const { createCategory, toggleCategory } = useArticleActions();
  const [status, setStatus] = useState<StatusFilter>('tous');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('toutes');
  const [newCategory, setNewCategory] = useState('');

  const categoryOf = (id: string) => categories.find((category) => category.id === id);
  const searched = articles.filter(
    (article) =>
      (categoryId === 'toutes' || article.categoryId === categoryId) &&
      matchesQuery(`${article.title} ${article.excerpt} ${article.slug}`, query),
  );
  const visible = status === 'tous' ? searched : searched.filter((article) => article.status === status);
  const tabs = [
    { value: 'tous' as const, label: 'Tous', count: searched.length },
    {
      value: 'publie' as const,
      label: 'Publiés',
      count: searched.filter((article) => article.status === 'publie').length,
    },
    {
      value: 'brouillon' as const,
      label: 'Brouillons',
      count: searched.filter((article) => article.status === 'brouillon').length,
    },
    {
      value: 'archive' as const,
      label: 'Archivés',
      count: searched.filter((article) => article.status === 'archive').length,
    },
  ];

  return (
    <AdminPage>
      <Seo title="Articles & catégories" description="Gestion de l’Espace infos." noIndex />
      <AdminPageHeader
        title="Articles & catégories"
        description="Rédigez et publiez les contenus de l’Espace infos."
        actions={
          <>
            <ButtonAnchor
              href={ROUTES.articles}
              target="_blank"
              rel="noopener"
              variant="outline"
              shape="rounded"
              icon={<IconPreview />}
            >
              Voir l’Espace infos<span className="sr-only"> (nouvel onglet)</span>
            </ButtonAnchor>
            <ButtonLink to={ROUTES.admin.articleNew} shape="rounded" icon={<IconAdd />}>
              Nouvel article
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel labelledBy="liste-articles">
          <h2 id="liste-articles" className="sr-only">
            Liste des articles
          </h2>
          <FilterTabs label="Filtrer par statut" tabs={tabs} value={status} onChange={setStatus} />
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5">
            <label className="flex h-[38px] w-full max-w-[320px] items-center gap-2.5 rounded-[10px] bg-cloud px-3.5 text-muted focus-within:bg-white focus-within:ring-1 focus-within:ring-brand">
              <IconSearch className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">Rechercher un article</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un article…"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder md:text-sm"
              />
            </label>
            <Select
              aria-label="Filtrer par catégorie"
              density="compact"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="min-h-[38px] w-auto text-sm"
            >
              <option value="toutes">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          {visible.length === 0 ? (
            <EmptyState
              icon={<IconArticles />}
              tone="brand"
              title="Aucun article"
              description="Aucun article ne correspond à ces critères."
              actions={
                <ButtonLink to={ROUTES.admin.articleNew} shape="rounded" icon={<IconAdd />}>
                  Rédiger un article
                </ButtonLink>
              }
            />
          ) : (
            <AdminTable minWidth={680} caption="Articles de l’Espace infos">
              <thead>
                <tr>
                  <th scope="col">Article</th>
                  {/* « w-px » : ces colonnes prennent la largeur de leur contenu, le titre prend le reste. */}
                  <th scope="col" className="w-px">
                    Catégorie
                  </th>
                  <th scope="col" className="w-px">
                    Statut
                  </th>
                  <th scope="col" className="w-px">
                    Publication
                  </th>
                  <th scope="col" className="w-px">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((article) => {
                  const category = categoryOf(article.categoryId);
                  return (
                    <tr key={article.id}>
                      {/* « max-w-0 w-full » : la colonne prend la place restante et l'adresse se tronque. */}
                      <td className="w-full max-w-0 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <ResponsiveImage
                            image={article.coverImage}
                            alt=""
                            sizes="64px"
                            className="h-12 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <Link
                              to={ROUTES.admin.articleEdit(article.id)}
                              title={article.title}
                              className="line-clamp-2 font-semibold text-ink hover:text-brand"
                            >
                              {article.title}
                            </Link>
                            <span
                              className="block truncate font-mono text-[12.5px] text-muted"
                              title={ROUTES.article(article.slug)}
                            >
                              {ROUTES.article(article.slug)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="w-px whitespace-nowrap">
                        {category ? <Tag tone={category.tone}>{category.name}</Tag> : '—'}
                      </td>
                      <td className="w-px whitespace-nowrap">
                        <Badge tone={article.status === 'publie' ? 'success' : 'neutral'}>
                          {ARTICLE_STATUS_LABELS[article.status]}
                        </Badge>
                      </td>
                      <td className="w-px whitespace-nowrap text-muted">
                        {article.status === 'publie' && article.publishedAt
                          ? formatShortDate(isoDateOf(article.publishedAt))
                          : `Modifié ${formatRelative(article.updatedAt, new Date(now), 'short')}`}
                      </td>
                      <td className="w-px text-right">
                        <IconLink
                          to={ROUTES.admin.articleEdit(article.id)}
                          label={`Modifier « ${article.title} »`}
                          variant="ghost"
                          size="sm"
                        >
                          <IconEdit aria-hidden />
                        </IconLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>
          )}
          <PanelFooter>
            <span>{pluralize(visible.length, 'article')}</span>
          </PanelFooter>
        </Panel>

        <Panel labelledBy="categories">
          <PanelHeader
            titleId="categories"
            title="Catégories"
            description="Utilisées pour filtrer l’Espace infos"
          />
          <ul>
            {categories.map((category) => {
              const count = articles.filter((article) => article.categoryId === category.id).length;
              return (
                <li key={category.id} className="flex items-center gap-3 border-b border-line px-4.5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <strong className="block font-semibold">{category.name}</strong>
                    <span className="font-mono text-[12.5px] text-muted">{category.slug}</span>
                  </div>
                  <span className="text-[13px] text-muted" title={pluralize(count, 'article')}>
                    {count}
                  </span>
                  <Switch
                    checked={category.active}
                    disabled={toggleCategory.isPending}
                    label={`Catégorie « ${category.name} » ${category.active ? 'active' : 'inactive'}`}
                    onCheckedChange={(active) => toggleCategory.mutate({ id: category.id, active })}
                  />
                </li>
              );
            })}
          </ul>
          <PanelBody className="flex flex-col gap-2.5">
            <form
              className="flex flex-col gap-2.5"
              onSubmit={(event) => {
                event.preventDefault();
                if (newCategory.trim().length < 3) return;
                createCategory.mutate(newCategory, { onSuccess: () => setNewCategory('') });
              }}
            >
              <label htmlFor="nouvelle-categorie" className="text-[13.5px] font-semibold">
                Nouvelle catégorie
              </label>
              <div className="flex gap-2">
                <Input
                  id="nouvelle-categorie"
                  density="compact"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="Nom de la catégorie"
                />
                <Button
                  type="submit"
                  variant="dark"
                  shape="rounded"
                  loading={createCategory.isPending}
                  disabled={newCategory.trim().length < 3}
                >
                  Ajouter
                </Button>
              </div>
              <p className="text-[13px] text-muted">Le slug est créé automatiquement à partir du nom.</p>
            </form>
          </PanelBody>
        </Panel>
      </div>
    </AdminPage>
  );
}
