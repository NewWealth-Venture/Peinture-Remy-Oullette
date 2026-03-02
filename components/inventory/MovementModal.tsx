"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/FileUpload";
import type { InventoryMovement, MovementType } from "@/lib/inventory/types";
import type { InventoryItem } from "@/lib/inventory/types";
import type { Location } from "@/lib/inventory/types";
import type { Projet } from "@/types/projet";

const TYPES: MovementType[] = ["Entrée", "Sortie", "Transfert", "Ajustement"];

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

interface MovementModalProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  locations: Location[];
  projets?: Projet[];
  defaultType?: MovementType;
  defaultItemId?: string;
  defaultLocationSourceId?: string;
  defaultLocationDestinationId?: string;
  parNom: string;
  onRecord: (mov: Omit<InventoryMovement, "id">) => { success: boolean; error?: string };
  onSuccess?: () => void;
}

export function MovementModal({
  open,
  onClose,
  items,
  locations,
  projets = [],
  defaultType,
  defaultItemId,
  defaultLocationSourceId,
  defaultLocationDestinationId,
  parNom,
  onRecord,
  onSuccess,
}: MovementModalProps) {
  const [type, setType] = useState<MovementType>("Sortie");
  const [itemId, setItemId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [locationSourceId, setLocationSourceId] = useState("");
  const [locationDestinationId, setLocationDestinationId] = useState("");
  const [projetId, setProjetId] = useState("");
  const [motif, setMotif] = useState("");
  const [note, setNote] = useState("");
  const [piecesJointes, setPiecesJointes] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(defaultType ?? "Sortie");
    setLocationSourceId(defaultLocationSourceId ?? "");
    setLocationDestinationId(defaultLocationDestinationId ?? "");
    setItemId(defaultItemId ?? "");
    setQuantite("");
    setProjetId("");
    setMotif("");
    setNote("");
    setPiecesJointes([]);
    setError("");
  }, [open, defaultType, defaultItemId, defaultLocationSourceId, defaultLocationDestinationId]);

  const item = items.find((i) => i.id === itemId);
  const actives = locations.filter((l) => l.actif);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = parseInt(quantite, 10);
    if (!item || isNaN(q) || q <= 0) {
      setError("Article et quantité valide requis.");
      return;
    }
    if (!parNom.trim()) {
      setError("Nom de l'utilisateur requis.");
      return;
    }

    const mov: Omit<InventoryMovement, "id"> = {
      type,
      itemId,
      quantite: q,
      unite: item.unite,
      date: new Date().toISOString(),
      par: { nom: parNom.trim() },
      motif: motif.trim() || undefined,
      projetId: projetId || undefined,
      note: note.trim() || undefined,
      piecesJointes: piecesJointes.length ? piecesJointes.map((url, i) => ({ id: `pj-${i}`, url, description: undefined })) : undefined,
    };
    if (type === "Entrée") mov.locationDestinationId = locationDestinationId || undefined;
    if (type === "Sortie") mov.locationSourceId = locationSourceId || undefined;
    if (type === "Transfert") {
      mov.locationSourceId = locationSourceId || undefined;
      mov.locationDestinationId = locationDestinationId || undefined;
    }
    if (type === "Ajustement") mov.locationSourceId = locationSourceId || undefined;

    const result = onRecord(mov);
    if (result.success) {
      onClose();
      onSuccess?.();
    } else {
      setError(result.error ?? "Erreur lors de l'enregistrement");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau mouvement" maxWidth="md">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

        <Field label="Type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as MovementType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Article" required>
          <select className={inputClass} value={itemId} onChange={(e) => setItemId(e.target.value)} required>
            <option value="">Sélectionner...</option>
            {items.filter((i) => i.actif).map((i) => (
              <option key={i.id} value={i.id}>{i.nom} {i.sku ? `(${i.sku})` : ""}</option>
            ))}
          </select>
        </Field>

        <Field label="Quantité" required>
          <input type="number" min={1} className={inputClass} value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
          {item && <span className="text-caption-xs text-neutral-text-secondary ml-2">{item.unite}</span>}
        </Field>

        {(type === "Sortie" || type === "Transfert" || type === "Ajustement") && (
          <Field label={type === "Transfert" ? "De (emplacement source)" : "Emplacement"} required>
            <select className={inputClass} value={locationSourceId} onChange={(e) => setLocationSourceId(e.target.value)} required={type !== "Ajustement"}>
              <option value="">Sélectionner...</option>
              {actives.map((l) => (
                <option key={l.id} value={l.id}>{l.nom} ({l.type})</option>
              ))}
            </select>
          </Field>
        )}

        {(type === "Entrée" || type === "Transfert") && (
          <Field label={type === "Transfert" ? "Vers (emplacement destination)" : "Vers (emplacement)"} required>
            <select className={inputClass} value={locationDestinationId} onChange={(e) => setLocationDestinationId(e.target.value)} required>
              <option value="">Sélectionner...</option>
              {actives.map((l) => (
                <option key={l.id} value={l.id}>{l.nom} ({l.type})</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Projet (optionnel)">
          <select className={inputClass} value={projetId} onChange={(e) => setProjetId(e.target.value)}>
            <option value="">—</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>{p.titre}</option>
            ))}
          </select>
        </Field>

        <Field label="Motif (optionnel)">
          <input type="text" className={inputClass} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. Chantier, Commande reçue..." />
        </Field>

        <Field label="Note" required={type === "Ajustement"} help={type === "Ajustement" ? "Obligatoire pour un ajustement." : undefined}>
          <textarea className={inputClass + " min-h-[60px] resize-y py-2"} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note..." />
        </Field>

        <Field label="Pièces jointes (optionnel)">
          <FileUpload value={piecesJointes} onChange={setPiecesJointes} maxFiles={3} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring">
            Annuler
          </button>
          <button type="submit" className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}
