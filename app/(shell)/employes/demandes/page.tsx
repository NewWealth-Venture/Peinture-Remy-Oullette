"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { FileQuestion } from "lucide-react";

const tabs = [
  { id: "conges", label: "Congés" },
  { id: "materiel", label: "Matériel" },
  { id: "autres", label: "Autres" },
] as const;

export default function EmployesDemandesPage() {
  const [activeTab, setActiveTab] = useState<string>("conges");

  return (
    <div className="p-6">
      <PageHeader
        title="Demandes"
        subtitle="Congés, matériel et autres demandes."
      />
      <SectionCard title="Demandes en attente">
        <div className="border-b border-neutral-border mb-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 text-caption font-medium rounded-t
                  focus-ring
                  ${
                    activeTab === tab.id
                      ? "bg-neutral-white border border-neutral-border border-b-neutral-white -mb-px text-neutral-text"
                      : "text-neutral-text-secondary hover:text-neutral-text"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <EmptyState
          icon={FileQuestion}
          title="Aucune demande"
          description="Les demandes (congés, matériel, autres) apparaîtront ici."
        />
      </SectionCard>
    </div>
  );
}
