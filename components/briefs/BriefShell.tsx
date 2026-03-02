"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BriefList } from "./BriefList";
import { BriefDetail } from "./BriefDetail";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { useBriefsStore, useFilteredBriefs } from "@/lib/briefs/store";
import type { BriefStatus } from "@/lib/briefs/types";
import { useProjets } from "@/lib/store";
import { useEmployes } from "@/lib/store";
import { Search, Plus } from "lucide-react";

const STATUTS: BriefStatus[] = ["Brouillon", "Envoyé", "En cours", "Terminé"];
const PRIORITES: ("Basse" | "Normale" | "Haute")[] = ["Basse", "Normale", "Haute"];

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

const KEY_EMPLOYE_NOM = "brief-employe-nom";

function useEmployeNom() {
  const [nom, setNomState] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY_EMPLOYE_NOM);
      if (raw) setNomState(raw);
    } catch {}
  }, []);
  const setNom = useCallback((v: string) => {
    setNomState(v);
    if (typeof window !== "undefined") localStorage.setItem(KEY_EMPLOYE_NOM, v);
  }, []);
  return [nom, setNom] as const;
}

export function BriefShell({ mode }: { mode: "patron" | "employe" }) {
  const isPatron = mode === "patron";
  const {
    briefs,
    selectedId,
    selectedBrief,
    setSelectedBriefId,
    getById,
    create,
    update,
    remove,
    setStatut,
    addZone,
    updateZone,
    removeZone,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addPiece,
    removePiece,
    addPieceToZone,
    addMessage,
  } = useBriefsStore();

  const [employeNom, setEmployeNom] = useEmployeNom();
  const { projets } = useProjets();
  const { employes } = useEmployes();

  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<BriefStatus | "">("");
  const [filtreChantier, setFiltreChantier] = useState("");
  const [filtrePriorite, setFiltrePriorite] = useState<"" | "Basse" | "Normale" | "Haute">("");
  const [modalNewOpen, setModalNewOpen] = useState(false);
  const [newTitre, setNewTitre] = useState("");
  const [newChantierId, setNewChantierId] = useState("");
  const [newPriorite, setNewPriorite] = useState<"Basse" | "Normale" | "Haute">("Normale");

  const filters = { search, statut: filtreStatut, chantierId: filtreChantier || undefined, priorite: filtrePriorite || undefined };
  const filtered = useFilteredBriefs(briefs, filters);

  const getChantierNom = useCallback((id: string | undefined) => (id ? projets.find((p) => p.id === id)?.titre ?? id : ""), [projets]);

  const handleCreate = () => {
    if (!newTitre.trim()) return;
    create({
      titre: newTitre.trim(),
      chantierId: newChantierId || undefined,
      priorite: newPriorite,
      statut: "Brouillon",
      instructions: "",
      zones: [],
      checklist: [],
      pieces: [],
      messages: [],
    });
    setNewTitre("");
    setNewChantierId("");
    setNewPriorite("Normale");
    setModalNewOpen(false);
  };

  const handleAddZone = () => {
    if (!selectedId) return;
    addZone(selectedId, { titre: "Nouvelle zone", details: "" });
  };

  const handleAddMessage = useCallback((texte: string) => {
    if (!selectedId) return;
    addMessage(selectedId, {
      auteur: isPatron ? "Patron" : "Employé",
      nom: isPatron ? undefined : employeNom,
      texte,
    });
  }, [selectedId, isPatron, employeNom, addMessage]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Brief & affectations" subtitle="Instructions et pièces jointes pour les chantiers." />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary pointer-events-none" />
          <input type="search" className={inputClass + " pl-9"} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un brief..." />
        </div>
        <select className={inputClass + " w-auto min-w-[110px]"} value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value as BriefStatus | "")}>
          <option value="">Statut</option>
          {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={inputClass + " w-auto min-w-[140px]"} value={filtreChantier} onChange={(e) => setFiltreChantier(e.target.value)}>
          <option value="">Chantier</option>
          {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
        </select>
        <select className={inputClass + " w-auto min-w-[100px]"} value={filtrePriorite} onChange={(e) => setFiltrePriorite(e.target.value as "" | "Basse" | "Normale" | "Haute")}>
          <option value="">Priorité</option>
          {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {isPatron && (
          <button type="button" onClick={() => setModalNewOpen(true)} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1.5">
            <Plus size={18} strokeWidth={1.7} /> Nouveau brief
          </button>
        )}
      </div>

      {!isPatron && (
        <div className="mb-3">
          <label className="text-caption-xs text-neutral-text-secondary">Votre nom (pour les messages)</label>
          <input type="text" className={inputClass + " max-w-xs mt-0.5"} value={employeNom} onChange={(e) => setEmployeNom(e.target.value)} placeholder="Votre nom" />
        </div>
      )}

      <div className="flex flex-1 min-h-0 border border-neutral-border rounded overflow-hidden" style={{ minHeight: "420px" }}>
        <div className="w-[40%] min-w-0 flex flex-col">
          <BriefList
            briefs={filtered}
            selectedId={selectedId}
            getChantierNom={getChantierNom}
            onSelect={setSelectedBriefId}
            emptyMessage={isPatron ? "Créez un brief pour commencer." : "Aucun brief assigné."}
            onNewBrief={isPatron ? () => setModalNewOpen(true) : undefined}
          />
        </div>
        <div className="w-[60%] min-w-0 flex flex-col border-l border-neutral-border">
          <BriefDetail
            brief={selectedBrief}
            isPatron={isPatron}
            projets={projets.map((p) => ({ id: p.id, titre: p.titre }))}
            employes={employes.map((e) => ({ id: e.id, nom: e.nom }))}
            employeNom={employeNom}
            onUpdate={(p) => selectedId && update(selectedId, p)}
            onSetStatut={(s) => selectedId && setStatut(selectedId, s)}
            onDelete={() => selectedId && remove(selectedId)}
            onAddZone={handleAddZone}
            onUpdateZone={(zoneId, p) => selectedId && updateZone(selectedId, zoneId, p)}
            onRemoveZone={(zoneId) => selectedId && removeZone(selectedId, zoneId)}
            onAddPieceToZone={(zoneId, piece) => selectedId && addPieceToZone(selectedId, zoneId, piece)}
            onAddChecklistItem={(item) => selectedId && addChecklistItem(selectedId, item)}
            onToggleChecklist={(itemId) => selectedId && toggleChecklistItem(selectedId, itemId)}
            onRemoveChecklistItem={(itemId) => selectedId && removeChecklistItem(selectedId, itemId)}
            onAddPiece={(piece) => selectedId && addPiece(selectedId, piece)}
            onRemovePiece={(pieceId) => selectedId && removePiece(selectedId, pieceId)}
            onAddMessage={handleAddMessage}
          />
        </div>
      </div>

      <Modal open={modalNewOpen} onClose={() => setModalNewOpen(false)} title="Nouveau brief" maxWidth="sm">
        <div className="p-4 space-y-4">
          <Field label="Titre" required>
            <input type="text" className={inputClass} value={newTitre} onChange={(e) => setNewTitre(e.target.value)} placeholder="Titre du brief" />
          </Field>
          <Field label="Chantier">
            <select className={inputClass} value={newChantierId} onChange={(e) => setNewChantierId(e.target.value)}>
              <option value="">{projets.length === 0 ? "Aucun chantier disponible — créez un chantier d'abord." : "—"}</option>
              {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
            </select>
          </Field>
          <Field label="Priorité">
            <select className={inputClass} value={newPriorite} onChange={(e) => setNewPriorite(e.target.value as "Basse" | "Normale" | "Haute")}>
              {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalNewOpen(false)} className="h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={handleCreate} disabled={!newTitre.trim()} className="h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded focus-ring disabled:opacity-50">Créer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
