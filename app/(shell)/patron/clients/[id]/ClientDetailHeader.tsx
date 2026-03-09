"use client";

import Link from "next/link";
import { RefreshCw, FolderKanban, FileBarChart, Receipt, StickyNote, ExternalLink } from "lucide-react";
import type { DbClient } from "@/lib/db/clients";

const SOURCE_LABELS: Record<string, string> = {
  quickbooks: "QuickBooks",
  internal: "Interne",
};

export function ClientDetailHeader({ client }: { client: DbClient }) {
  return (
    <header className="border-b border-neutral-border pb-4 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 text-neutral-text mb-0.5">{client.display_name || "Sans nom"}</h1>
          {client.company_name && (
            <p className="text-body text-neutral-text-secondary">{client.company_name}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text"
              style={{ borderRadius: "4px" }}
            >
              {SOURCE_LABELS[client.source] ?? client.source}
            </span>
            {client.internal_status && (
              <span
                className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text"
                style={{ borderRadius: "4px" }}
              >
                {client.internal_status}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
            style={{ borderRadius: "6px" }}
            aria-label="Modifier note interne"
          >
            <StickyNote size={16} strokeWidth={1.7} /> Note
          </button>
          {client.quickbooks_customer_id && (
            <span
              className="inline-flex items-center gap-1.5 h-9 px-3 text-caption text-neutral-text-secondary border border-neutral-border rounded"
              style={{ borderRadius: "6px" }}
              title={client.quickbooks_customer_id}
            >
              <ExternalLink size={14} /> QB: {client.quickbooks_customer_id.slice(0, 12)}…
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
            style={{ borderRadius: "6px" }}
            aria-label="Resynchroniser"
          >
            <RefreshCw size={16} strokeWidth={1.7} /> Resynchroniser
          </button>
          <Link
            href={`/patron/projets/nouveau?client_id=${client.id}`}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
            style={{ borderRadius: "6px" }}
          >
            <FolderKanban size={16} strokeWidth={1.7} /> Nouveau projet
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
            style={{ borderRadius: "6px" }}
            aria-label="Créer estimé (bientôt)"
          >
            <FileBarChart size={16} strokeWidth={1.7} /> Estimé
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
            style={{ borderRadius: "6px" }}
            aria-label="Créer facture (bientôt)"
          >
            <Receipt size={16} strokeWidth={1.7} /> Facture
          </button>
        </div>
      </div>
    </header>
  );
}
