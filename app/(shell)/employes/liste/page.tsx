import { PageHeader } from "@/components/PageHeader";
import { listEmployees } from "@/lib/db/employees";
import { EmployesListeClient } from "./EmployesListeClient";

export default async function EmployesListePage() {
  const employees = await listEmployees(false);

  return (
    <div className="p-6">
      <PageHeader title="Liste des employés" subtitle="Effectif et statut actuel." />
      <EmployesListeClient initialEmployees={employees} />
    </div>
  );
}
