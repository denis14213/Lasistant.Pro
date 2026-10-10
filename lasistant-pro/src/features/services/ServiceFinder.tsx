import { Link } from 'react-router';
import { Card, IconBox } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { usePageContent } from '@/features/content/usePageContent';

/**
 * Orientation rapide : le visiteur choisit sa situation et rejoint le bon service.
 */
export function ServiceFinder() {
  const { finder } = usePageContent('services');
  return (
    <Card className="relative z-[2] p-3 shadow-raised">
      <div className="px-4.5 pt-4.5 pb-3">
        <p className="eyebrow text-[11.5px]">{finder.eyebrow}</p>
        <h2 className="mt-2.5 text-[21px] leading-[1.3] font-semibold tracking-[-0.02em]">{finder.title}</h2>
      </div>
      <ul className="flex flex-col">
        {finder.options.map((option) => (
          <li key={option.label}>
            <Link
              to={option.to}
              className="group flex items-center gap-4 rounded-2xl border-t border-line px-4.5 py-4 transition-colors hover:bg-canvas"
            >
              <IconBox icon={option.icon} tone={option.tone} className="size-[46px]" />
              <span className="flex-1">
                <strong className="block font-semibold">{option.label}</strong>
                <span className="text-[15px] text-muted">{option.hint}</span>
              </span>
              <IconArrowRight
                className="size-4.5 shrink-0 text-ink transition-transform group-hover:translate-x-[3px]"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
