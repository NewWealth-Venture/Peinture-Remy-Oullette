"use client";

import type { AssistantPageContext } from "@/lib/ai/context";

export function AssistantContextBadge({
  context,
  includeAuto,
  onToggleAuto,
}: {
  context: AssistantPageContext | null;
  includeAuto: boolean;
  onToggleAuto: () => void;
}) {
  if (!context?.route) return null;
  const label =
    context.projectId ? `Projet : ${context.projectId}` :
    context.briefId ? `Brief : ${context.briefId}` :
    context.pageType ? `Page : ${context.pageType}` :
    context.route;
  return (
    <div className="px-3 py-2 border-t border-neutral-border bg-neutral-bg-subtle flex items-center justify-between gap-2 flex-wrap">
      <span className="text-caption-xs text-neutral-text-secondary truncate" title={context.route}>
        Contexte : {label}
      </span>
      <label className="flex items-center gap-1.5 text-caption-xs text-neutral-text cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={includeAuto}
          onChange={onToggleAuto}
          className="rounded border-neutral-border"
        />
        Inclure automatiquement
      </label>
    </div>
  );
}
