import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { FileText, Mic } from "lucide-react";
import { listProjects } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listVoiceReports } from "@/lib/db/voice-reports";
import { VoiceReportRecorder } from "@/components/voice/VoiceReportRecorder";

export default async function PatronRapportsPage() {
  const [projects, employees, reports] = await Promise.all([
    listProjects(),
    listEmployees(true),
    listVoiceReports({ limit: 100 }),
  ]);

  const projectOptions = projects.map((p) => ({ id: p.id, title: p.title }));
  const employeeOptions = employees.map((e) => ({ id: e.id, name: e.full_name }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Comptes rendus vocaux"
        subtitle="Centralisez les notes vocales terrain en transcriptions, résumés et rapports structurés."
      />

      <VoiceReportRecorder projectOptions={projectOptions} employeeOptions={employeeOptions} />

      <SectionCard title="Rapports vocaux récents" className="mt-4">
        {reports.length === 0 ? (
          <EmptyState
            icon={Mic}
            title="Aucun compte rendu vocal"
            description="Enregistrez un premier compte rendu vocal pour un chantier ou une équipe. Il apparaîtra ensuite dans cette liste."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-caption">
              <thead>
                <tr className="border-b border-neutral-border text-neutral-text-secondary">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Titre</th>
                  <th className="py-2 pr-4 font-medium">Chantier</th>
                  <th className="py-2 pr-4 font-medium">Employé</th>
                  <th className="py-2 pr-4 font-medium">Catégorie</th>
                  <th className="py-2 pr-4 font-medium">Durée</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-border/60 last:border-0">
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {r.report_date ?? r.created_at?.slice(0, 10)}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-neutral-text-secondary shrink-0" />
                        <span className="truncate max-w-[220px]">
                          {r.title || (r.summary ? r.summary.slice(0, 60) + (r.summary.length > 60 ? "…" : "") : "Sans titre")}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {r.project_title || "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {r.employee_name || "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {r.category || "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {r.audio_duration_seconds != null ? `${r.audio_duration_seconds}s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
