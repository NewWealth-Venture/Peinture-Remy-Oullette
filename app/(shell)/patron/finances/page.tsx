import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { TableShell } from "@/components/TableShell";
import { EmptyState } from "@/components/EmptyState";
import { InlineNotice } from "@/components/InlineNotice";
import { Banknote } from "lucide-react";

const columns = ["Factures", "Dépenses", "Fournisseurs"];

export default function PatronFinancesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Finances"
        subtitle="Suivi facturation et dépenses."
      />
      <div className="space-y-6">
        <InlineNotice>
          Connexion comptable à venir.
        </InlineNotice>
        <SectionCard title="Vue financière">
          <TableShell columns={columns}>
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState
                  icon={Banknote}
                  title="Aucune donnée"
                  description="Les factures, dépenses et fournisseurs apparaîtront ici après connexion comptable."
                />
              </td>
            </tr>
          </TableShell>
        </SectionCard>
      </div>
    </div>
  );
}
