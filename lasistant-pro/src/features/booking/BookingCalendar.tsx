import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { IconButton } from '@/components/ui';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { addDays, addMonths, fromISODate, startOfWeek, toISODate } from '@/lib/dates';
import { formatLongDate } from '@/lib/format';

/**
 * Calendrier mensuel de choix de date, accessible au clavier
 * (modèle « date picker » des pratiques ARIA) :
 * flèches = jour / semaine, Début / Fin = début / fin de semaine,
 * Page précédente / suivante = mois. Les jours indisponibles restent atteignables
 * au clavier mais ne peuvent pas être choisis.
 */

interface BookingCalendarProps {
  /** Date choisie (« AAAA-MM-JJ ») ou chaîne vide */
  value: string;
  onChange: (isoDate: string) => void;
  isAvailable: (isoDate: string) => boolean;
  /** Bornes de navigation */
  minDate: string;
  maxDate: string;
  today: string;
  /** Date mise en avant à l'ouverture si aucune n'est choisie */
  initialDate: string;
  labelledBy?: string;
}

const WEEKDAYS = [
  { short: 'Lun', long: 'lundi' },
  { short: 'Mar', long: 'mardi' },
  { short: 'Mer', long: 'mercredi' },
  { short: 'Jeu', long: 'jeudi' },
  { short: 'Ven', long: 'vendredi' },
  { short: 'Sam', long: 'samedi' },
  { short: 'Dim', long: 'dimanche' },
];

const monthKey = (isoDate: string) => isoDate.slice(0, 7);

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function monthLabel(key: string): string {
  const label = monthFormatter.format(fromISODate(`${key}-01`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Semaines (lundi → dimanche) couvrant le mois ; null pour les jours d'un autre mois. */
function monthWeeks(key: string): Array<Array<string | null>> {
  const first = fromISODate(`${key}-01`);
  const weeks: Array<Array<string | null>> = [];
  let cursor = startOfWeek(first);
  while (monthKey(toISODate(cursor)) <= key) {
    const week: Array<string | null> = [];
    for (let index = 0; index < 7; index += 1) {
      const day = toISODate(addDays(cursor, index));
      week.push(monthKey(day) === key ? day : null);
    }
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

const clampDate = (date: string, min: string, max: string) => (date < min ? min : date > max ? max : date);

export function BookingCalendar({
  value,
  onChange,
  isAvailable,
  minDate,
  maxDate,
  today,
  initialDate,
  labelledBy,
}: BookingCalendarProps) {
  const titleId = useId();
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldMoveFocus = useRef(false);
  const [focusedDate, setFocusedDate] = useState(value || initialDate);
  const [visibleMonth, setVisibleMonth] = useState(monthKey(value || initialDate));
  const [previousValue, setPreviousValue] = useState(value);

  // Une date choisie ailleurs (brouillon restauré, lien pré-rempli) devient la date affichée.
  if (value !== previousValue) {
    setPreviousValue(value);
    if (value) {
      setFocusedDate(value);
      setVisibleMonth(monthKey(value));
    }
  }

  // Après un déplacement au clavier, le focus suit le jour mis en avant.
  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    shouldMoveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus();
  }, [focusedDate, visibleMonth]);

  const moveFocus = (date: string) => {
    const next = clampDate(date, minDate, maxDate);
    shouldMoveFocus.current = true;
    setFocusedDate(next);
    setVisibleMonth(monthKey(next));
  };

  const showMonth = (offset: number) => {
    const target = toISODate(addMonths(fromISODate(`${visibleMonth}-01`), offset));
    const key = monthKey(clampDate(target, minDate, maxDate));
    setVisibleMonth(key);
    setFocusedDate(clampDate(`${key}-01`, minDate, maxDate));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const current = fromISODate(date);
    const weekday = (current.getDay() + 6) % 7;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      Home: () => addDays(current, -weekday),
      End: () => addDays(current, 6 - weekday),
      PageUp: () => new Date(current.getFullYear(), current.getMonth() - 1, current.getDate(), 12),
      PageDown: () => new Date(current.getFullYear(), current.getMonth() + 1, current.getDate(), 12),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(toISODate(move()));
  };

  const canGoBack = visibleMonth > monthKey(minDate);
  const canGoForward = visibleMonth < monthKey(maxDate);

  return (
    <div className="rounded-box border border-line bg-white p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <IconButton label="Mois précédent" disabled={!canGoBack} onClick={() => showMonth(-1)}>
          <IconChevronLeft aria-hidden />
        </IconButton>
        <p id={titleId} aria-live="polite" className="text-[17px] font-semibold tracking-[-0.01em]">
          {monthLabel(visibleMonth)}
        </p>
        <IconButton label="Mois suivant" disabled={!canGoForward} onClick={() => showMonth(1)}>
          <IconChevronRight aria-hidden />
        </IconButton>
      </div>
      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={labelledBy ? `${labelledBy} ${titleId}` : titleId}
        className="w-full table-fixed border-separate border-spacing-1 text-center"
      >
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th
                key={weekday.short}
                scope="col"
                abbr={weekday.long}
                className="py-1.5 text-xs font-semibold tracking-[0.06em] text-muted uppercase"
              >
                {weekday.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(visibleMonth).map((week) => (
            <tr key={week.find(Boolean) ?? 'semaine'}>
              {week.map((date, index) => {
                if (!date) return <td key={`vide-${index}`} />;
                const available = isAvailable(date);
                const selected = date === value;
                return (
                  <td key={date}>
                    <button
                      type="button"
                      data-date={date}
                      tabIndex={date === focusedDate ? 0 : -1}
                      aria-pressed={selected}
                      aria-disabled={!available || undefined}
                      aria-current={date === today ? 'date' : undefined}
                      aria-label={`${formatLongDate(date)}${available ? '' : ', indisponible'}`}
                      onClick={() => {
                        setFocusedDate(date);
                        if (available) onChange(date);
                      }}
                      onKeyDown={(event) => onKeyDown(event, date)}
                      className={cn(
                        'h-11 w-full rounded-xl text-[15px] font-medium transition-colors',
                        available
                          ? 'cursor-pointer text-ink hover:bg-mist'
                          : 'cursor-not-allowed text-disabled',
                        date === today && 'shadow-[inset_0_0_0_1.5px_var(--color-ink)]',
                        selected && 'bg-brand font-bold text-white hover:bg-brand',
                      )}
                    >
                      {Number(date.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
