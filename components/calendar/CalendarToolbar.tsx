"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

interface CalendarToolbarProps {
  selectedDate: Date;
  onSelectedDateChange: (d: Date) => void;
  viewMode: "month" | "week";
  onViewModeChange: (m: "month" | "week") => void;
  onNewEvent: () => void;
}

export function CalendarToolbar({
  selectedDate,
  onSelectedDateChange,
  viewMode,
  onViewModeChange,
  onNewEvent,
}: CalendarToolbarProps) {
  const title =
    viewMode === "month"
      ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
      : `Semaine du ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const goToday = () => onSelectedDateChange(new Date());

  const goPrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    onSelectedDateChange(d);
  };

  const goNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    onSelectedDateChange(d);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={goToday}
        className="h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring"
      >
        Aujourd&apos;hui
      </button>
      <div className="flex items-center rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle">
        <button
          type="button"
          onClick={goPrev}
          className="h-9 w-9 flex items-center justify-center text-neutral-text hover:bg-neutral-bg-active focus-ring"
          aria-label="Période précédente"
        >
          <ChevronLeft size={18} strokeWidth={1.7} />
        </button>
        <span className="min-w-[160px] px-3 py-2 text-caption font-medium text-neutral-text text-center">
          {title}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="h-9 w-9 flex items-center justify-center text-neutral-text hover:bg-neutral-bg-active focus-ring"
          aria-label="Période suivante"
        >
          <ChevronRight size={18} strokeWidth={1.7} />
        </button>
      </div>
      <div className="flex rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle">
        <button
          type="button"
          onClick={() => onViewModeChange("month")}
          className={`h-9 px-3 text-caption font-medium focus-ring ${
            viewMode === "month"
              ? "bg-neutral-bg-active text-neutral-text"
              : "text-neutral-text-secondary hover:bg-neutral-bg-active"
          }`}
        >
          Mois
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("week")}
          className={`h-9 px-3 text-caption font-medium focus-ring ${
            viewMode === "week"
              ? "bg-neutral-bg-active text-neutral-text"
              : "text-neutral-text-secondary hover:bg-neutral-bg-active"
          }`}
        >
          Semaine
        </button>
      </div>
      <button
        type="button"
        onClick={onNewEvent}
        className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange border border-primary-orange rounded hover:opacity-90 focus-ring ml-auto"
      >
        <Plus size={18} strokeWidth={1.7} className="inline-block mr-1.5 align-middle" />
        Nouvel événement
      </button>
    </div>
  );
}
