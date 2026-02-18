import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { InlineNotice } from "@/components/InlineNotice";
import { EmptyState } from "@/components/EmptyState";
import { FileText } from "lucide-react";

export default function PatronRapportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Rapports"
        subtitle="Rapports hebdomadaires et synthèses."
      />
      <div className="space-y-6">
        <InlineNotice>
          Génération automatique de rapports hebdomadaires (phase 2).
        </InlineNotice>
        <SectionCard title="Rapports disponibles">
          <EmptyState
            icon={FileText}
            title="Aucun rapport"
            description="Les rapports générés apparaîtront ici lorsque le module sera activé."
          />
        </SectionCard>
      </div>
    </div>
  );
}
