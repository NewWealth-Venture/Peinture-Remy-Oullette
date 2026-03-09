import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/PageHeader";
import { listEmployees } from "@/lib/db/employees";
import type { EmploymentStatus, EmploymentType } from "@/lib/db/employees";
import { EmployesToolbar } from "./EmployesToolbar";
import { EmployesTable } from "./EmployesTable";
import { EmptyState } from "@/components/EmptyState";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{
  search?: string;
  status?: string;
  type?: string;
  role?: string;
  expired_cert?: string;
  no_photo?: string;
  sort?: string;
  asc?: string;
}>;

export default async function PatronEmployesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("patron");
  const params = await searchParams;
  const filters = {
    employment_status: params.status as EmploymentStatus | undefined,
    employment_type: params.type as EmploymentType | undefined,
    role_title: params.role ?? undefined,
    has_expired_certifications: params.expired_cert === "1",
    has_no_photo: params.no_photo === "1",
  };
  const employees = await listEmployees(false, {
    search: params.search?.trim(),
    filters: Object.keys(filters).length ? filters : undefined,
    sort: (params.sort as "full_name" | "hire_date" | "employment_status") || "full_name",
    ascending: params.asc !== "0",
  });

  return (
    <div className="min-w-0">
      <PageHeader
        title="Employés"
        subtitle="Gestion des dossiers employés, affectations et informations RH."
      />
      <EmployesToolbar currentParams={params} />
      {employees.length === 0 ? (
        <div className="border border-neutral-border rounded-lg bg-neutral-bg-subtle/30 py-10">
          <EmptyState
            icon={Users}
            title="Aucun employé"
            description="Ajoutez un employé pour gérer l’effectif et les dossiers RH."
            cta={
              <Link
                href="/patron/employes/nouveau"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
              >
                <UserPlus size={16} strokeWidth={1.7} /> Ajouter un employé
              </Link>
            }
          />
        </div>
      ) : (
        <EmployesTable employees={employees} />
      )}
    </div>
  );
}
