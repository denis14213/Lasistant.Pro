import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface TableOfContentsProps {
  /** Nom du sommaire pour les lecteurs d'écran */
  label?: string;
  items: ReadonlyArray<{ id: string; text: string }>;
  className?: string;
}

/**
 * Sommaire d'un contenu long (article, mentions légales) : la section en cours de lecture est mise en évidence.
 */
export function TableOfContents({ items, label = 'Sommaire', className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Une section devient active lorsqu'elle atteint le haut de la zone de lecture.
      { rootMargin: '-120px 0px -60% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={cn('flex flex-col gap-0.5 text-[14.5px]', className)}>
      <p className="px-3.5 pb-3 text-xs font-bold tracking-[0.14em] text-muted uppercase">Sommaire</p>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active ? 'location' : undefined}
            className={cn(
              'rounded-[10px] px-3.5 py-[9px] leading-[1.35] text-muted transition-colors hover:bg-ink/4 hover:text-ink',
              active && 'bg-mist font-semibold text-brand-dark hover:bg-mist hover:text-brand-dark',
            )}
          >
            {item.text}
          </a>
        );
      })}
    </nav>
  );
}
