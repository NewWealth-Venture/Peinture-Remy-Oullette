import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Calendar } from "lucide-react";

export default function AccueilAgendaPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Agenda & planification"
        subtitle="Calendrier des chantiers et rendez-vous."
      />
      <div className="bg-neutral-white border border-neutral-border rounded min-h-[400px] flex items-center justify-center">
        <EmptyState
          icon={Calendar}
          title="Agenda non connecté"
          description="Le calendrier sera disponible une fois la synchronisation activée."
        />
      </div>
    </div>
  );
}
