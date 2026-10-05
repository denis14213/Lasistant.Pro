import { cn } from '@/lib/cn';

/**
 * Classes communes aux champs de saisie (Input, Select, Textarea).
 * Sous 768 px, le texte reste à 16 px : en dessous, Safari sur iPhone agrandit la page au focus.
 */
export function controlClasses({
  invalid = false,
  compact = false,
}: { invalid?: boolean; compact?: boolean } = {}) {
  return cn(
    'w-full rounded-field border border-line-strong bg-white text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-placeholder hover:border-line-hover focus:border-brand focus:shadow-focus disabled:cursor-not-allowed disabled:bg-smoke disabled:text-muted',
    compact
      ? 'min-h-[42px] rounded-[10px] px-[13px] text-base md:text-[14.5px]'
      : 'min-h-[52px] px-4 text-base',
    invalid && 'border-danger shadow-invalid hover:border-danger focus:border-danger',
  );
}
