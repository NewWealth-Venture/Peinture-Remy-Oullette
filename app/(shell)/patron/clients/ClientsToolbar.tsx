"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Search, Download, Plus, RefreshCw } from "lucide-react";

type Params = {
  search?: string;
  source?: string;
  status?: string;
  active?: string;
  sort?: string;
  asc?: string;
};

export function ClientsToolbar({ currentParams }: { currentParams: Params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentParams.search ?? "");

  const buildUrl = useCallback(
    (updates: Partial<Params>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") p.delete(k);
        else p.set(k, v);
      });
      const q = p.toString();
      return q ? `/patron/clients?${q}` : "/patron/clients";
    },
    [searchParams]
  );

  const applySearch = () => {
    router.push(buildUrl({ ...currentParams, search: searchInput.trim() || undefined }));
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-text-secondary" aria-hidden />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Nom, entreprise, email, tél."
            className="w-full h-9 pl-9 pr-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text placeholder:text-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-transparent"
            style={{ borderRadius: "6px" }}
            aria-label="Rechercher un client"
          />
        </div>
        <button
          type="button"
          onClick={applySearch}
          className="h-9 px-3 border border-neutral-border rounded-md text-caption font-medium text-neutral-text bg-neutral-white hover:bg-neutral-bg-subtle focus-ring"
          style={{ borderRadius: "6px" }}
        >
          Rechercher
        </button>

        <select
          value={currentParams.source ?? ""}
          onChange={(e) => router.push(buildUrl({ ...currentParams, source: e.target.value || undefined }))}
          className="h-9 px-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
          aria-label="Filtrer par source"
        >
          <option value="">Toutes les sources</option>
          <option value="quickbooks">QuickBooks</option>
          <option value="internal">Interne</option>
        </select>

        <select
          value={currentParams.status ?? ""}
          onChange={(e) => router.push(buildUrl({ ...currentParams, status: e.target.value || undefined }))}
          className="h-9 px-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
          aria-label="Statut interne"
        >
          <option value="">Tous les statuts</option>
          <option value="Nouveau">Nouveau</option>
          <option value="Actif">Actif</option>
          <option value="À relancer">À relancer</option>
          <option value="VIP">VIP</option>
          <option value="Inactif">Inactif</option>
        </select>

        <select
          value={currentParams.active ?? ""}
          onChange={(e) => router.push(buildUrl({ ...currentParams, active: e.target.value || undefined }))}
          className="h-9 px-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
          aria-label="Actif / Inactif"
        >
          <option value="">Tous</option>
          <option value="1">Actifs</option>
          <option value="0">Inactifs</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
          style={{ borderRadius: "6px" }}
          aria-label="Importer depuis QuickBooks (bientôt)"
        >
          <Download size={16} strokeWidth={1.7} /> Importer QuickBooks
        </button>
        <Link
          href="/patron/clients/nouveau"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
          style={{ borderRadius: "6px" }}
        >
          <Plus size={16} strokeWidth={1.7} /> Nouveau client
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
          style={{ borderRadius: "6px" }}
          aria-label="Synchroniser QuickBooks (bientôt)"
        >
          <RefreshCw size={16} strokeWidth={1.7} /> Synchroniser
        </button>
      </div>
    </div>
  );
}
