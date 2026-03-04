"use client";

import type { Brief, ZoneInstruction, ChecklistItem, MediaPiece } from "@/lib/briefs/types";
import { BriefDetailContent } from "./BriefDetailContent";
import { MapPin } from "lucide-react";

interface BriefDetailProps {
  brief: Brief | null;
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

export function BriefDetail(props: BriefDetailProps) {
  const { brief } = props;

  if (!brief) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center border-l border-neutral-border bg-neutral-bg-subtle/30">
        <MapPin size={32} className="text-neutral-text-secondary mb-3" strokeWidth={1.7} />
        <p className="text-caption font-medium text-neutral-text">Sélectionnez un brief</p>
        <p className="text-caption-xs text-neutral-text-secondary mt-1">Cliquez sur un brief dans la liste.</p>
      </div>
    );
  }

  return (
    <BriefDetailContent
      brief={brief}
      isPatron={props.isPatron}
      projets={props.projets}
      employes={props.employes}
      employeNom={props.employeNom}
      onUpdate={props.onUpdate}
      onSetStatut={props.onSetStatut}
      onDelete={props.onDelete}
      onAddZone={props.onAddZone}
      onUpdateZone={props.onUpdateZone}
      onRemoveZone={props.onRemoveZone}
      onAddPieceToZone={props.onAddPieceToZone}
      onAddChecklistItem={props.onAddChecklistItem}
      onToggleChecklist={props.onToggleChecklist}
      onRemoveChecklistItem={props.onRemoveChecklistItem}
      onAddPiece={props.onAddPiece}
      onRemovePiece={props.onRemovePiece}
      onAddMessage={props.onAddMessage}
    />
  );
}
