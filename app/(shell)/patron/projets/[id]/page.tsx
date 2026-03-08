import Link from "next/link";
import { getProjectFull } from "@/lib/db/projects";
import { listProjectAssignments } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listBriefs } from "@/lib/db/briefs";
import { listInventoryItems, getLowStockItems } from "@/lib/db/inventory";
import { ProjetDetailClient } from "./ProjetDetailClient";

export default async function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projet, assignments, employees, allBriefs, inventaire, lowStock] = await Promise.all([
    getProjectFull(id),
    listProjectAssignments(id),
    listEmployees(true),
    listBriefs(),
    listInventoryItems(true),
    getLowStockItems().catch(() => []),
  ]);

  if (!projet) {
    return (
      <div className="p-6 max-w-[1280px] mx-auto">
        <p className="text-caption text-neutral-text-secondary">Projet introuvable.</p>
        <Link href="/patron/projets" className="text-primary-blue hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const briefsForProject = allBriefs.filter((b) => b.project_id === id);
  const teamWithNames = assignments.map((a) => ({
    id: a.employee_id,
    name: employees.find((e) => e.id === a.employee_id)?.full_name ?? "—",
  }));
  const inventaireList = inventaire.map((i) => ({ id: i.id, name: i.name, unit: i.unit }));

  return (
    <ProjetDetailClient
      projet={projet}
      inventaire={inventaireList}
      briefs={briefsForProject}
      team={teamWithNames}
      lowStockItems={lowStock.map((i) => ({ id: i.id, name: i.name, min_stock: i.min_stock }))}
    />
  );
}
