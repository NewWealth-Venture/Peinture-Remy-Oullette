"use client";

import { X, Plus } from "lucide-react";

export function AssistantHeader({
  onClose,
  onNewChat,
}: {
  onClose: () => void;
  onNewChat: () => void;
}) {
  return (
    <div className="shrink-0 px-4 py-3 border-b border-neutral-border bg-neutral-white flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h2 className="font-heading text-section-title text-neutral-text">Assistant IA</h2>
        <p className="text-caption-xs text-neutral-text-secondary mt-0.5">
          Analyse, recherche et assistance métier
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onNewChat}
          className="p-2 rounded border border-neutral-border bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
          aria-label="Nouveau chat"
        >
          <Plus size={18} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded border border-neutral-border bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
          aria-label="Fermer"
        >
          <X size={18} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}
