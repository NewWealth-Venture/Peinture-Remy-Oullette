"use client";

import { BriefListItem } from "./BriefListItem";
import type { Brief } from "@/lib/briefs/types";
import { MapPin } from "lucide-react";

interface BriefListProps {
  briefs: Brief[];
  selectedId: string | null;
  getChantierNom: (chantierId: string | undefined) => string;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  onNewBrief?: () => void;
}

export function BriefList({ briefs, selectedId, getChantierNom, onSelect, emptyMessage, onNewBrief }: BriefListProps) {
  return (
    <div className="flex flex-col h-full border-r border-neutral-border bg-neutral-white">
      {briefs.length === 0 ? (
        <div className="flex-1 flex items-center p-4">
          <div>
            <p className="text-caption font-medium text-neutral-text">Aucun brief</p>
            <p className="text-caption-xs text-neutral-text-secondary mt-1">{emptyMessage ?? "Créez un brief pour commencer."}</p>
            {onNewBrief && (
              <button type="button" onClick={onNewBrief} className="mt-2 h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
                Créer un brief
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {briefs.map((b) => (
            <BriefListItem
              key={b.id}
              brief={b}
              chantierNom={b.chantierId ? getChantierNom(b.chantierId) : undefined}
              selected={selectedId === b.id}
              onClick={() => onSelect(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
