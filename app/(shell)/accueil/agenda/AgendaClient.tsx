"use client";

import { useRouter } from "next/navigation";
import type { CalendarEvent } from "@/types/calendar";
import type { Projet } from "@/types/projet";
import { CalendarShell } from "@/components/calendar/CalendarShell";
import { createCalendarEventAction, updateCalendarEventAction, deleteCalendarEventAction } from "@/app/actions/data";

export function AgendaClient({
  initialEvents,
  projets,
}: {
  initialEvents: CalendarEvent[];
  projets: Projet[];
}) {
  const router = useRouter();

  const onAddEvent = async (event: Omit<CalendarEvent, "id">) => {
    const r = await createCalendarEventAction({
      title: event.titre,
      event_type: event.type,
      project_id: event.projetId ?? null,
      starts_at: event.dateDebut,
      ends_at: event.dateFin,
      notes: event.notes ?? null,
    });
    if (r.success) router.refresh();
  };

  const onUpdateEvent = async (id: string, payload: Partial<CalendarEvent>) => {
    const update: Parameters<typeof updateCalendarEventAction>[1] = {};
    if (payload.titre !== undefined) update.title = payload.titre;
    if (payload.type !== undefined) update.event_type = payload.type;
    if (payload.projetId !== undefined) update.project_id = payload.projetId ?? null;
    if (payload.dateDebut !== undefined) update.starts_at = payload.dateDebut;
    if (payload.dateFin !== undefined) update.ends_at = payload.dateFin;
    if (payload.notes !== undefined) update.notes = payload.notes ?? null;
    const r = await updateCalendarEventAction(id, update);
    if (r.success) router.refresh();
  };

  const onDeleteEvent = async (id: string) => {
    const r = await deleteCalendarEventAction(id);
    if (r.success) router.refresh();
  };

  return (
    <CalendarShell
      projets={projets}
      initialEvents={initialEvents}
      onAddEvent={onAddEvent}
      onUpdateEvent={onUpdateEvent}
      onDeleteEvent={onDeleteEvent}
    />
  );
}
