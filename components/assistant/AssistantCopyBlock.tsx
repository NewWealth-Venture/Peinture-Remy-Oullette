"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function AssistantCopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative rounded border border-neutral-border bg-neutral-white p-3 text-caption text-neutral-text">
      <pre className="whitespace-pre-wrap font-body text-[13px] leading-relaxed overflow-x-auto">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded border border-neutral-border bg-neutral-bg-subtle hover:bg-neutral-bg-active text-neutral-text-secondary focus-ring"
        aria-label={copied ? "Copié" : "Copier"}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
