"use client";

import { PageHeader } from "@/components/PageHeader";
import { CalendarShell } from "@/components/calendar/CalendarShell";
import { useProjets } from "@/lib/store";

export default function AccueilAgendaPage() {
  const { projets } = useProjets();
  return (
    <div className="p-6">
      <PageHeader
        title="Agenda & planification"
        subtitle="Calendrier des chantiers et rendez-vous."
      />
      <CalendarShell projets={projets} />
    </div>
  );
}
