import { Tag } from '@/components/ui';
import { isoDateOf } from '@/lib/dates';
import { formatShortDate } from '@/lib/format';
import type { Article, Category } from '@/types';

interface ArticleMetaProps {
  article: Article;
  category?: Category;
  /** Ajoute l'étiquette « À la une » */
  featured?: boolean;
  /** « 6 min » (cartes) ou « 6 min de lecture » (article à la une) */
  longReadingLabel?: boolean;
}

/** Ligne d'informations d'un article : catégorie, date de publication, temps de lecture. */
export function ArticleMeta({
  article,
  category,
  featured = false,
  longReadingLabel = false,
}: ArticleMetaProps) {
  const publishedOn = isoDateOf(article.publishedAt ?? article.updatedAt);
  return (
    <div className="flex flex-wrap items-center gap-3 text-[13.5px] text-muted">
      {featured ? <Tag>À la une</Tag> : null}
      {category ? <Tag tone={featured ? 'neutral' : category.tone}>{category.name}</Tag> : null}
      <time dateTime={publishedOn}>{formatShortDate(publishedOn)}</time>
      <span className="size-[3px] rounded-full bg-subtle" aria-hidden />
      <span>
        {article.readingMinutes} min{longReadingLabel ? ' de lecture' : ''}
      </span>
    </div>
  );
}
