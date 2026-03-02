"use client";

import type { Brief } from "@/lib/briefs/types";
import { Paperclip } from "lucide-react";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
}

interface BriefListItemProps {
  brief: Brief;
  chantierNom?: string;
  selected: boolean;
  onClick: () => void;
}

export function BriefListItem({ brief, chantierNom, selected, onClick }: BriefListItemProps) {
  const nbPieces = (brief.pieces?.length ?? 0) + (brief.zones?.reduce((s, z) => s + (z.pieces?.length ?? 0), 0) ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-neutral-border transition-colors focus-ring flex flex-col gap-1 min-h-[56px] ${
        selected ? "bg-primary-blue/5 border-l-2 border-l-primary-orange" : "hover:bg-neutral-bg-subtle"
      }`}
    >
      <p className="font-medium text-neutral-text truncate">{brief.titre || "Sans titre"}</p>
      <div className="flex items-center gap-2 text-caption-xs text-neutral-text-secondary flex-wrap">
        {chantierNom && <span>{chantierNom}</span>}
        <span className="inline-flex px-1.5 py-0.5 rounded bg-neutral-bg-subtle">{brief.statut}</span>
        <span>Éch. {formatDate(brief.echeance)}</span>
        {nbPieces > 0 && (
          <span className="flex items-center gap-0.5">
            <Paperclip size={12} strokeWidth={1.7} /> {nbPieces}
          </span>
        )}
      </div>
    </button>
  );
}
