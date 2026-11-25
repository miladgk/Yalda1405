import { EVENT_CONFIG } from '../types/yalda';
import { toFa } from './yaldaLogic';

export type CalendarMode = 'jalali' | 'gregorian';

export interface MiniCalendarMonth {
  mode: CalendarMode;
  dir: 'rtl' | 'ltr';
  monthLabel: string;
  weekdays: readonly string[];
  cells: ReadonlyArray<number | null>;
  eventDay: number;
  weekendColIndex: number;
  formatDay: (day: number) => string;
}

function buildMonthCells(daysInMonth: number, leadingEmpty: number): Array<number | null> {
  const totalSlots = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;
  const cells: Array<number | null> = [];
  for (let i = 0; i < totalSlots; i += 1) {
    const day = i - leadingEmpty + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }
  return cells;
}

// 1 Azar 1405 = Sunday 2026-11-22 (offset 1 in Sat-Fri week)
export const AZAR_1405_MONTH: MiniCalendarMonth = {
  mode: 'jalali',
  dir: 'rtl',
  monthLabel: 'آذر ۱۴۰۵',
  weekdays: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  cells: buildMonthCells(30, 1),
  eventDay: 29,
  weekendColIndex: 6,
  formatDay: (day) => toFa(day),
};

// December 1, 2026 = Tuesday (offset 1 in Mon-Sun week)
export const DEC_2026_MONTH: MiniCalendarMonth = {
  mode: 'gregorian',
  dir: 'ltr',
  monthLabel: 'December 2026',
  weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  cells: buildMonthCells(31, 1),
  eventDay: 20,
  weekendColIndex: 6,
  formatDay: (day) => String(day),
};

export function generateYaldaIcsContent(): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Avid Helsinki//Yalda 1405//FA',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:yalda-1405-helsinki@avid-helsinki.fi',
    'DTSTAMP:20261124T120000Z',
    'DTSTART:20261220T133000Z',
    'DTEND:20261220T190000Z',
    `SUMMARY:${EVENT_CONFIG.title}`,
    `LOCATION:${EVENT_CONFIG.venue}, ${EVENT_CONFIG.address}`,
    `URL:${EVENT_CONFIG.mapsUrl}`,
    `DESCRIPTION:${EVENT_CONFIG.associationName} — ${EVENT_CONFIG.scheduleSummary}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadYaldaIcs(): void {
  const content = generateYaldaIcsContent();
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'yalda-1405-helsinki.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
