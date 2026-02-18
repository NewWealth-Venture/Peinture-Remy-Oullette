import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { TableShell } from "@/components/TableShell";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";

const columns = ["Nom", "Poste", "Téléphone", "Statut", "Chantier actuel"];

export default function EmployesListePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Liste des employés"
        subtitle="Effectif et statut actuel."
      />
      <SectionCard title="Effectif">
        <TableShell columns={columns}>
          <tr>
            <td colSpan={columns.length} className="p-0">
              <EmptyState
                icon={Users}
                title="Aucune donnée"
                description="La liste des employés apparaîtra ici lorsque le système sera connecté."
              />
            </td>
          </tr>
        </TableShell>
      </SectionCard>
    </div>
  );
}
