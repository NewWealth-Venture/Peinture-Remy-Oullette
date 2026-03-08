"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AssistantHeader } from "./AssistantHeader";
import { AssistantMessages } from "./AssistantMessages";
import { AssistantComposer } from "./AssistantComposer";
import { AssistantSuggestions } from "./AssistantSuggestions";
import { AssistantContextBadge } from "./AssistantContextBadge";
import { buildPageContextFromRoute } from "@/lib/ai/context";
import type { AssistantPageContext } from "@/lib/ai/context";
import type { MessageRecord } from "./AssistantMessages";

type AssistantPanelProps = {
  open: boolean;
  onClose: () => void;
};

function getProjectIdFromRoute(pathname: string): string | undefined {
  const m = pathname.match(/\/patron\/projets\/([^/]+)/);
  return m?.[1];
}

export function AssistantPanel({ open, onClose }: AssistantPanelProps) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [includePageContextAuto, setIncludePageContextAuto] = useState(true);
  const [attachContextNext, setAttachContextNext] = useState(false);

  const pageContext: AssistantPageContext | null = open
    ? buildPageContextFromRoute(pathname, getProjectIdFromRoute(pathname))
    : null;

  const sendMessage = useCallback(
    async (content: string) => {
      const includeContext = includePageContextAuto || attachContextNext;
      setAttachContextNext(false);
      const userMsg: MessageRecord = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      try {
        const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            pageContext: includeContext ? pageContext ?? undefined : undefined,
            includePageContext: includeContext,
          }),
        });
        const data = await res.json();
        const text = data.content ?? (data.error ? `Erreur : ${data.error}` : "Aucune réponse.");
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        setMessages((prev) => [...prev, { role: "assistant", content: `Erreur : ${err}` }]);
      } finally {
        setLoading(false);
      }
    },
    [messages, includePageContextAuto, attachContextNext, pageContext]
  );

  const newChat = useCallback(() => {
    setMessages([]);
    setAttachContextNext(false);
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed top-[56px] left-0 right-0 bottom-0 z-40 bg-black/20"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="fixed top-[56px] right-0 z-50 w-full max-w-[420px] h-[calc(100vh-56px)] flex flex-col bg-neutral-white border-l border-neutral-border shadow-lg"
        role="dialog"
        aria-label="Assistant IA"
      >
        <AssistantHeader onClose={onClose} onNewChat={newChat} />
        {messages.length === 0 && (
          <AssistantSuggestions onSelect={sendMessage} />
        )}
        <AssistantMessages messages={messages} isLoading={loading} />
        <AssistantComposer
          onSend={sendMessage}
          disabled={loading}
          onAttachContext={() => setAttachContextNext(true)}
          hasContext={Boolean(pageContext?.route)}
        />
        <AssistantContextBadge
          context={pageContext}
          includeAuto={includePageContextAuto}
          onToggleAuto={() => setIncludePageContextAuto((v) => !v)}
        />
      </aside>
    </>
  );
}
