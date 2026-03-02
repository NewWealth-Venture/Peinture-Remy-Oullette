"use client";

import { useState } from "react";
import type { Brief, BriefStatus } from "@/lib/briefs/types";
import { Pencil, Send, Check, MoreVertical, Trash2 } from "lucide-react";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

interface BriefHeaderProps {
  brief: Brief;
  isPatron: boolean;
  onUpdateTitre: (titre: string) => void;
  onSetStatut: (statut: BriefStatus) => void;
  onDelete: () => void;
}

export function BriefHeader({ brief, isPatron, onUpdateTitre, onSetStatut, onDelete }: BriefHeaderProps) {
  const [editingTitre, setEditingTitre] = useState(false);
  const [titre, setTitre] = useState(brief.titre);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveTitre = () => {
    if (titre.trim()) onUpdateTitre(titre.trim());
    setEditingTitre(false);
  };

  return (
    <div className="shrink-0 px-4 py-3 border-b border-neutral-border bg-neutral-white">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editingTitre && isPatron ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="flex-1 h-9 px-3 border border-neutral-border rounded text-body font-medium focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
                autoFocus
                onBlur={saveTitre}
                onKeyDown={(e) => e.key === "Enter" && saveTitre()}
              />
            </div>
          ) : (
            <button type="button" onClick={() => isPatron && setEditingTitre(true)} className="text-left font-heading font-medium text-neutral-text truncate block w-full focus-ring rounded">
              {brief.titre || "Sans titre"}
            </button>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text">{brief.statut}</span>
            <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text-secondary">{brief.priorite}</span>
            {brief.echeance && <span className="text-caption-xs text-neutral-text-secondary">Échéance : {formatDate(brief.echeance)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 relative">
          {isPatron && brief.statut === "Brouillon" && (
            <button type="button" onClick={() => onSetStatut("Envoyé")} className="h-8 px-2.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1">
              <Send size={14} strokeWidth={1.7} /> Envoyer
            </button>
          )}
          {brief.statut === "Envoyé" && !isPatron && (
            <button type="button" onClick={() => onSetStatut("En cours")} className="h-8 px-2.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
              Confirmer la réception
            </button>
          )}
          {brief.statut === "En cours" && (
            <button type="button" onClick={() => onSetStatut("Terminé")} className="h-8 px-2.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring flex items-center gap-1">
              <Check size={14} strokeWidth={1.7} /> Marquer terminé
            </button>
          )}
          {isPatron && (
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="h-8 w-8 flex items-center justify-center rounded border border-neutral-border hover:bg-neutral-bg-subtle focus-ring">
              <MoreVertical size={18} strokeWidth={1.7} />
            </button>
          )}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full mt-1 z-20 py-1 rounded border border-neutral-border bg-neutral-white shadow-sm min-w-[140px]">
                <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }} className="w-full px-3 py-2 text-left text-caption text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 size={14} strokeWidth={1.7} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
