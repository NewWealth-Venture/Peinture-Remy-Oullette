import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { MapPin, Users, Banknote } from "lucide-react";

export default function PatronCentrePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Centre de pilotage"
        subtitle="Vue synthétique chantiers, main-d'œuvre et finances."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Chantiers">
          <EmptyState
            icon={MapPin}
            title="Aucune donnée"
            description="Indicateurs chantiers à venir."
          />
        </SectionCard>
        <SectionCard title="Main-d'œuvre">
          <EmptyState
            icon={Users}
            title="Aucune donnée"
            description="Effectif et disponibilités à venir."
          />
        </SectionCard>
        <SectionCard title="Finances">
          <EmptyState
            icon={Banknote}
            title="Aucune donnée"
            description="Synthèse financière à venir."
          />
        </SectionCard>
      </div>
    </div>
  );
}
