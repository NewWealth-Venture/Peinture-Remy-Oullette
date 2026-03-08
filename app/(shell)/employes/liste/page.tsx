import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/PageHeader";
import { listEmployees } from "@/lib/db/employees";
import { EmployesListeClient } from "./EmployesListeClient";

export default async function EmployesListePage() {
  await requireRole("patron");
  const employees = await listEmployees(false);

  return (
    <div className="min-w-0">
      <PageHeader title="Liste des employés" subtitle="Effectif et statut actuel." />
      <EmployesListeClient initialEmployees={employees} />
    </div>
  );
}
