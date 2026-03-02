"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/EmptyState";
import { useProjets } from "@/lib/store";
import type { StatutProjet } from "@/types/projet";
import { FolderKanban, Plus, Pencil, Trash2 } from "lucide-react";

const STATUT_LABELS: Record<StatutProjet, string> = {
  "À planifier": "À planifier",
  "En cours": "En cours",
  "En attente": "En attente",
  Terminé: "Terminé",
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default function PatronProjetsPage() {
  const { projets, remove } = useProjets();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce projet ?")) return;
    setDeletingId(id);
    remove(id);
    setDeletingId(null);
  };

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader
        title="Projets"
        subtitle="Gestion des chantiers, tâches et photos avant/après."
      />

      <SectionCard
        title="Liste des projets"
        actions={
          <Link
            href="/patron/projets/nouveau"
            className="flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
          >
            <Plus size={18} strokeWidth={1.7} /> Nouveau projet
          </Link>
        }
      >
        {projets.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet"
            description="Créez un projet pour gérer chantiers, tâches et photos."
            cta={
              <Link
                href="/patron/projets/nouveau"
                className="flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
              >
                <Plus size={18} /> Créer un projet
              </Link>
            }
          />
        ) : (
          <Table
            columns={[
              { key: "projet", label: "Projet" },
              { key: "statut", label: "Statut" },
              { key: "adresse", label: "Adresse" },
              { key: "dates", label: "Dates" },
              { key: "actions", label: "Actions", className: "w-[100px]" },
            ]}
          >
            {projets.map((p) => (
              <tr key={p.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle transition-colors">
                <td className="py-3 px-4 font-medium text-neutral-text">
                  <Link href={`/patron/projets/${p.id}`} className="focus-ring rounded hover:underline">
                    {p.titre || "—"}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text">
                    {STATUT_LABELS[p.statut]}
                  </span>
                </td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">{p.adresse || "—"}</td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">
                  {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
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
        )}
      </SectionCard>
    </div>
  );
}
