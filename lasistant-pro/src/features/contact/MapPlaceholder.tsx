import type { CSSProperties, ReactNode } from 'react';
import { IconAddress } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * Plan stylisé affiché à la place de la carte interactive :
 * tant que l'adresse complète n'est pas validée, ou si le visiteur refuse les contenus tiers.
 * Les tracés sont purement décoratifs.
 */

interface Road {
  style: CSSProperties;
}

const LAYOUTS: Record<
  'contact' | 'about',
  { roads: Road[]; pin: CSSProperties; message: { top: string; left: string } }
> = {
  contact: {
    roads: [
      { style: { left: 0, right: 0, top: '52%', height: 16 } },
      { style: { top: 0, bottom: 0, left: '30%', width: 12 } },
      { style: { top: 0, bottom: 0, left: '68%', width: 10 } },
      { style: { left: 0, right: '30%', top: '22%', height: 9, transform: 'rotate(-8deg)' } },
    ],
    pin: { left: 'calc(30% - 16px)', top: 'calc(52% - 52px)' },
    message: { top: '30%', left: '66%' },
  },
  about: {
    roads: [
      { style: { left: 0, right: 0, top: '46%', height: 14 } },
      { style: { top: 0, bottom: 0, left: '38%', width: 12 } },
      { style: { left: '20%', right: 0, top: '18%', height: 8, transform: 'rotate(-12deg)' } },
    ],
    pin: { left: 'calc(38% - 16px)', top: 'calc(46% - 50px)' },
    message: { top: '76%', left: '50%' },
  },
};

interface MapPlaceholderProps {
  layout?: keyof typeof LAYOUTS;
  children: ReactNode;
  className?: string;
}

export function MapPlaceholder({ layout = 'contact', children, className }: MapPlaceholderProps) {
  const { roads, pin, message } = LAYOUTS[layout];
  return (
    <div className={cn('map-grid relative min-h-[360px] overflow-hidden rounded-card', className)}>
      {roads.map((road, index) => (
        <span
          key={index}
          aria-hidden
          className="absolute bg-white shadow-[0_0_0_1px_var(--color-map-road)]"
          style={road.style}
        />
      ))}
      <span
        aria-hidden
        className="absolute size-11 -rotate-45 rounded-[50%_50%_50%_0] bg-brand shadow-raised"
        style={pin}
      />
      <div
        className="absolute bottom-5 left-1/2 flex w-[calc(100%-40px)] max-w-[340px] -translate-x-1/2 items-center gap-3.5 rounded-[18px] bg-white px-5.5 py-4.5 shadow-raised md:top-(--message-top) md:bottom-auto md:left-(--message-left) md:-translate-y-1/2"
        // Position du message sur grand écran (sur mobile, il est ancré en bas du plan).
        style={{ '--message-top': message.top, '--message-left': message.left } as CSSProperties}
      >
        <IconAddress className="size-4.5 shrink-0 text-brand" aria-hidden />
        <div className="text-[15px]">{children}</div>
      </div>
    </div>
  );
}
