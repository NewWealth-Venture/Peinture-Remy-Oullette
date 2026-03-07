"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/ui/Field";
import { createProjectAction } from "@/app/actions/data";
import type { StatutProjet } from "@/types/projet";
import { ArrowLeft } from "lucide-react";

const STATUTS: StatutProjet[] = ["À planifier", "En cours", "En attente", "Terminé"];

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export default function NouveauProjetPage() {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [adresse, setAdresse] = useState("");
  const [statut, setStatut] = useState<StatutProjet>("À planifier");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError("Le titre est requis.");
      return;
    }
    setSaving(true);
    const result = await createProjectAction({
      title: titre.trim(),
      address: adresse.trim() || null,
      status: statut,
      description: description.trim() || null,
      start_date: dateDebut || null,
      end_date: dateFin || null,
    });
    setSaving(false);
    if (result.success && result.id) {
      router.push(`/patron/projets/${result.id}`);
    } else if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/patron/projets"
          className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle focus-ring"
          aria-label="Retour"
        >
          <ArrowLeft size={20} strokeWidth={1.7} />
        </Link>
        <PageHeader title="Nouveau projet" subtitle="Créer un chantier ou projet." />
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-white border border-neutral-border rounded p-6 max-w-lg">
        <div className="flex flex-col gap-4">
          <Field label="Titre" required error={error}>
            <input
              type="text"
              className={inputClass}
              value={titre}
              onChange={(e) => { setTitre(e.target.value); setError(""); }}
              placeholder="Ex. Peinture résidence Dupont"
            />
          </Field>
          <Field label="Adresse">
            <input
              type="text"
              className={inputClass}
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse du chantier"
            />
          </Field>
          <Field label="Statut">
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as StatutProjet)}>
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Date de début">
            <input type="date" className={inputClass} value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </Field>
          <Field label="Date de fin">
            <input type="date" className={inputClass} value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              className={inputClass + " min-h-[80px] resize-y py-2"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du projet..."
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Link
              href="/patron/projets"
              className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring inline-flex items-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50"
            >
              Créer le projet
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
