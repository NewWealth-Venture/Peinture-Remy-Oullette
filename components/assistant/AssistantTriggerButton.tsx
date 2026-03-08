"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AssistantPanel } from "./AssistantPanel";

export function AssistantTriggerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle hover:text-neutral-text focus-ring"
        aria-label="Assistant IA"
        title="Assistant IA"
      >
        <Sparkles size={18} strokeWidth={1.7} />
      </button>
      <AssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
