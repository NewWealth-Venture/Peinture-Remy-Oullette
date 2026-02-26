import { PageHeader } from "@/components/PageHeader";
import { CalendarShell } from "@/components/calendar/CalendarShell";

export default function AccueilAgendaPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Agenda & planification"
        subtitle="Calendrier des chantiers et rendez-vous."
      />
      <CalendarShell />
    </div>
  );
}
