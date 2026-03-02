"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { Field } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import { useInventoryStore, useEmployeNom } from "@/lib/inventory/store";
import { useProjets } from "@/lib/store";
import { Package } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

export default function EmployesMaterielPage() {
  const [employeNom, setEmployeNom] = useEmployeNom();
  const { items, locations, locationsActives, getById: getItem, recordMovement, movements } = useInventoryStore();
  const { projets } = useProjets();

  const [projetId, setProjetId] = useState("");
  const [locationSourceId, setLocationSourceId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const actives = locationsActives();
  const myMovements = movements.filter((m) => m.par.nom === employeNom).slice(0, 15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!employeNom.trim()) {
      setError("Veuillez saisir votre nom.");
      return;
    }
    const q = parseInt(quantite, 10);
    if (!itemId || !locationSourceId || isNaN(q) || q <= 0) {
      setError("Emplacement source, article et quantité valide requis.");
      return;
    }
    const item = getItem(itemId);
    if (!item) {
      setError("Article introuvable.");
      return;
    }
    const result = recordMovement({
      type: "Sortie",
      itemId,
      quantite: q,
      unite: item.unite,
      date: new Date().toISOString(),
      par: { nom: employeNom.trim() },
      motif: "Chantier",
      projetId: projetId || undefined,
      locationSourceId,
      note: note.trim() || undefined,
      piecesJointes: photoUrls.length ? photoUrls.map((url, i) => ({ id: `pj-${i}`, url, description: undefined })) : undefined,
    });
    if (result.success) {
      setQuantite("");
      setNote("");
      setPhotoUrls([]);
      setSuccess(true);
    } else {
      setError(result.error ?? "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Matériel utilisé" subtitle="Enregistrez une sortie de stock (emplacement, article, quantité)." />

      <SectionCard title="Votre nom" className="mb-4">
        <input
          type="text"
          className={inputClass + " max-w-xs"}
          value={employeNom}
          onChange={(e) => setEmployeNom(e.target.value)}
          placeholder="Nom de l'employé"
        />
      </SectionCard>

      <SectionCard title="Sortie de stock" className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
          {success && <p className="text-caption text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">Sortie enregistrée.</p>}

          <Field label="Projet (optionnel)">
            <select className={inputClass} value={projetId} onChange={(e) => setProjetId(e.target.value)}>
              <option value="">—</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.titre}</option>
              ))}
            </select>
          </Field>

          <Field label="Emplacement source" required>
            <select className={inputClass} value={locationSourceId} onChange={(e) => setLocationSourceId(e.target.value)} required>
              <option value="">Sélectionner...</option>
              {actives.map((l) => (
                <option key={l.id} value={l.id}>{l.nom} ({l.type})</option>
              ))}
            </select>
          </Field>

          <Field label="Article" required>
            <select className={inputClass} value={itemId} onChange={(e) => setItemId(e.target.value)} required>
              <option value="">Sélectionner...</option>
              {items.filter((i) => i.actif).map((i) => (
                <option key={i.id} value={i.id}>{i.nom} ({i.unite})</option>
              ))}
            </select>
          </Field>

          <Field label="Quantité" required>
            <input type="number" min={1} className={inputClass} value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
          </Field>

          <Field label="Note (optionnel)">
            <input type="text" className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note..." />
          </Field>

          <Field label="Photo (optionnel)">
            <FileUpload value={photoUrls} onChange={setPhotoUrls} maxFiles={1} />
          </Field>

          <button type="submit" className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
            Enregistrer
          </button>
        </form>

        {items.length === 0 && (
          <div className="mt-4 p-3 border border-neutral-border rounded bg-neutral-bg-subtle">
            <EmptyInline icon={Package} message="Aucun inventaire configuré." />
            <Link href="/patron/inventaire" className="text-primary-blue text-caption font-medium hover:underline mt-2 inline-block">
              Aller à Inventaire
            </Link>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Vos sorties récentes">
        {myMovements.length === 0 ? (
          <EmptyInline icon={Package} message="Aucune sortie enregistrée avec votre nom." />
        ) : (
          <ul className="space-y-2">
            {myMovements.map((m) => {
              const item = getItem(m.itemId);
              return (
                <li key={m.id} className="flex justify-between py-2 px-3 border border-neutral-border rounded text-caption">
                  <span className="text-neutral-text">{item?.nom ?? m.itemId}</span>
                  <span className="text-neutral-text-secondary">{m.quantite} {m.unite} · {formatDate(m.date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
