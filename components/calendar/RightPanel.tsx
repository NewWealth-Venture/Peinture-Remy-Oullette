"use client";

import type { CalendarEvent } from "@/types/calendar";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { EventBadge } from "./EventBadge";
import { CalendarClock } from "lucide-react";

const WEEKDAY = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

function formatSelectedDay(d: Date): string {
  return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

interface RightPanelProps {
  selectedDate: Date;
  eventsForDay: (d: Date) => CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  onNewEvent: () => void;
  onEditEvent: (e: CalendarEvent) => void;
}

export function RightPanel({
  selectedDate,
  eventsForDay,
  upcomingEvents,
  onNewEvent,
  onEditEvent,
}: RightPanelProps) {
  const dayEvents = eventsForDay(selectedDate);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Jour sélectionné">
        <p className="text-caption text-neutral-text-secondary mb-3">
          {formatSelectedDay(selectedDate)}
        </p>
        {dayEvents.length === 0 ? (
          <div className="py-2">
            <p className="text-section-title text-neutral-text font-medium mb-0.5">Aucun événement</p>
            <p className="text-caption text-neutral-text-secondary mb-3">
              Ajoutez un chantier ou un rendez-vous pour planifier la journée.
            </p>
            <button
              type="button"
              onClick={onNewEvent}
              className="h-8 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring"
            >
              Créer
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {dayEvents.map((ev) => (
              <li key={ev.id}>
                <EventBadge event={ev} onClick={() => onEditEvent(ev)} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="À venir">
        {upcomingEvents.length === 0 ? (
          <EmptyInline
            icon={CalendarClock}
            message="Aucun événement à venir."
          />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {upcomingEvents.map((ev) => (
              <li key={ev.id} className="flex items-center gap-2">
                <span className="text-caption-xs text-neutral-text-secondary shrink-0">
                  {formatEventTime(ev.dateDebut)}
                </span>
                <EventBadge event={ev} onClick={() => onEditEvent(ev)} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
