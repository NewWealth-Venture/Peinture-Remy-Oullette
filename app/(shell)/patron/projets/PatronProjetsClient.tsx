"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/app/actions/data";
import { useState } from "react";

type Row = {
  id: string;
  title: string;
  status: string;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
};

export function PatronProjetsClient({
  projects,
  formatDate,
  statutLabels,
}: {
  projects: Row[];
  formatDate: (iso: string | null | undefined) => string;
  statutLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce projet ?")) return;
    setDeletingId(id);
    const result = await deleteProjectAction(id);
    setDeletingId(null);
    if (result.success) router.refresh();
  };

  return (
    <Table
      columns={[
        { key: "projet", label: "Projet" },
        { key: "statut", label: "Statut" },
        { key: "adresse", label: "Adresse" },
        { key: "dates", label: "Dates" },
        { key: "actions", label: "Actions", className: "w-[100px]" },
      ]}
    >
      {projects.map((p) => (
        <tr key={p.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle transition-colors">
          <td className="py-3 px-4 font-medium text-neutral-text">
            <Link href={`/patron/projets/${p.id}`} className="focus-ring rounded hover:underline">
              {p.title || "—"}
            </Link>
          </td>
          <td className="py-3 px-4">
            <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text">
              {statutLabels[p.status] ?? p.status}
            </span>
          </td>
          <td className="py-3 px-4 text-caption text-neutral-text-secondary">{p.address || "—"}</td>
          <td className="py-3 px-4 text-caption text-neutral-text-secondary">
            {formatDate(p.start_date)} → {formatDate(p.end_date)}
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-1">
              <Link
                href={`/patron/projets/${p.id}`}
                className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring"
                aria-label="Modifier"
              >
                <Pencil size={16} strokeWidth={1.7} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active hover:text-red-600 focus-ring"
                aria-label="Supprimer"
              >
                <Trash2 size={16} strokeWidth={1.7} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}
