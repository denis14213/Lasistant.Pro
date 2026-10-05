import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ResponsiveTableProps {
  /** Intitulés des colonnes ; sans intitulés, la première cellule de chaque ligne sert de libellé */
  head?: readonly string[];
  /** Cellules, ligne par ligne */
  rows: ReadonlyArray<ReadonlyArray<ReactNode>>;
  /** Identifiant stable de chaque ligne (index par défaut) */
  rowKeys?: readonly string[];
  /** Description du tableau pour les lecteurs d'écran */
  caption?: string;
  className?: string;
}

/**
 * Tableau des contenus éditoriaux qui se présente en cartes sur téléphone (moins de 640 px) :
 * chaque ligne devient un bloc et chaque valeur est précédée de l'intitulé de sa colonne.
 * Les rôles ARIA explicites conservent la structure de tableau pour les lecteurs d'écran,
 * quel que soit l'affichage choisi par la feuille de style.
 */
export function ResponsiveTable({ head, rows, rowKeys, caption, className }: ResponsiveTableProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-box border border-line bg-white', className)}>
      <table role="table" className="w-full border-collapse text-[15px] max-sm:block">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {head ? (
          <thead role="rowgroup" className="max-sm:sr-only">
            <tr role="row">
              {head.map((cell) => (
                <th
                  key={cell}
                  role="columnheader"
                  scope="col"
                  className="border-b border-line bg-canvas px-4 py-3 text-left text-[12.5px] font-bold tracking-[0.08em] text-muted uppercase"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody role="rowgroup" className="max-sm:block">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowKeys?.[rowIndex] ?? rowIndex}
              role="row"
              className="border-b border-line align-top last:border-b-0 max-sm:block max-sm:px-4 max-sm:py-3"
            >
              {row.map((cell, cellIndex) => {
                const label = head?.[cellIndex];
                return (
                  <td
                    key={cellIndex}
                    role="cell"
                    data-label={label}
                    className={cn(
                      'px-4 py-3.5 break-words max-sm:block max-sm:px-0 max-sm:py-1',
                      // Sur téléphone, l'intitulé de la colonne précède la valeur.
                      label &&
                        'max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-[11.5px] max-sm:before:font-bold max-sm:before:tracking-[0.08em] max-sm:before:text-muted max-sm:before:uppercase max-sm:before:content-[attr(data-label)]',
                      // Tableau sans intitulés : la première cellule est le libellé de la ligne.
                      !head &&
                        cellIndex === 0 &&
                        'w-[38%] text-muted max-sm:w-auto max-sm:pb-0 max-sm:text-[13px]',
                    )}
                  >
                    {cell}
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
