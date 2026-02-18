import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { MapPin, Users } from "lucide-react";

export default function EmployesAffectationsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Affectations"
        subtitle="Répartition des équipes sur les chantiers."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Chantiers" description="Liste des chantiers">
          <EmptyState
            icon={MapPin}
            title="Aucun chantier"
            description="Les chantiers apparaîtront ici pour assigner les équipes."
          />
        </SectionCard>
        <SectionCard title="Équipe assignée" description="Effectif sur le chantier sélectionné">
          <EmptyState
            icon={Users}
            title="Aucune affectation"
            description="Sélectionnez un chantier pour afficher l'équipe assignée."
          />
        </SectionCard>
      </div>
    </div>
  );
}
