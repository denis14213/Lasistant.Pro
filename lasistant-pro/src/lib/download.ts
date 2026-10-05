/**
 * Téléchargements générés côté navigateur (rendez-vous au format agenda, exports CSV).
 */

/** Déclenche le téléchargement d'un contenu texte. */
export function downloadText(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  /** Date « AAAA-MM-JJ » et heure « HH:MM » en heure de Tunisie */
  date: string;
  time: string;
  durationMinutes: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Horodatage UTC au format iCalendar : « 20261014T080000Z ». */
function icsTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Construit un fichier .ics compatible avec Google Agenda, Outlook et Apple Calendrier. */
export function buildIcsEvent(event: CalendarEvent, createdAt = new Date()): string {
  const [y, m, d] = event.date.split('-');
  const [hh = 0, mm = 0] = event.time.split(':').map(Number);
  const endTotal = hh * 60 + mm + event.durationMinutes;
  const start = `${y}${m}${d}T${pad(hh)}${pad(mm)}00`;
  const end = `${y}${m}${d}T${pad(Math.floor(endTotal / 60))}${pad(endTotal % 60)}00`;
  const escape = (value: string) => value.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LASISTANT.PRO//Reservation//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.uid}@lasistant.pro`,
    `DTSTAMP:${icsTimestamp(createdAt)}`,
    `DTSTART;TZID=Africa/Tunis:${start}`,
    `DTEND;TZID=Africa/Tunis:${end}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Transforme des lignes en CSV (séparateur « ; » pour Excel en français). */
export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\r\n');
}
