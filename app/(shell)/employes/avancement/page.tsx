"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { Field } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { useProjets } from "@/lib/store";
import { useAvancements } from "@/lib/store";
import { TrendingUp } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default function EmployesAvancementPage() {
  const { projets, getById: getProjet } = useProjets();
  const { add, byProjet } = useAvancements();
  const [projetId, setProjetId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [progression, setProgression] = useState("");
  const [resume, setResume] = useState("");
  const [blocages, setBlocages] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const avancementsProjet = projetId ? byProjet(projetId) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim()) return;
    if (!projetId) return;
    setSaving(true);
    add({
      projetId,
      date,
      progressionPourcent: progression === "" ? undefined : parseInt(progression, 10),
      resume: resume.trim(),
      blocages: blocages.trim() || undefined,
      photos: photoUrls.map((url, i) => ({ id: `ph-${i}`, url, description: undefined })),
    });
    setResume("");
    setBlocages("");
    setProgression("");
    setPhotoUrls([]);
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Avancement quotidien" subtitle="Enregistrez l'avancement et les blocages par projet." />

      <SectionCard title="Saisie" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Projet" required>
            <select className={inputClass} value={projetId} onChange={(e) => setProjetId(e.target.value)} required>
              <option value="">Sélectionner un projet...</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.titre}</option>
              ))}
            </select>
          </Field>
          {projets.length === 0 && <EmptyInline icon={TrendingUp} message="Aucun projet disponible. Créez un projet (Patron) pour enregistrer un avancement." />}

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

          <Field label="Photos (optionnel)">
            <FileUpload value={photoUrls} onChange={setPhotoUrls} maxFiles={5} />
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
        ) : avancementsProjet.length === 0 ? (
          <EmptyInline icon={TrendingUp} message="Aucun avancement pour ce projet." />
        ) : (
          <ul className="space-y-3">
            {avancementsProjet.map((a) => (
              <li key={a.id} className="py-3 px-3 border border-neutral-border rounded">
                <p className="text-caption font-medium text-neutral-text">{formatDate(a.date)}</p>
                <p className="text-caption text-neutral-text mt-1">{a.resume}</p>
                {a.progressionPourcent != null && <p className="text-caption-xs text-neutral-text-secondary mt-1">{a.progressionPourcent} %</p>}
                {a.blocages && <p className="text-caption-xs text-neutral-text-secondary mt-1">Blocages : {a.blocages}</p>}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
