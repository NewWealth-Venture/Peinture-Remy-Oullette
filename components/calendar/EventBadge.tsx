"use client";

import type { CalendarEvent } from "@/types/calendar";

const typeColors: Record<CalendarEvent["type"], string> = {
  Interne: "bg-primary-blue",
  Chantier: "bg-primary-orange",
  "Rendez-vous": "bg-neutral-text-secondary",
};

interface EventBadgeProps {
  event: CalendarEvent;
  className?: string;
  onClick?: () => void;
  compact?: boolean;
}

export function EventBadge({ event, className = "", onClick, compact }: EventBadgeProps) {
  const color = typeColors[event.type];
  const titre = event.titre.length > 24 ? `${event.titre.slice(0, 22)}…` : event.titre;
  const base =
    "w-full flex items-center gap-2 text-left rounded border border-neutral-border bg-neutral-white hover:bg-neutral-bg-subtle focus-ring py-1.5 px-2 text-caption " +
    className;

  return (
    <button type="button" onClick={onClick} className={base}>
      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${color}`} aria-hidden />
      <span className="truncate text-neutral-text">{titre}</span>
    </button>
  );
}
