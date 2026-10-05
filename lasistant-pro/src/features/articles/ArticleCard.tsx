import { Link } from 'react-router';
import { LogoMark } from '@/components/brand/Logo';
import { ResponsiveImage } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import type { Article, Category } from '@/types';
import { ArticleMeta } from './ArticleMeta';

interface ArticleCardProps {
  article: Article;
  category?: Category;
  /** Niveau du titre selon la page (h2 dans une liste sans intertitre, h3 sinon) */
  headingLevel?: 'h2' | 'h3';
}

/** Carte d'article : visuel, informations, titre et résumé. Toute la carte est cliquable. */
export function ArticleCard({ article, category, headingLevel: Heading = 'h3' }: ArticleCardProps) {
  return (
    <Link to={ROUTES.article(article.slug)} className="group flex flex-col gap-4.5">
      <div className="aspect-[16/11] overflow-hidden rounded-box bg-mist">
        <ResponsiveImage
          image={article.coverImage}
          alt={article.coverAlt}
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <ArticleMeta article={article} category={category} />
      <Heading className="text-[22px] leading-[1.22] font-semibold tracking-[-0.02em] transition-colors group-hover:text-brand">
        {article.title}
      </Heading>
      <p className="text-[15.5px] text-muted">{article.excerpt}</p>
    </Link>
  );
}

/** Article mis à la une, en tête de l'Espace infos. */
export function FeaturedArticle({ article, category }: { article: Article; category?: Category }) {
  return (
    <Link
      to={ROUTES.article(article.slug)}
      className="group grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14"
    >
      <div className="aspect-[16/10] overflow-hidden rounded-[28px] bg-mist">
        <ResponsiveImage
          image={article.coverImage}
          alt={article.coverAlt}
          priority
          sizes="(min-width: 1024px) 700px, 100vw"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-col gap-5">
        <ArticleMeta article={article} category={category} featured longReadingLabel />
        <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.03em] transition-colors group-hover:text-brand max-[359px]:text-[min(1.75rem,9.3vw)]">
          {article.title}
        </h2>
        <p className="text-lg leading-[1.6] text-muted">{article.excerpt}</p>
        <p className="mt-1 flex items-center gap-3 text-sm font-semibold">
          <span className="flex size-[34px] items-center justify-center rounded-[10px] border border-line bg-white">
            <LogoMark size={24} />
          </span>
          {article.author}
        </p>
        <span className="inline-flex w-fit items-center gap-2 border-b border-transparent font-semibold text-brand group-hover:border-current">
          Lire l’article
          <IconArrowRight
            className="size-[1.1em] transition-transform group-hover:translate-x-[3px]"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
