import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconExpand } from './icons';

/**
 * Accordéon : une seule réponse ouverte à la fois.
 * Contrôlé (openId + onOpenChange) ou autonome (defaultOpenId).
 */

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  openId?: string | null;
  defaultOpenId?: string | null;
  onOpenChange?: (id: string | null) => void;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

export function Accordion({
  items,
  openId,
  defaultOpenId = null,
  onOpenChange,
  headingLevel: Heading = 'h3',
  className,
}: AccordionProps) {
  const baseId = useId();
  const [internalOpenId, setInternalOpenId] = useState<string | null>(defaultOpenId);
  const currentOpenId = openId !== undefined ? openId : internalOpenId;

  const toggle = (id: string) => {
    const next = currentOpenId === id ? null : id;
    setInternalOpenId(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item) => {
        const isOpen = currentOpenId === item.id;
        const buttonId = `${baseId}-${item.id}-bouton`;
        const panelId = `${baseId}-${item.id}-panneau`;
        return (
          <div key={item.id} className="border-b border-line">
            <Heading className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex w-full items-center justify-between gap-6 py-5.5 text-left text-[17px] leading-snug font-semibold tracking-[-0.012em] text-ink transition-colors hover:text-brand md:py-6.5 md:text-[19px]"
              >
                <span>{item.title}</span>
                <span
                  className={cn(
                    'flex size-[38px] shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-[transform,background-color,color] duration-300',
                    isOpen && 'rotate-45 border-ink bg-ink text-white',
                  )}
                  aria-hidden
                >
                  <IconExpand className="size-4" />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="max-w-[860px] pb-7 text-[16.5px] leading-[1.65] text-muted md:pr-18"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
