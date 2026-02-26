"use client";

import type { CalendarEvent } from "@/types/calendar";
import { EventBadge } from "./EventBadge";

const DAYS_HEADER = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInMonth = last.getDate();
  const rows: (Date | null)[][] = [];
  let row: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) row.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(new Date(year, month, d));
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date) {
  const t = new Date();
  return isSameDay(d, t);
}

interface MonthViewProps {
  selectedDate: Date;
  onSelectDay: (d: Date) => void;
  events: CalendarEvent[];
  eventsForDay: (d: Date) => CalendarEvent[];
  onEditEvent?: (e: CalendarEvent) => void;
}

export function MonthView({
  selectedDate,
  onSelectDay,
  eventsForDay,
  onEditEvent,
}: MonthViewProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const grid = getMonthGrid(year, month);

  return (
    <div className="flex flex-col h-full min-h-[360px]">
      <div className="grid grid-cols-7 border-b border-neutral-border bg-neutral-bg-subtle">
        {DAYS_HEADER.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-caption-xs font-medium text-neutral-text-secondary uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell) {
              return <div key={`e-${ri}-${ci}`} className="min-h-[80px] border-b border-r border-neutral-border bg-neutral-bg-subtle/50" />;
            }
            const dayEvents = eventsForDay(cell);
            const selected = isSameDay(cell, selectedDate);
            const today = isToday(cell);
            return (
              <button
                type="button"
                key={cell.toISOString()}
                onClick={() => onSelectDay(cell)}
                className={`min-h-[80px] border-b border-r border-neutral-border p-1.5 text-left flex flex-col hover:bg-neutral-bg-subtle focus-ring ${
                  selected ? "ring-2 ring-primary-blue/20 ring-inset bg-primary-blue/5" : ""
                } ${today && !selected ? "bg-neutral-bg-subtle border-l-2 border-l-primary-blue" : ""}`}
              >
                <span className="text-caption-xs text-neutral-text-secondary mb-1">{cell.getDate()}</span>
                <div className="flex flex-col gap-0.5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {dayEvents.slice(0, 3).map((ev) => (
                    <EventBadge key={ev.id} event={ev} compact onClick={onEditEvent ? () => onEditEvent(ev) : undefined} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-caption-xs text-neutral-text-secondary px-1">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
