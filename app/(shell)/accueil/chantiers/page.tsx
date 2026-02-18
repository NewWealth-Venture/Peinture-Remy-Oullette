import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { TableShell } from "@/components/TableShell";
import { EmptyState } from "@/components/EmptyState";
import { MapPin } from "lucide-react";

const columns = [
  "Nom chantier",
  "Adresse",
  "Statut",
  "Chef d'équipe",
  "Dernière mise à jour",
];

export default function AccueilChantiersPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Chantiers"
        subtitle="Lecture rapide des chantiers en cours."
      />
      <SectionCard title="Liste des chantiers">
        <TableShell columns={columns}>
          <tr>
            <td colSpan={columns.length} className="p-0">
              <EmptyState
                icon={MapPin}
                title="Aucun chantier"
                description="Les chantiers apparaîtront ici lorsque le système sera connecté."
              />
            </td>
          </tr>
        </TableShell>
      </SectionCard>
    </div>
  );
}
