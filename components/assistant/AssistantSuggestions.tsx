"use client";

const SUGGESTIONS = [
  "Résume les projets en cours",
  "Quels employés ont des briefs actifs ?",
  "Montre les alertes d'inventaire",
  "Prépare un résumé hebdomadaire",
  "Quels chantiers ont le plus avancé cette semaine ?",
  "Rédige un message pour l'équipe",
];

export function AssistantSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="px-3 py-2">
      <p className="text-caption-xs text-neutral-text-secondary mb-2">Suggestions</p>
      <ul className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onSelect(s)}
              className="px-2.5 py-1.5 rounded border border-neutral-border bg-neutral-white text-caption text-neutral-text hover:bg-neutral-bg-subtle hover:border-neutral-border focus-ring"
              style={{ fontSize: "12px" }}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
