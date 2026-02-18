import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Megaphone } from "lucide-react";

export default function AccueilAnnoncesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Annonces"
        subtitle="Notes internes et communication."
      />
      <SectionCard
        title="Annonces"
        description="Notes et messages à l'équipe"
        actions={
          <button
            type="button"
            disabled
            className="text-caption text-neutral-text-secondary cursor-not-allowed px-3 py-1.5 border border-neutral-border rounded bg-neutral-bg-subtle"
          >
            Nouvelle annonce
          </button>
        }
      >
        <EmptyState
          icon={Megaphone}
          title="Aucune annonce"
          description="Les annonces internes apparaîtront ici. Le bouton « Nouvelle annonce » sera activé prochainement."
        />
      </SectionCard>
    </div>
  );
}
