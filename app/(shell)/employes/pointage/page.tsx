import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Clock, Calendar } from "lucide-react";

export default function EmployesPointagePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Pointage"
        subtitle="Heures et présences."
      />
      <div className="space-y-6">
        <SectionCard title="Cette semaine" description="Récapitulatif des pointages">
          <EmptyState
            icon={Clock}
            title="Aucune donnée"
            description="Les pointages de la semaine apparaîtront ici."
          />
        </SectionCard>
        <SectionCard title="Heures par jour">
          <EmptyState
            icon={Calendar}
            title="Aucune donnée"
            description="Le détail des heures par jour sera disponible ici."
          />
        </SectionCard>
      </div>
    </div>
  );
}
