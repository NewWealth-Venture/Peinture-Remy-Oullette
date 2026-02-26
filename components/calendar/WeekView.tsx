"use client";

import type { CalendarEvent } from "@/types/calendar";
import { EventBadge } from "./EventBadge";

const HOURS = 11;
const START_HOUR = 8;

function getWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function eventInDay(ev: CalendarEvent, d: Date): boolean {
  const dayStr = d.toISOString().slice(0, 10);
  return ev.dateDebut.slice(0, 10) === dayStr;
}

function eventHour(ev: CalendarEvent): number {
  const d = new Date(ev.dateDebut);
  return d.getHours() + d.getMinutes() / 60;
}

interface WeekViewProps {
  selectedDate: Date;
  onSelectDay: (d: Date) => void;
  events: CalendarEvent[];
  onSlotClick: (start: Date) => void;
}

export function WeekView({
  selectedDate,
  onSelectDay,
  events,
  onSlotClick,
}: WeekViewProps) {
  const weekDays = getWeekDays(selectedDate);
  const dayLabels = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

  const eventsByCell: Record<string, CalendarEvent[]> = {};
  weekDays.forEach((day, col) => {
    events.filter((e) => eventInDay(e, day)).forEach((ev) => {
      const hour = Math.floor(eventHour(ev)) - START_HOUR;
      if (hour >= 0 && hour < HOURS) {
        const key = `${col}-${hour}`;
        if (!eventsByCell[key]) eventsByCell[key] = [];
        eventsByCell[key].push(ev);
      }
    });
  });

  return (
    <div className="flex flex-col min-h-[360px] overflow-auto">
      <div className="grid grid-cols-[56px_1fr] border-b border-neutral-border shrink-0">
        <div className="bg-neutral-bg-subtle border-r border-neutral-border" />
        <div className="grid grid-cols-7 border-neutral-border">
          {weekDays.map((d, i) => {
            const selected = isSameDay(d, selectedDate);
            return (
              <button
                type="button"
                key={d.toISOString()}
                onClick={() => onSelectDay(d)}
                className={`py-2 text-center text-caption font-medium border-r border-neutral-border last:border-r-0 focus-ring ${
                  selected ? "bg-primary-blue/10 text-primary-blue" : "text-neutral-text hover:bg-neutral-bg-subtle"
                }`}
              >
                {dayLabels[i]} {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 grid grid-cols-[56px_1fr] min-h-0">
        <div className="border-r border-neutral-border bg-neutral-bg-subtle flex flex-col">
          {Array.from({ length: HOURS }, (_, i) => START_HOUR + i).map((h) => (
            <div
              key={h}
              className="h-14 flex items-start justify-end pr-2 text-caption-xs text-neutral-text-secondary shrink-0"
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 content-start">
          {Array.from({ length: HOURS * 7 }, (_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const day = weekDays[col];
            const hour = START_HOUR + row;
            const slotStart = new Date(day);
            slotStart.setHours(hour, 0, 0, 0);
            const key = `${col}-${row}`;
            const cellEvents = eventsByCell[key] ?? [];
            return (
              <div key={i} className="h-14 border-b border-r border-neutral-border relative p-0.5 min-w-0">
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full hover:bg-neutral-bg-subtle focus-ring rounded"
                  onClick={() => onSlotClick(slotStart)}
                />
                <div className="relative z-10 flex flex-col gap-0.5 overflow-hidden pointer-events-none">
                  {cellEvents.map((ev) => (
                    <div key={ev.id} className="pointer-events-auto">
                      <EventBadge event={ev} compact />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
