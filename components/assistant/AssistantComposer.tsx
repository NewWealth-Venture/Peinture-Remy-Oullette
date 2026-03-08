"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export function AssistantComposer({
  onSend,
  disabled,
  onAttachContext,
  hasContext,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  onAttachContext: () => void;
  hasContext: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [value]);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };

  return (
    <div className="shrink-0 p-3 border-t border-neutral-border bg-neutral-white">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Posez une question sur les projets, employés, inventaire, agenda, finances…"
          disabled={disabled}
          rows={2}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded border border-neutral-border px-3 py-2 text-caption text-neutral-text placeholder:text-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue disabled:opacity-60"
          style={{ fontSize: "13px" }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="shrink-0 p-2 rounded border border-neutral-border bg-primary-blue text-white hover:opacity-90 disabled:opacity-50 focus-ring"
          aria-label="Envoyer"
        >
          <Send size={18} strokeWidth={1.7} />
        </button>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onAttachContext}
          disabled={!hasContext}
          className="text-caption-xs text-primary-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasContext ? "Joindre le contexte de la page actuelle" : "Contexte non disponible"}
        </button>
      </div>
    </div>
  );
}
