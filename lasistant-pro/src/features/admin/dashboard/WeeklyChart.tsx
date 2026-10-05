import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/text';
import type { WeekCount } from '../requests/request-stats';

/**
 * Histogramme des demandes reçues par semaine.
 * Une version en tableau est proposée : les données restent lisibles sans le graphique.
 */
export function WeeklyChart({ weeks }: { weeks: WeekCount[] }) {
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...weeks.map((week) => week.count));
  const summary = weeks.map((week) => `S${week.week} ${week.count}`).join(', ');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAsTable((value) => !value)}
          className="text-[13.5px] font-semibold text-brand hover:underline"
        >
          {asTable ? 'Voir en graphique' : 'Voir en tableau'}
        </button>
      </div>
      {asTable ? (
        <AdminTable minWidth={320} caption="Demandes reçues par semaine">
          <thead>
            <tr>
              <th scope="col">Semaine</th>
              <th scope="col">Demandes</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.start}>
                <td>
                  Semaine {week.week}
                  {week.current ? ' (en cours)' : ''}
                </td>
                <td className="tabular-nums">{week.count}</td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <div
          role="img"
          aria-label={`Demandes par semaine : ${summary}`}
          className="flex h-[220px] items-stretch pt-7"
        >
          {weeks.map((week) => (
            <div key={week.start} className="relative flex flex-1 flex-col items-center justify-end">
              <span
                title={`Semaine ${week.week}${week.current ? ' (en cours)' : ''} · ${pluralize(week.count, 'demande')}`}
                className={cn(
                  'relative block w-[56%] max-w-9 rounded-t transition-colors',
                  week.current ? 'bg-brand' : 'bg-brand-200 hover:bg-brand-300',
                )}
                style={{ height: `${(week.count / max) * 100}%` }}
              >
                {week.current ? (
                  <b className="absolute -top-5.5 left-1/2 -translate-x-1/2 text-[12.5px] font-bold">
                    {week.count}
                  </b>
                ) : null}
              </span>
              <small className="block w-full border-t border-line-strong pt-2 text-center text-[11.5px] text-muted">
                S{week.week}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
