import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { Table } from "@/components/ui/Table";
import { EmptyState } from "@/components/EmptyState";
import { listProjects } from "@/lib/db/projects";
import { FolderKanban, Plus, Pencil, Trash2 } from "lucide-react";
import { PatronProjetsClient } from "./PatronProjetsClient";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

const STATUT_LABELS: Record<string, string> = {
  "À planifier": "À planifier",
  "En cours": "En cours",
  "En attente": "En attente",
  Terminé: "Terminé",
};

export default async function PatronProjetsPage() {
  const projects = await listProjects();

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Projets" subtitle="Gestion des chantiers, tâches et photos avant/après." />
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
        {projects.length === 0 ? (
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
          <PatronProjetsClient
            projects={projects.map((p) => ({
              id: p.id,
              title: p.title,
              status: p.status,
              address: p.address ?? null,
              start_date: p.start_date,
              end_date: p.end_date,
            }))}
            formatDate={formatDate}
            statutLabels={STATUT_LABELS}
          />
        )}
      </SectionCard>
    </div>
  );
}
