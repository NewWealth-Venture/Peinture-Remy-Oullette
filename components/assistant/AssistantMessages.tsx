"use client";

import { useEffect, useRef } from "react";
import { AssistantMessageItem } from "./AssistantMessageItem";

export type MessageRecord = { role: "user" | "assistant"; content: string };

export function AssistantMessages({
  messages,
  isLoading,
}: {
  messages: MessageRecord[];
  isLoading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2 min-h-0">
      {messages.map((m, i) => (
        <AssistantMessageItem key={i} role={m.role} content={m.content} />
      ))}
      {isLoading && (
        <div className="mr-6 ml-2 rounded-md border border-neutral-border bg-neutral-white px-3 py-2 text-caption text-neutral-text-secondary">
          Réflexion…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
