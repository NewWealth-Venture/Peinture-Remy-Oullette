import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Users, Settings } from "lucide-react";

export default function PatronParametresPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Paramètres"
        subtitle="Entreprise, équipes et préférences."
      />
      <div className="space-y-6">
        <SectionCard
          title="Entreprise"
          description="Nom, logo (lecture seule pour l'instant)"
        >
          <div className="flex items-center gap-4 py-2">
            <div className="h-10 w-10 rounded overflow-hidden relative shrink-0 bg-neutral-bg-subtle flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <p className="font-medium text-neutral-text">PEINTURE RÉMY OUELLETTE</p>
              <p className="text-caption text-neutral-text-secondary">
                Paramètres entreprise en lecture seule.
              </p>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Équipes">
          <EmptyState
            icon={Users}
            title="Aucune équipe"
            description="La gestion des équipes sera disponible prochainement."
          />
        </SectionCard>
        <SectionCard title="Préférences">
          <EmptyState
            icon={Settings}
            title="Aucune préférence"
            description="Les options de préférences seront ajoutées ici."
          />
        </SectionCard>
      </div>
    </div>
  );
}
