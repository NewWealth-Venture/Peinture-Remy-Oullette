import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { listVoiceBriefs } from "@/lib/db/voice-briefs";
import { getBriefById } from "@/lib/db/briefs";
import { getProjectById } from "@/lib/db/projects";
import Link from "next/link";

export default async function PatronAffectationsVocauxPage() {
  const voiceBriefs = await listVoiceBriefs();

  return (
    <div className="p-6 max-w-[1180px] mx-auto space-y-6">
      <PageHeader
        title="Briefs vocaux"
        subtitle="Historique des messages vocaux transformés en briefs."
      />

      <SectionCard title="Historique">
        {voiceBriefs.length === 0 ? (
          <p className="text-caption text-neutral-text-secondary">
            Aucun brief vocal pour l’instant. Utilisez le bouton "Nouveau brief vocal" dans la page d’affectations.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-caption">
              <thead>
                <tr className="border-b border-neutral-border text-neutral-text-secondary">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Titre détecté</th>
                  <th className="py-2 pr-4 font-medium">Chantier</th>
                  <th className="py-2 pr-4 font-medium">Statut</th>
                  <th className="py-2 pr-4 font-medium">Durée</th>
                  <th className="py-2 pr-4 font-medium">Brief lié</th>
                </tr>
              </thead>
              <tbody>
                {voiceBriefs.map((vb) => (
                  <tr key={vb.id} className="border-b border-neutral-border/60 last:border-0">
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {vb.created_at?.slice(0, 10)}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text">
                      {vb.ai_summary ? vb.ai_summary.slice(0, 60) + (vb.ai_summary.length > 60 ? "…" : "") : "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {vb.project_title || "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {vb.status}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {vb.audio_duration_seconds != null ? `${vb.audio_duration_seconds}s` : "—"}
                    </td>
                    <td className="py-2 pr-4 text-neutral-text-secondary">
                      {vb.brief_id ? (
                        <Link href="/patron/affectations" className="text-primary-blue hover:underline">
                          Voir le brief
                        </Link>
                      ) : (
                        "—"
                      )}
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

