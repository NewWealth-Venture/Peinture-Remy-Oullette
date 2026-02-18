import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { MapPin, Users, Bell, Megaphone } from "lucide-react";

const cols = ["Chantier", "Adresse", "Équipe", "Statut"];

export default function AccueilOverviewPage() {
  return (
    <>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Synthèse du jour et rappels."
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <SectionCard
            title="Aujourd'hui"
            description="Chantiers et équipes planifiés"
            actions={
              <button
                type="button"
                disabled
                className="text-caption-xs text-neutral-text-secondary cursor-not-allowed"
              >
                Voir tout
              </button>
            }
          >
            <div className="overflow-x-auto -mx-1">
              <table className="w-full border-collapse text-caption" style={{ fontSize: "13px" }}>
                <thead>
                  <tr className="border-b border-neutral-border">
                    {cols.map((c) => (
                      <th
                        key={c}
                        className="text-left py-2 px-2 font-medium text-neutral-text-secondary"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={cols.length} className="p-0">
                      <EmptyInline
                        icon={MapPin}
                        message="Aucun chantier planifié aujourd'hui."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title="Équipes du jour"
            actions={
              <button
                type="button"
                disabled
                className="text-caption-xs text-neutral-text-secondary cursor-not-allowed"
              >
                Voir tout
              </button>
            }
          >
            <EmptyInline
              icon={Users}
              message="Aucune équipe assignée pour aujourd'hui."
            />
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <SectionCard
            title="Rappels"
            actions={
              <button
                type="button"
                disabled
                className="text-caption-xs text-neutral-text-secondary cursor-not-allowed"
              >
                Voir tout
              </button>
            }
          >
            <EmptyInline
              icon={Bell}
              message="Aucun rappel."
            />
          </SectionCard>

          <SectionCard
            title="Annonces"
            actions={
              <button
                type="button"
                disabled
                className="text-caption-xs text-neutral-text-secondary cursor-not-allowed"
              >
                Nouvelle annonce
              </button>
            }
          >
            <EmptyInline
              icon={Megaphone}
              message="Aucune annonce."
            />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
