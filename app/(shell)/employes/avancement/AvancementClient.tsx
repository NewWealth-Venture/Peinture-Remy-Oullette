"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { Field } from "@/components/ui/Field";
import { createDailyProgressAction } from "@/app/actions/data";
import { TrendingUp } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

type ProjectOption = { id: string; title: string };
type ProgressRow = { id: string; project_id: string; progress_date: string; summary: string; progress_percent: number | null; blockers: string | null };

export function AvancementClient({ projects, initialProgress }: { projects: ProjectOption[]; initialProgress: ProgressRow[] }) {
  const router = useRouter();
  const [projetId, setProjetId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [progression, setProgression] = useState("");
  const [resume, setResume] = useState("");
  const [blocages, setBlocages] = useState("");
  const [saving, setSaving] = useState(false);

  const progressList = useMemo(
    () => (projetId ? initialProgress.filter((a) => a.project_id === projetId).sort((a, b) => b.progress_date.localeCompare(a.progress_date)) : []),
    [projetId, initialProgress]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim() || !projetId) return;
    setSaving(true);
    const result = await createDailyProgressAction({
      project_id: projetId,
      progress_date: date,
      progress_percent: progression === "" ? null : parseInt(progression, 10),
      summary: resume.trim(),
      blockers: blocages.trim() || null,
    });
    setSaving(false);
    if (result.success) {
      setResume("");
      setBlocages("");
      setProgression("");
      router.refresh();
    }
  };

  return (
    <>
      <SectionCard title="Saisie" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Projet" required>
            <select className={inputClass} value={projetId} onChange={(e) => setProjetId(e.target.value)} required>
              <option value="">Sélectionner un projet...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          {projects.length === 0 && <EmptyInline icon={TrendingUp} message="Aucun projet disponible. Créez un projet (Patron) pour enregistrer un avancement." />}

          <Field label="Date">
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <Field label="Progression (%)" help="Optionnel, 0-100">
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={Number(progression) || 0} onChange={(e) => setProgression(e.target.value)} className="flex-1" />
              <input type="number" min={0} max={100} className={inputClass + " w-20"} value={progression} onChange={(e) => setProgression(e.target.value)} placeholder="—" />
            </div>
          </Field>

          <Field label="Résumé" required>
            <textarea className={inputClass + " min-h-[100px] resize-y py-2"} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Résumé de la journée..." required />
          </Field>

          <Field label="Blocages (optionnel)">
            <textarea className={inputClass + " min-h-[60px] resize-y py-2"} value={blocages} onChange={(e) => setBlocages(e.target.value)} placeholder="Blocages ou points d'attention..." />
          </Field>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={!resume.trim() || !projetId || saving} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50">
              Enregistrer l'avancement
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Historique (par projet)">
        {!projetId ? (
          <EmptyInline icon={TrendingUp} message="Sélectionnez un projet pour afficher l'historique." />
        ) : progressList.length === 0 ? (
          <EmptyInline icon={TrendingUp} message="Aucun avancement pour ce projet." />
        ) : (
          <ul className="space-y-3">
            {progressList.map((a) => (
              <li key={a.id} className="py-3 px-3 border border-neutral-border rounded">
                <p className="text-caption font-medium text-neutral-text">{formatDate(a.progress_date)}</p>
                <p className="text-caption text-neutral-text mt-1">{a.summary}</p>
                {a.progress_percent != null && <p className="text-caption-xs text-neutral-text-secondary mt-1">{a.progress_percent} %</p>}
                {a.blockers && <p className="text-caption-xs text-neutral-text-secondary mt-1">Blocages : {a.blockers}</p>}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
