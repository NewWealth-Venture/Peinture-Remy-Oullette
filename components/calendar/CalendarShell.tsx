"use client";

import { useState, useCallback, useEffect } from "react";
import type { CalendarEvent } from "@/types/calendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { RightPanel } from "./RightPanel";
import { EventModal } from "./EventModal";

const STORAGE_KEY = "peinture-agenda-events";

function loadEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function CalendarShell() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const addEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setEvents((prev) => [...prev, { ...event, id }]);
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  const updateEvent = useCallback((id: string, payload: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...payload } : e)));
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  const openNewEvent = useCallback((start?: Date) => {
    if (start) {
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      setEditingEvent({
        id: "",
        titre: "",
        type: "Rendez-vous",
        dateDebut: start.toISOString(),
        dateFin: end.toISOString(),
      });
    } else {
      setEditingEvent(null);
    }
    setModalOpen(true);
  }, []);

  const openEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
  }, []);

  const eventsForDay = useCallback(
    (d: Date) => {
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      return events.filter((e) => {
        const start = e.dateDebut.slice(0, 10);
        return start === dayStart;
      });
    },
    [events]
  );

  const upcomingEvents = useCallback(() => {
    const now = new Date().toISOString();
    return events
      .filter((e) => e.dateDebut >= now)
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
      .slice(0, 5);
  }, [events]);

  return (
    <div className="grid grid-cols-12 gap-6 max-w-[1180px] mx-auto">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <CalendarToolbar
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewEvent={() => openNewEvent()}
        />
        <div className="bg-neutral-white border border-neutral-border rounded overflow-hidden min-h-[360px]">
          {viewMode === "month" ? (
            <MonthView
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              events={events}
              eventsForDay={eventsForDay}
              onEditEvent={openEditEvent}
            />
          ) : (
            <WeekView
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              events={events}
              onSlotClick={openNewEvent}
            />
          )}
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <RightPanel
          selectedDate={selectedDate}
          eventsForDay={eventsForDay}
          upcomingEvents={upcomingEvents()}
          onNewEvent={() => openNewEvent()}
          onEditEvent={openEditEvent}
        />
      </div>
      <EventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        initialEvent={editingEvent}
        onSave={editingEvent?.id ? (payload) => updateEvent(editingEvent.id, payload) : addEvent}
        onDelete={editingEvent?.id ? () => deleteEvent(editingEvent.id) : undefined}
      />
    </div>
  );
}
