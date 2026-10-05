import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { IconChevronLeft, IconChevronRight } from './icons';

/**
 * Éléments de navigation secondaires : fil d'Ariane et pagination.
 */

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Fil d’Ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-2.5 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2.5">
            {index > 0 ? <IconChevronRight className="size-3.5 text-subtle" aria-hidden /> : null}
            {item.to ? (
              <Link
                to={item.to}
                className="transition-colors hover:text-ink hover:underline hover:underline-offset-4"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Pagination numérotée accessible (page courante annoncée). */
export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const itemClasses =
    'inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-[15px] font-semibold transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
      <button
        type="button"
        className={itemClasses}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
      >
        <IconChevronLeft className="size-4.5" aria-hidden />
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          aria-current={number === page ? 'page' : undefined}
          aria-label={`Page ${number}`}
          className={cn(itemClasses, number === page && 'border-ink bg-ink text-white hover:border-ink')}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        className={itemClasses}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Page suivante"
      >
        <IconChevronRight className="size-4.5" aria-hidden />
      </button>
    </nav>
  );
}
