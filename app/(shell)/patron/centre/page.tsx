"use client";

import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { useAvancements } from "@/lib/store";
import { useProjets } from "@/lib/store";
import { MapPin, Users, Banknote, TrendingUp } from "lucide-react";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default function PatronCentrePage() {
  const { derniers } = useAvancements();
  const { getById: getProjet } = useProjets();
  const liste = derniers(10);

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Centre de pilotage" subtitle="Vue synthétique chantiers, main-d'œuvre et finances." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Chantiers">
          <EmptyInline icon={MapPin} message="Indicateurs chantiers à venir." />
        </SectionCard>
        <SectionCard title="Main-d'œuvre">
          <EmptyInline icon={Users} message="Effectif et disponibilités à venir." />
        </SectionCard>
        <SectionCard title="Finances">
          <EmptyInline icon={Banknote} message="Synthèse financière à venir." />
        </SectionCard>
      </div>
      <SectionCard title="Derniers avancements" className="mt-6">
        {liste.length === 0 ? (
          <EmptyInline icon={TrendingUp} message="Aucun avancement enregistré. Les entrées des employés apparaîtront ici." />
        ) : (
          <ul className="space-y-3">
            {liste.map((a) => {
              const projet = getProjet(a.projetId);
              return (
                <li key={a.id} className="py-2 px-3 border border-neutral-border rounded">
                  <p className="text-caption font-medium text-neutral-text">{projet?.titre ?? "Projet"}</p>
                  <p className="text-caption-xs text-neutral-text-secondary">{formatDate(a.date)}</p>
                  <p className="text-caption text-neutral-text mt-1">{a.resume}</p>
                  {a.progressionPourcent != null && <p className="text-caption-xs text-neutral-text-secondary mt-1">Progression : {a.progressionPourcent} %</p>}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
