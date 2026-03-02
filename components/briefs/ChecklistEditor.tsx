"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/briefs/types";
import { EmptyInline } from "@/components/EmptyInline";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

interface ChecklistEditorProps {
  items: ChecklistItem[];
  isPatron: boolean;
  onAdd: (item: Omit<ChecklistItem, "id">) => void;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function ChecklistEditor({ items, isPatron, onAdd, onToggle, onRemove }: ChecklistEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newObligatoire, setNewObligatoire] = useState(false);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    onAdd({ label: newLabel.trim(), obligatoire: newObligatoire });
    setNewLabel("");
    setNewObligatoire(false);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <EmptyInline icon={ClipboardList} message="Aucun item." />
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 py-1.5 px-2 border border-neutral-border rounded">
              {isPatron ? (
                <>
                  <button type="button" onClick={() => onRemove(item.id)} className="p-1 rounded text-neutral-text-secondary hover:bg-red-50 hover:text-red-600 focus-ring shrink-0" aria-label="Supprimer"><Trash2 size={14} strokeWidth={1.7} /></button>
                  <span className={`flex-1 text-caption ${item.fait ? "line-through text-neutral-text-secondary" : "text-neutral-text"}`}>{item.label}</span>
                  {item.obligatoire && <span className="text-caption-xs text-neutral-text-secondary">Requis</span>}
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={item.fait ?? false}
                    onChange={() => onToggle(item.id)}
                    className="rounded border-neutral-border text-primary-orange focus:ring-primary-blue shrink-0"
                  />
                  <span className={`flex-1 text-caption ${item.fait ? "line-through text-neutral-text-secondary" : "text-neutral-text"}`}>{item.label}</span>
                  {item.obligatoire && <span className="text-caption-xs text-neutral-text-secondary">Requis</span>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {isPatron && (
        <div className="flex gap-2 items-center pt-2">
          <input type="text" className={inputClass + " flex-1"} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nouvel item..." onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <label className="flex items-center gap-1.5 text-caption text-neutral-text-secondary shrink-0">
            <input type="checkbox" checked={newObligatoire} onChange={(e) => setNewObligatoire(e.target.checked)} className="rounded border-neutral-border" />
            Obligatoire
          </label>
          <button type="button" onClick={handleAdd} className="h-9 px-2.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring flex items-center gap-1">
            <Plus size={16} strokeWidth={1.7} /> Ajouter
          </button>
        </div>
      )}
    </div>
  );
}
