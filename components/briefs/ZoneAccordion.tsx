"use client";

import { useState } from "react";
import type { ZoneInstruction, MediaPiece } from "@/lib/briefs/types";
import { MediaGrid } from "./MediaGrid";
import { MediaUploader } from "./MediaUploader";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

interface ZoneAccordionProps {
  zone: ZoneInstruction;
  isPatron: boolean;
  onUpdate: (payload: Partial<ZoneInstruction>) => void;
  onRemove: () => void;
  onAddPiece: (piece: Omit<MediaPiece, "id" | "creeLe">) => void;
}

export function ZoneAccordion({ zone, isPatron, onUpdate, onRemove, onAddPiece }: ZoneAccordionProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [titre, setTitre] = useState(zone.titre);
  const [details, setDetails] = useState(zone.details ?? "");

  const save = () => {
    onUpdate({ titre, details: details || undefined });
    setEditing(false);
  };

  return (
    <div className="border border-neutral-border rounded overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left bg-neutral-bg-subtle hover:bg-neutral-bg-active focus-ring border-b border-neutral-border"
      >
        {open ? <ChevronDown size={18} strokeWidth={1.7} /> : <ChevronRight size={18} strokeWidth={1.7} />}
        <span className="font-medium text-neutral-text flex-1 truncate">{zone.titre || "Sans titre"}</span>
        {isPatron && (
          <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-neutral-border focus-ring" aria-label="Modifier"><Pencil size={14} strokeWidth={1.7} /></button>
            <button type="button" onClick={onRemove} className="p-1.5 rounded hover:bg-red-100 text-red-600 focus-ring" aria-label="Supprimer"><Trash2 size={14} strokeWidth={1.7} /></button>
          </span>
        )}
      </button>
      {open && (
        <div className="p-3 bg-neutral-white">
          {editing ? (
            <div className="space-y-2">
              <input type="text" className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de la zone" />
              <textarea className={inputClass + " min-h-[60px] resize-y py-2"} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Détails..." />
              <div className="flex gap-2">
                <button type="button" onClick={save} className="h-8 px-2.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring">Enregistrer</button>
                <button type="button" onClick={() => { setEditing(false); setTitre(zone.titre); setDetails(zone.details ?? ""); }} className="h-8 px-2.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
              </div>
            </div>
          ) : (
            <>
              {zone.details && <p className="text-caption text-neutral-text-secondary mb-2">{zone.details}</p>}
              <MediaGrid pieces={zone.pieces ?? []} readOnly={!isPatron} />
              {isPatron && (
                <div className="mt-2">
                  <p className="text-caption-xs text-neutral-text-secondary mb-1">Ajouter photo/vidéo à cette zone</p>
                  <MediaUploader onAdd={onAddPiece} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
