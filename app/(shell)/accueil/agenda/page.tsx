import { PageHeader } from "@/components/PageHeader";
import { listEventsInRange } from "@/lib/db/calendar";
import { listProjects } from "@/lib/db/projects";
import { mapProject } from "@/lib/db/mappers";
import type { CalendarEvent } from "@/types/calendar";
import type { Projet } from "@/types/projet";
import { CalendarShell } from "@/components/calendar/CalendarShell";
import { AgendaClient } from "./AgendaClient";

export default async function AccueilAgendaPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10) + "T00:00:00.000Z";
  const end = new Date(now.getFullYear(), now.getMonth() + 14, 0).toISOString().slice(0, 10) + "T23:59:59.999Z";
  const [dbEvents, dbProjects] = await Promise.all([
    listEventsInRange(start, end),
    listProjects(),
  ]);

  const events: CalendarEvent[] = dbEvents.map((e) => ({
    id: e.id,
    titre: e.title,
    type: e.event_type,
    dateDebut: e.starts_at,
    dateFin: e.ends_at,
    projetId: e.project_id ?? undefined,
    notes: e.notes ?? undefined,
  }));

  const projets: Projet[] = dbProjects.map((p) => mapProject(p));

  return (
    <div className="p-6">
      <PageHeader title="Agenda & planification" subtitle="Calendrier des chantiers et rendez-vous." />
      <AgendaClient initialEvents={events} projets={projets} />
    </div>
  );
}
