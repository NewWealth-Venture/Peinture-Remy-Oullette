"use client";

import { useState } from "react";
import type { Brief, ZoneInstruction, ChecklistItem, MediaPiece } from "@/lib/briefs/types";
import { BriefHeader } from "./BriefHeader";
import { ZoneAccordion } from "./ZoneAccordion";
import { ChecklistEditor } from "./ChecklistEditor";
import { MediaGrid } from "./MediaGrid";
import { MediaUploader } from "./MediaUploader";
import { Thread } from "./Thread";
import { EmptyInline } from "@/components/EmptyInline";
import { Image, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export interface BriefDetailContentProps {
  brief: Brief;
  isPatron: boolean;
  projets: { id: string; titre: string }[];
  employes: { id: string; nom: string }[];
  employeNom?: string;
  onUpdate: (payload: Partial<Brief>) => void;
  onSetStatut: (statut: Brief["statut"]) => void;
  onDelete: () => void;
  onAddZone: () => void;
  onUpdateZone: (zoneId: string, payload: Partial<ZoneInstruction>) => void;
  onRemoveZone: (zoneId: string) => void;
  onAddPieceToZone: (zoneId: string, piece: Omit<MediaPiece, "id" | "creeLe">) => void;
  onAddChecklistItem: (item: Omit<ChecklistItem, "id">) => void;
  onToggleChecklist: (itemId: string) => void;
  onRemoveChecklistItem: (itemId: string) => void;
  onAddPiece: (piece: Omit<MediaPiece, "id" | "creeLe">) => void;
  onRemovePiece: (pieceId: string) => void;
  onAddMessage: (texte: string) => void;
}

export function BriefDetailContent({
  brief,
  isPatron,
  projets,
  employes,
  employeNom,
  onUpdate,
  onSetStatut,
  onDelete,
  onAddZone,
  onUpdateZone,
  onRemoveZone,
  onAddPieceToZone,
  onAddChecklistItem,
  onToggleChecklist,
  onRemoveChecklistItem,
  onAddPiece,
  onRemovePiece,
  onAddMessage,
}: BriefDetailContentProps) {
  const [blocageModalOpen, setBlocageModalOpen] = useState(false);
  const [blocageTexte, setBlocageTexte] = useState("");

  const handleBlocageSubmit = () => {
    if (blocageTexte.trim()) {
      onAddMessage(`[Blocage] ${blocageTexte.trim()}`);
      setBlocageTexte("");
      setBlocageModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-white overflow-hidden">
      <BriefHeader brief={brief} isPatron={isPatron} onUpdateTitre={(t) => onUpdate({ titre: t })} onSetStatut={onSetStatut} onDelete={onDelete} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Aperçu</h4>
          <div className="space-y-2">
            <div>
              <label className="block text-caption-xs text-neutral-text-secondary mb-0.5">Chantier</label>
              {isPatron ? (
                <select
                  className={inputClass}
                  value={brief.chantierId ?? ""}
                  onChange={(e) => onUpdate({ chantierId: e.target.value || undefined })}
                >
                  <option value="">{projets.length === 0 ? "Aucun chantier disponible — créez un chantier d'abord." : "—"}</option>
                  {projets.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
                </select>
              ) : (
                <p className="text-caption text-neutral-text">{projets.find((p) => p.id === brief.chantierId)?.titre ?? "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-caption-xs text-neutral-text-secondary mb-0.5">Assignés</label>
              {isPatron ? (
                <select
                  className={inputClass}
                  value={brief.assignes?.[0]?.id ?? ""}
                  onChange={(e) => {
                    const emp = employes.find((x) => x.id === e.target.value);
                    onUpdate({ assignes: emp ? [{ id: emp.id, nom: emp.nom }] } : undefined });
                  }}
                >
                  <option value="">—</option>
                  {employes.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              ) : (
                <p className="text-caption text-neutral-text">{brief.assignes?.map((a) => a.nom).join(", ") ?? "—"}</p>
              )}
            </div>
            <div>
              <label className="block text-caption-xs text-neutral-text-secondary mb-0.5">Instructions</label>
              {isPatron ? (
                <textarea
                  className={inputClass + " min-h-[100px] resize-y py-2"}
                  value={brief.instructions}
                  onChange={(e) => onUpdate({ instructions: e.target.value })}
                  placeholder="Instructions détaillées..."
                />
              ) : (
                <p className="text-caption text-neutral-text whitespace-pre-wrap">{brief.instructions || "—"}</p>
              )}
            </div>
            {isPatron && (
              <button type="button" onClick={onAddZone} className="h-8 px-2.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring">
                Ajouter une zone
              </button>
            )}
          </div>
        </section>

        {brief.zones && brief.zones.length > 0 && (
          <section>
            <h4 className="text-section-title text-neutral-text mb-2">Zones & instructions</h4>
            <div className="space-y-2">
              {brief.zones.map((z) => (
                <ZoneAccordion
                  key={z.id}
                  zone={z}
                  isPatron={isPatron}
                  onUpdate={(p) => onUpdateZone(z.id, p)}
                  onRemove={() => onRemoveZone(z.id)}
                  onAddPiece={(p) => onAddPieceToZone(z.id, p)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Checklist</h4>
          <ChecklistEditor
            items={brief.checklist ?? []}
            isPatron={isPatron}
            onAdd={onAddChecklistItem}
            onToggle={onToggleChecklist}
            onRemove={onRemoveChecklistItem}
          />
        </section>

        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Pièces jointes</h4>
          {(!brief.pieces || brief.pieces.length === 0) && (!brief.zones?.some((z) => z.pieces?.length)) ? (
            <EmptyInline icon={Image} message="Aucune pièce jointe." />
          ) : (
            <MediaGrid pieces={brief.pieces ?? []} onRemove={isPatron ? (id) => onRemovePiece(id) : undefined} readOnly={!isPatron} />
          )}
          {isPatron && (
            <div className="mt-2">
              <MediaUploader onAdd={onAddPiece} />
            </div>
          )}
        </section>

        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Discussion / Questions</h4>
          {!isPatron && brief.statut !== "Brouillon" && (
            <button type="button" onClick={() => setBlocageModalOpen(true)} className="mb-2 h-8 px-2.5 text-caption font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 focus-ring flex items-center gap-1">
              <AlertCircle size={14} strokeWidth={1.7} /> Signaler un blocage
            </button>
          )}
          <Thread
            messages={brief.messages ?? []}
            isPatron={isPatron}
            employeNom={employeNom}
            onSendMessage={(texte) => onAddMessage(texte)}
          />
        </section>
      </div>

      <Modal open={blocageModalOpen} onClose={() => setBlocageModalOpen(false)} title="Signaler un blocage" maxWidth="sm">
        <div className="p-4 space-y-3">
          <textarea className={inputClass + " min-h-[100px] resize-y py-2"} value={blocageTexte} onChange={(e) => setBlocageTexte(e.target.value)} placeholder="Décrivez le blocage..." />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setBlocageModalOpen(false)} className="h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={handleBlocageSubmit} disabled={!blocageTexte.trim()} className="h-9 px-3 text-caption font-medium text-white bg-red-600 rounded focus-ring disabled:opacity-50">Envoyer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
