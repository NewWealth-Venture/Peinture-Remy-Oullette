"use client";

import type { BriefMessage } from "@/lib/briefs/types";
import { MessageComposer } from "./MessageComposer";
import { MediaGrid } from "./MediaGrid";
import { EmptyInline } from "@/components/EmptyInline";
import { MessageSquare } from "lucide-react";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

interface ThreadProps {
  messages: BriefMessage[];
  isPatron: boolean;
  employeNom?: string;
  onSendMessage: (texte: string) => void;
}

export function Thread({ messages, isPatron, employeNom, onSendMessage }: ThreadProps) {
  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <EmptyInline icon={MessageSquare} message="Aucun message." />
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m.id} className={`flex ${m.auteur === "Patron" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded px-3 py-2 ${m.auteur === "Patron" ? "bg-primary-blue/10" : "bg-neutral-bg-subtle"}`}>
                <p className="text-caption-xs font-medium text-neutral-text-secondary">{m.auteur}{m.nom ? ` · ${m.nom}` : ""}</p>
                <p className="text-caption text-neutral-text mt-0.5">{m.texte}</p>
                {m.pieces && m.pieces.length > 0 && (
                  <div className="mt-2">
                    <MediaGrid pieces={m.pieces} readOnly />
                  </div>
                )}
                <p className="text-caption-xs text-neutral-text-secondary mt-1">{formatDateTime(m.creeLe)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <MessageComposer onSubmit={onSendMessage} disabled={false} />
    </div>
  );
}
