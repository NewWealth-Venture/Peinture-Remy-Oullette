"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

const inputClass = "w-full min-h-[80px] px-3 py-2 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:ring-2 focus:ring-primary-blue/20 focus:outline-none resize-y";

interface MessageComposerProps {
  placeholder?: string;
  onSubmit: (texte: string) => void;
  disabled?: boolean;
}

export function MessageComposer({ placeholder = "Écrire un message...", onSubmit, disabled }: MessageComposerProps) {
  const [texte, setTexte] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texte.trim()) return;
    onSubmit(texte.trim());
    setTexte("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea className={inputClass + " flex-1"} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={placeholder} disabled={disabled} rows={2} />
      <button type="submit" disabled={!texte.trim() || disabled} className="h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50 shrink-0 self-end flex items-center gap-1">
        <Send size={18} strokeWidth={1.7} /> Envoyer
      </button>
    </form>
  );
}
