"use client";

import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import type { DbEmployee } from "@/lib/db/employees";
import { deleteEmployeeAction } from "@/app/actions/data";
import { getEmployeePhotoUrl } from "@/lib/storage/employee-urls";
import { Trash2 } from "lucide-react";
import { useState } from "react";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function salaryLabel(e: DbEmployee): string {
  if (e.hourly_rate != null) return `${Number(e.hourly_rate).toFixed(2)} $/h`;
  if (e.salary_amount != null) return `${Number(e.salary_amount).toFixed(0)} $`;
  return "—";
}

function initials(e: DbEmployee): string {
  if (e.first_name && e.last_name) return `${e.first_name[0]}${e.last_name[0]}`.toUpperCase();
  if (e.full_name) {
    const parts = e.full_name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

export function EmployesTable({ employees }: { employees: DbEmployee[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined" && !window.confirm(`Supprimer l’employé « ${name} » ?`)) return;
    setDeletingId(id);
    const result = await deleteEmployeeAction(id);
    setDeletingId(null);
    if (result.success) router.refresh();
  };

  return (
    <div className="border border-neutral-border rounded-lg overflow-hidden" style={{ borderRadius: "6px" }}>
      <Table
        columns={[
          { key: "employee", label: "Employé" },
          { key: "poste", label: "Poste" },
          { key: "status", label: "Statut" },
          { key: "type", label: "Type d'emploi" },
          { key: "phone", label: "Téléphone" },
          { key: "hire", label: "Date d'embauche" },
          { key: "salary", label: "Salaire / Taux" },
          { key: "certs", label: "Certifications" },
          { key: "actions", label: "Actions", className: "w-[80px]" },
        ]}
      >
        {employees.map((emp) => {
          const photoUrl = getEmployeePhotoUrl(emp.photo_url);
          return (
            <tr
              key={emp.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/patron/employes/${emp.id}`)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  router.push(`/patron/employes/${emp.id}`);
                }
              }}
              className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg-subtle transition-colors cursor-pointer"
            >
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-bg-subtle flex items-center justify-center shrink-0 text-caption-xs font-medium text-neutral-text-secondary">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" className="object-cover w-full h-full" />
                    ) : (
                      initials(emp)
                    )}
                  </div>
                  <span className="font-medium text-neutral-text">{emp.full_name}</span>
                </div>
              </td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{emp.role_title ?? emp.role ?? "—"}</td>
              <td className="py-2.5 px-4">
                {emp.employment_status ? (
                  <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text" style={{ borderRadius: "4px" }}>
                    {emp.employment_status}
                  </span>
                ) : (
                  emp.active ? "Actif" : "Inactif"
                )}
              </td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{emp.employment_type ?? "—"}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{emp.phone ?? "—"}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{formatDate(emp.hire_date)}</td>
              <td className="py-2.5 px-4 text-caption tabular-nums">{salaryLabel(emp)}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">—</td>
              <td className="py-2.5 px-4" onClick={(ev) => ev.stopPropagation()}>
                <button
                  type="button"
                  onClick={(ev) => handleDelete(ev, emp.id, emp.full_name)}
                  disabled={deletingId === emp.id}
                  className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active hover:text-red-600 focus-ring"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} strokeWidth={1.7} />
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
